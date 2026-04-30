const pool = require('../config/paymentdb');
const config = require('../config/paymentdatabase');
const { generatePayHereHash } = require('./dushani-payhereService');

class PaymentService {
  // Create a new payment transaction
  async createPayment(appointmentId, patientId, doctorId, amount, paymentMethod) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Convert numeric IDs to UUID format
      const patientIdStr = patientId.toString();
      const patientIdUuid = patientIdStr.includes('-')
        ? patientIdStr 
        : `00000000-0000-0000-0000-${patientIdStr.padStart(12, '0')}`;
      
      const doctorIdStr = doctorId.toString();
      const doctorIdUuid = doctorIdStr.includes('-')
        ? doctorIdStr 
        : `00000000-0000-0000-0000-${doctorIdStr.padStart(12, '0')}`;
      
      console.log('Payment - Creating transaction with:');
      console.log('  Appointment ID:', appointmentId);
      console.log('  Patient ID (UUID):', patientIdUuid);
      console.log('  Doctor ID (UUID):', doctorIdUuid);
      
      // Check if payment already exists for this appointment (prevent duplicates)
      const existingPaymentQuery = `
        SELECT id FROM public.transactions 
        WHERE appointment_id::text = $1
      `;
      const existingPayment = await client.query(existingPaymentQuery, [appointmentId]);
      
      if (existingPayment.rows.length > 0) {
        console.log('Payment - Returning existing payment for this appointment:', existingPayment.rows[0].id);
        await client.query('COMMIT');
        const fullQuery = `SELECT * FROM public.transactions WHERE id = $1`;
        const fullResult = await pool.query(fullQuery, [existingPayment.rows[0].id]);
        return fullResult.rows[0];
      }
      
      const paymentQuery = `
        INSERT INTO public.transactions 
          (appointment_id, patient_id, doctor_id, amount, currency, payment_method, payment_gateway, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
        RETURNING *
      `;
      
      const paymentResult = await client.query(paymentQuery, [
        appointmentId,
        patientIdUuid,
        doctorIdUuid,
        amount,
        'LKR',
        paymentMethod || 'card',
        'payhere'
      ]);
      
      await client.query('COMMIT');
      console.log('Payment - Created new transaction:', paymentResult.rows[0].id);
      return paymentResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get payment by ID with user authorization check
  async getPaymentById(paymentId, userId, userRole) {
    console.log('=== GetPaymentById START ===');
    console.log('Payment ID:', paymentId);
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    
    // Extract actual payment UUID if it has ORDER_ prefix
    const actualPaymentId = paymentId.startsWith('ORDER_') 
      ? paymentId.replace('ORDER_', '') 
      : paymentId;
    
    console.log('Actual Payment ID (after removing ORDER_):', actualPaymentId);
    
    // Convert userId to UUID format if it's numeric
    const userIdStr = userId.toString();
    const userIdUuid = userIdStr.includes('-')
      ? userIdStr 
      : `00000000-0000-0000-0000-${userIdStr.padStart(12, '0')}`;
    
    console.log('User ID (UUID format):', userIdUuid);
    
    // Try to find payment by ID first
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status, a.doctor_id, a.specialty
      FROM public.transactions p
      JOIN public.appointments a ON p.appointment_id = a.id
      WHERE p.id = $1
    `;
    
    let params = [actualPaymentId];
    
    // For patient role, we'll check authorization AFTER fetching
    // This avoids the UUID mismatch issue
    const result = await pool.query(query, params);
    
    console.log('Query result rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('Payment not found by ID:', actualPaymentId);
      console.log('=== GetPaymentById END - NOT FOUND ===');
      return null;
    }
    
    const payment = result.rows[0];
    console.log('Payment found:', payment.id);
    console.log('Payment patient_id:', payment.patient_id);
    console.log('Payment doctor_id:', payment.doctor_id);
    
    // Now check authorization
    if (userRole === 'patient') {
      // Check if patient_id matches (try both formats)
      const patientMatches = 
        payment.patient_id === userId || 
        payment.patient_id === userIdUuid ||
        payment.patient_id === userIdStr;
      
      if (!patientMatches) {
        console.log('Authorization failed - patient_id mismatch');
        console.log('Expected:', userId, 'or', userIdUuid);
        console.log('Got:', payment.patient_id);
        console.log('=== GetPaymentById END - UNAUTHORIZED ===');
        return null;
      }
      
      console.log('Authorization successful');
    }
    
    // Enrich with doctor details
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${payment.doctor_id}`);
      
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        const doctor = doctorData.success ? doctorData.data : doctorData;
        
        payment.doctor_name = doctor.full_name || (doctor.first_name + ' ' + doctor.last_name);
        payment.doctor_specialty = doctor.specialty;
        payment.doctor_photo = doctor.profile_photo_url;
        
        console.log('Doctor details enriched:', payment.doctor_name);
      } else {
        console.error('Failed to fetch doctor details, status:', doctorResponse.status);
        payment.doctor_name = 'Unknown Doctor';
      }
    } catch (err) {
      console.error('Error fetching doctor details for payment:', err.message);
      payment.doctor_name = 'Unknown Doctor';
    }
    
    console.log('=== GetPaymentById END - SUCCESS ===');
    return payment;
  }

  // Get payment by appointment_id with user authorization check
  async getPaymentByAppointmentId(appointmentId, userId, userRole) {
    console.log('=== GetPaymentByAppointmentId START ===');
    console.log('Appointment ID:', appointmentId);
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    
    // Convert userId to UUID format if it's numeric
    const userIdStr = userId.toString();
    const userIdUuid = userIdStr.includes('-')
      ? userIdStr 
      : `00000000-0000-0000-0000-${userIdStr.padStart(12, '0')}`;
    
    console.log('User ID (UUID format):', userIdUuid);
    
    // Find payment by appointment_id
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status, a.doctor_id, a.specialty
      FROM public.transactions p
      JOIN public.appointments a ON p.appointment_id::text = a.id::text
      WHERE p.appointment_id::text = $1
    `;
    
    const result = await pool.query(query, [appointmentId]);
    
    console.log('Query result rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('Payment not found for appointment_id:', appointmentId);
      console.log('=== GetPaymentByAppointmentId END - NOT FOUND ===');
      return null;
    }
    
    const payment = result.rows[0];
    console.log('Payment found:', payment.id);
    console.log('Payment patient_id:', payment.patient_id);
    console.log('Payment doctor_id:', payment.doctor_id);
    
    // Check authorization
    if (userRole === 'patient') {
      // Check if patient_id matches (try both formats)
      const patientMatches = 
        payment.patient_id === userId || 
        payment.patient_id === userIdUuid ||
        payment.patient_id === userIdStr;
      
      if (!patientMatches) {
        console.log('Authorization failed - patient_id mismatch');
        console.log('Expected:', userId, 'or', userIdUuid);
        console.log('Got:', payment.patient_id);
        console.log('=== GetPaymentByAppointmentId END - UNAUTHORIZED ===');
        return null;
      }
      
      console.log('Authorization successful');
    }
    
    // Enrich with doctor details
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      console.log('[getPaymentByAppointmentId] Fetching doctor details from:', `${doctorServiceUrl}/doctors/${payment.doctor_id}`);
      console.log('[getPaymentByAppointmentId] Doctor ID:', payment.doctor_id);
      
      const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${payment.doctor_id}`);
      
      console.log('[getPaymentByAppointmentId] Doctor response status:', doctorResponse.status);
      
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        console.log('[getPaymentByAppointmentId] Doctor data received:', JSON.stringify(doctorData, null, 2));
        
        const doctor = doctorData.success ? doctorData.data : doctorData;
        
        payment.doctor_name = doctor.full_name || (doctor.first_name + ' ' + doctor.last_name);
        payment.doctor_specialty = doctor.specialty;
        payment.doctor_photo = doctor.profile_photo_url;
        
        console.log('[getPaymentByAppointmentId] ✅ Doctor details enriched:', payment.doctor_name, payment.doctor_specialty);
      } else {
        console.error('[getPaymentByAppointmentId] ❌ Failed to fetch doctor details, status:', doctorResponse.status);
        const errorText = await doctorResponse.text();
        console.error('[getPaymentByAppointmentId] Error response:', errorText);
        payment.doctor_name = 'Unknown Doctor';
        payment.doctor_specialty = payment.specialty || 'General';
      }
    } catch (err) {
      console.error('[getPaymentByAppointmentId] ❌ Error fetching doctor details for payment:', err.message);
      console.error('[getPaymentByAppointmentId] Error stack:', err.stack);
      payment.doctor_name = 'Unknown Doctor';
      payment.doctor_specialty = payment.specialty || 'General';
    }
    
    console.log('=== GetPaymentByAppointmentId END - SUCCESS ===');
    return payment;
  }

  // Get patient's payment history
  async getPatientPayments(patientId, status) {
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status, a.doctor_id, a.specialty
      FROM public.transactions p
      JOIN public.appointments a ON p.appointment_id = a.id
      WHERE p.patient_id = $1 AND p.transaction_type = 'payment'
    `;
    
    const params = [patientId];
    
    if (status) {
      query += ' AND p.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    const payments = result.rows;
    
    // Enrich each payment with doctor details
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
    
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${payment.doctor_id}`);
          
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            const doctor = doctorData.success ? doctorData.data : doctorData;
            
            return {
              ...payment,
              doctor_name: doctor.full_name || (doctor.first_name + ' ' + doctor.last_name),
              doctor_specialty: doctor.specialty,
              doctor_photo: doctor.profile_photo_url,
            };
          }
        } catch (err) {
          console.error('Error fetching doctor details for payment:', err.message);
        }
        
        return {
          ...payment,
          doctor_name: payment.doctor_name || 'Unknown Doctor',
        };
      })
    );
    
    return enrichedPayments;
  }

  // Get doctor's payment history (earnings)
  async getDoctorEarnings(doctorId, filters) {
    const { status, startDate, endDate } = filters;
    
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status
      FROM public.transactions p
      JOIN public.appointments a ON p.appointment_id = a.id
      WHERE p.doctor_id = $1 AND p.transaction_type = 'payment'
    `;
    
    const params = [doctorId];
    
    if (status) {
      query += ' AND p.status = $' + (params.length + 1);
      params.push(status);
    }
    
    if (startDate) {
      query += ' AND p.created_at >= $' + (params.length + 1);
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND p.created_at <= $' + (params.length + 1);
      params.push(endDate);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Calculate total earnings
    const totalQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_earnings,
             COUNT(*) as total_transactions
      FROM public.transactions
      WHERE doctor_id = $1 AND status = 'SUCCESS' AND transaction_type = 'payment'
    `;
    
    const totalResult = await pool.query(totalQuery, [doctorId]);
    
    return {
      payments: result.rows,
      summary: totalResult.rows[0]
    };
  }

  // Generate PayHere checkout configuration
  generatePayHereConfig(payment) {
    const merchant_id = config.payhere.merchantId;
    const merchant_secret = config.payhere.merchantSecret;
    const currency = 'LKR';
    
    // Use appointment_id as the order_id (this is the unique identifier)
    const order_id = `ORDER_${payment.appointment_id}`;
    
    // Amount should be in LKR with 2 decimal places (NOT multiplied by 100)
    const amount = parseFloat(payment.amount).toFixed(2);
    
    console.log('=== PayHere Config Generation ===');
    console.log('Payment ID:', payment.id);
    console.log('Appointment ID:', payment.appointment_id);
    console.log('Order ID (will be sent to PayHere):', order_id);
    console.log('Merchant ID:', merchant_id);
    console.log('Amount:', amount);
    console.log('Currency:', currency);
    console.log('Sandbox Mode:', config.payhere.sandbox);
    console.log('Checkout URL:', config.payhere.checkoutUrl);
    
    const hash = generatePayHereHash(merchant_id, order_id, amount, currency, merchant_secret);
    
    const payhereConfig = {
      payment_id: payment.id,
      appointment_id: payment.appointment_id,
      amount: payment.amount,
      currency: payment.currency,
      payhere_config: {
        url: config.payhere.checkoutUrl,
        merchant_id: merchant_id,
        order_id: order_id, // Send ORDER_<appointment_id> to PayHere
        amount: amount,
        currency: currency,
        hash: hash,
        return_url: `${config.frontendUrl}/payment/success`,
        cancel_url: `${config.frontendUrl}/payment/cancel`,
        notify_url: `${config.backendUrl}/api/payments/webhook/payhere`,
        // Customer information (required by PayHere)
        first_name: 'Patient',
        last_name: 'User',
        email: 'patient@medicare.lk',
        phone: '+94771234567',
        address: 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka',
        // Order details
        items: 'Doctor Appointment Consultation'
      }
    };
    
    console.log('Final PayHere Config - Order ID:', payhereConfig.payhere_config.order_id);
    console.log('================================');
    
    return payhereConfig;
  }

  // Process refund for a payment
  async processRefund(paymentId, reason, userId, userRole) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const paymentQuery = `
        SELECT p.*, a.cancelled_by 
        FROM public.transactions p
        JOIN public.appointments a ON p.appointment_id = a.id
        WHERE p.id = $1
      `;
      const paymentResult = await client.query(paymentQuery, [paymentId]);
      
      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { error: 'Payment not found', status: 404 };
      }
      
      const payment = paymentResult.rows[0];
      
      // Authorization check
      if (userRole !== 'admin') {
        if (userRole === 'doctor' && payment.doctor_id !== userId) {
          await client.query('ROLLBACK');
          return { error: 'Not authorized to refund this payment', status: 403 };
        }
        if (userRole === 'patient' && payment.patient_id !== userId) {
          await client.query('ROLLBACK');
          return { error: 'Not authorized to refund this payment', status: 403 };
        }
      }
      
      if (payment.status !== 'SUCCESS') {
        await client.query('ROLLBACK');
        return { error: 'Only successful payments can be refunded', status: 400 };
      }
      
      if (payment.transaction_type === 'refund') {
        await client.query('ROLLBACK');
        return { error: 'This payment has already been refunded', status: 400 };
      }
      
      // Update payment status
      const updatePaymentQuery = `
        UPDATE public.transactions 
        SET status = 'REFUNDED', 
            refund_reason = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const updateResult = await client.query(updatePaymentQuery, [paymentId, reason || 'Appointment cancelled']);
      
      // Update appointment status
      const updateAppointmentQuery = `
        UPDATE public.appointments 
        SET status = 'CANCELLED', 
            updated_at = NOW()
        WHERE id = $1 AND status NOT IN ('CANCELLED', 'REJECTED')
      `;
      
      await client.query(updateAppointmentQuery, [payment.appointment_id]);
      
      await client.query('COMMIT');
      
      return { success: true, data: updateResult.rows[0] };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Process PayHere webhook
  async processWebhook(webhookData, merchantSecret) {
    const client = await pool.connect();
    const { verifyPayHereWebhook } = require('./dushani-payhereService');
    
    try {
      const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
        method,
        status_message
      } = webhookData;
      
      console.log('=== PayHere Webhook Processing ===');
      console.log('Webhook received:', { order_id, status_code, status_message });
      console.log('Full webhook data:', webhookData);
      
      // Verify signature
      if (!verifyPayHereWebhook(webhookData, merchantSecret)) {
        console.error('PayHere webhook signature verification failed');
        return { error: 'Invalid signature', status: 400 };
      }
      
      await client.query('BEGIN');
      
      // Determine payment status
      let paymentStatus;
      if (status_code === '2') {
        paymentStatus = 'SUCCESS';
      } else if (status_code === '0') {
        paymentStatus = 'PENDING';
      } else {
        paymentStatus = 'FAILED';
      }
      
      console.log('Determined payment status:', paymentStatus);
      
      // Extract appointment_id from order_id (remove "ORDER_" prefix)
      let appointmentId = order_id;
      if (order_id.startsWith('ORDER_')) {
        appointmentId = order_id.replace('ORDER_', '');
        console.log('Extracted appointment_id from order_id:', appointmentId);
      }
      
      // Find payment by appointment_id (ONE appointment = ONE transaction)
      const paymentQuery = `
        UPDATE public.transactions 
        SET status = $1, 
            gateway_transaction_id = $2,
            payment_method = $3,
            updated_at = NOW()
        WHERE appointment_id::text = $4
        RETURNING *
      `;
      
      const paymentResult = await client.query(paymentQuery, [
        paymentStatus,
        order_id,
        method || 'card',
        appointmentId
      ]);
      
      console.log('Payment lookup result:', paymentResult.rows.length, 'rows found');
      
      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.error('Payment not found for appointment_id:', appointmentId);
        
        // Debug: Check if appointment exists
        const debugQuery = `SELECT id, status FROM public.appointments WHERE id::text = $1`;
        const debugResult = await pool.query(debugQuery, [appointmentId]);
        if (debugResult.rows.length > 0) {
          console.error('Appointment exists with status:', debugResult.rows[0].status);
          
          // Check if transaction exists
          const txnQuery = `SELECT * FROM public.transactions WHERE appointment_id::text = $1`;
          const txnResult = await pool.query(txnQuery, [appointmentId]);
          if (txnResult.rows.length === 0) {
            console.error('No transaction found for this appointment - payment may not have been initiated');
          } else {
            console.error('Transaction exists:', txnResult.rows[0]);
          }
        } else {
          console.error('Appointment does not exist in database');
        }
        
        return { error: 'Payment not found', status: 404 };
      }
      
      const payment = paymentResult.rows[0];
      console.log('Payment found and updated:', payment.id, 'Appointment:', payment.appointment_id, 'New status:', payment.status);
      
      // Handle based on payment status
      if (paymentStatus === 'SUCCESS') {
        console.log('Processing successful payment for appointment:', payment.appointment_id);
        
        const appointmentQuery = `
          UPDATE public.appointments 
          SET status = 'CONFIRMED', 
              payment_id = $1,
              updated_at = NOW()
          WHERE id = $2 AND status = 'PENDING_PAYMENT'
          RETURNING *
        `;
        
        const appointmentResult = await client.query(appointmentQuery, [
          payment.id,
          payment.appointment_id
        ]);
        
        if (appointmentResult.rows.length === 0) {
          await client.query('ROLLBACK');
          console.error('Associated appointment not found or not in PENDING_PAYMENT status:', payment.appointment_id);
          return { error: 'Associated appointment not found', status: 404 };
        }
        
        await client.query('COMMIT');
        
        console.log('Payment successful and appointment confirmed:', {
          payment_id: payment.id,
          appointment_id: payment.appointment_id
        });
        
        // ─── TRIGGER NOTIFICATIONS ──────────────────────────────────────
        // Send notifications asynchronously (don't block the webhook response)
        setImmediate(async () => {
          try {
            console.log('📧 Triggering payment success notifications...');
            
            const appointment = appointmentResult.rows[0];
            const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
            const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
            
            // Fetch patient info from auth-service
            let patientInfo = null;
            try {
              const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${appointment.patient_id}`);
              if (patientRes.ok) {
                patientInfo = await patientRes.json();
                console.log('✅ Patient info fetched:', patientInfo.email, patientInfo.phone);
              }
            } catch (err) {
              console.error('❌ Failed to fetch patient info:', err.message);
            }
            
            // Fetch doctor info from doctor-service
            let doctorInfo = null;
            try {
              const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
              if (doctorRes.ok) {
                const doctorData = await doctorRes.json();
                doctorInfo = doctorData.success ? doctorData.data : doctorData;
                console.log('✅ Doctor info fetched:', doctorInfo.email, doctorInfo.phone);
              }
            } catch (err) {
              console.error('❌ Failed to fetch doctor info:', err.message);
            }
            
            // Parse appointment date and time
            const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const appointmentTime = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            // Send notification request
            if (patientInfo || doctorInfo) {
              const notificationRes = await fetch(`${notificationServiceUrl}/api/notifications/payment-success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  patientEmail: patientInfo?.email,
                  patientPhone: patientInfo?.phone,
                  patientName: patientInfo?.name || appointment.patient_name,
                  doctorEmail: doctorInfo?.email,
                  doctorPhone: doctorInfo?.phone,
                  doctorName: doctorInfo?.full_name || doctorInfo?.first_name + ' ' + doctorInfo?.last_name || 'Doctor',
                  appointmentId: appointment.id,
                  appointmentDate,
                  appointmentTime,
                  amount: payment.amount
                })
              });
              
              if (notificationRes.ok) {
                const notificationResult = await notificationRes.json();
                console.log('✅ Notifications sent successfully:', notificationResult);
              } else {
                console.error('❌ Failed to send notifications:', await notificationRes.text());
              }
            }
          } catch (err) {
            console.error('❌ Notification trigger error:', err.message);
            console.error(err.stack);
          }
        });
        
      } else if (paymentStatus === 'FAILED') {
        console.log('Processing failed payment:', payment.id);
        
        const appointmentQuery = `
          UPDATE public.appointments 
          SET status = 'CANCELLED', 
              updated_at = NOW()
          WHERE id = $1 AND status = 'PENDING_PAYMENT'
        `;
        
        await client.query(appointmentQuery, [payment.appointment_id]);
        await client.query('COMMIT');
        
        console.log('Payment failed:', {
          payment_id: payment.id,
          reason: status_message
        });
        
      } else {
        await client.query('COMMIT');
        console.log('Payment pending:', order_id);
      }
      
      console.log('=== Webhook Processing Complete ===');
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Webhook processing error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancel appointment with refund
  async cancelWithRefund(appointmentId, userId, userRole, reason) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const appointmentQuery = `
        SELECT a.*, p.status as payment_status, p.id as payment_id
        FROM public.appointments a
        LEFT JOIN public.transactions p ON a.id::text = p.appointment_id::text 
          AND p.transaction_type = 'payment'
        WHERE a.id::text = $1
      `;
      const appointmentResult = await client.query(appointmentQuery, [appointmentId]);
      
      if (appointmentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { error: 'Appointment not found', status: 404 };
      }
      
      const appointment = appointmentResult.rows[0];
      
      // Verify authorization
      if (userRole === 'patient' && appointment.patient_id !== userId) {
        await client.query('ROLLBACK');
        return { error: 'Not authorized', status: 403 };
      }
      
      if (userRole === 'doctor' && appointment.doctor_id !== userId) {
        await client.query('ROLLBACK');
        return { error: 'Not authorized', status: 403 };
      }
      
      // Process refund if payment exists and is successful
      if (appointment.payment_id && appointment.payment_status === 'SUCCESS') {
        const updatePaymentQuery = `
          UPDATE public.transactions 
          SET status = 'REFUNDED',
              refund_reason = $2,
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `;
        
        const refundReason = userRole === 'doctor' 
          ? 'Cancelled by doctor' 
          : 'Cancelled by patient';
        
        await client.query(updatePaymentQuery, [appointment.payment_id, refundReason]);
        
        console.log('Refund processed for payment:', appointment.payment_id);
      }
      
      // Update appointment status
      const updateAppointmentQuery = `
        UPDATE public.appointments 
        SET status = 'CANCELLED',
            cancelled_by = $2,
            cancellation_reason = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const cancellationReason = reason || 
        (userRole === 'doctor' ? 'Cancelled by doctor' : 'Cancelled by patient');
      
      const result = await client.query(updateAppointmentQuery, [
        appointmentId,
        userRole,
        cancellationReason
      ]);
      
      await client.query('COMMIT');
      
      return { success: true, data: result.rows[0] };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get appointment details for payment
  async getAppointmentForPayment(appointmentId, patientId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Use the patient ID as-is (auth-service uses integer IDs, not UUIDs)
      const finalPatientId = patientId.toString();
      
      console.log('Payment - Patient ID:', finalPatientId);
      console.log('Payment - Appointment ID:', appointmentId);
      
      const appointmentQuery = `
        SELECT * FROM public.appointments 
        WHERE id = $1 AND patient_id = $2 AND status = 'PENDING_PAYMENT'
      `;
      const appointmentResult = await client.query(appointmentQuery, [appointmentId, finalPatientId]);
      
      if (appointmentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      await client.query('COMMIT');
      return appointmentResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Complete pending payment (auto-complete for localhost development)
  async completePendingPayment(appointmentId, userId, userRole) {
    const client = await pool.connect();
    
    try {
      console.log('=== Completing Pending Payment ===');
      console.log('Appointment ID:', appointmentId);
      
      await client.query('BEGIN');
      
      // Find the pending transaction for this appointment
      const transactionQuery = `
        SELECT t.*, a.patient_id, a.doctor_id, a.status as appointment_status
        FROM public.transactions t
        JOIN public.appointments a ON t.appointment_id::text = a.id::text
        WHERE t.appointment_id::text = $1 AND t.status = 'PENDING' AND t.transaction_type = 'payment'
      `;
      
      const transactionResult = await client.query(transactionQuery, [appointmentId]);
      
      if (transactionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        
        // Check if payment is already completed
        const checkQuery = `
          SELECT t.status, a.status as appointment_status
          FROM public.transactions t
          JOIN public.appointments a ON t.appointment_id::text = a.id::text
          WHERE t.appointment_id::text = $1
        `;
        const checkResult = await pool.query(checkQuery, [appointmentId]);
        
        if (checkResult.rows.length > 0) {
          if (checkResult.rows[0].status === 'SUCCESS') {
            return { error: 'Payment already completed', status: 400, alreadyDone: true };
          }
        }
        
        return { error: 'No pending payment found for this appointment', status: 404 };
      }
      
      const transaction = transactionResult.rows[0];
      
      console.log('Found pending transaction:', transaction.id);
      console.log('Updating to SUCCESS...');
      
      // Update transaction to SUCCESS
      const updateTransactionQuery = `
        UPDATE public.transactions 
        SET status = 'SUCCESS',
            gateway_transaction_id = $1,
            payment_method = COALESCE(payment_method, 'card'),
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      
      const gatewayTransactionId = `ORDER_${appointmentId}`;
      const updatedTransaction = await client.query(updateTransactionQuery, [
        gatewayTransactionId,
        transaction.id
      ]);
      
      console.log('Transaction updated to SUCCESS');
      
      // Update appointment to CONFIRMED
      const updateAppointmentQuery = `
        UPDATE public.appointments 
        SET status = 'CONFIRMED',
            payment_id = $1,
            updated_at = NOW()
        WHERE id = $2 AND status = 'PENDING_PAYMENT'
        RETURNING *
      `;
      
      const updatedAppointment = await client.query(updateAppointmentQuery, [
        transaction.id,
        appointmentId
      ]);
      
      if (updatedAppointment.rows.length > 0) {
        console.log('Appointment updated to CONFIRMED');
      } else {
        console.log('Appointment was not in PENDING_PAYMENT status (may already be confirmed)');
      }
      
      await client.query('COMMIT');
      
      console.log('=== Payment Completed Successfully ===');
      
      // Send payment success notifications asynchronously
      setImmediate(async () => {
        try {
          console.log('📧 Triggering payment success notifications...');
          
          const appointment = updatedAppointment.rows[0] || transaction;
          const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000';
          const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
          const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
          
          // Fetch patient info from auth-service
          let patientInfo = null;
          try {
            const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${appointment.patient_id || userId}`);
            if (patientRes.ok) {
              patientInfo = await patientRes.json();
              console.log('✅ Patient info fetched:', patientInfo.email);
            }
          } catch (err) {
            console.error('❌ Failed to fetch patient info:', err.message);
          }
          
          // Fetch doctor info from doctor-service
          let doctorInfo = null;
          try {
            const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
            if (doctorRes.ok) {
              doctorInfo = await doctorRes.json();
              console.log('✅ Doctor info fetched:', doctorInfo.email, doctorInfo.full_name);
            }
          } catch (err) {
            console.error('❌ Failed to fetch doctor info:', err.message);
          }
          
          // Parse appointment date and time
          const appointmentDate = new Date(appointment.scheduled_at || new Date()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const appointmentTime = new Date(appointment.scheduled_at || new Date()).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Send notification request
          if (patientInfo || doctorInfo) {
            const notificationRes = await fetch(`${notificationServiceUrl}/api/notifications/payment-success`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientEmail: patientInfo?.email,
                patientPhone: patientInfo?.phone,
                patientName: patientInfo?.name || 'Patient',
                doctorEmail: doctorInfo?.email,
                doctorPhone: doctorInfo?.phone,
                doctorName: doctorInfo?.full_name || doctorInfo?.first_name + ' ' + doctorInfo?.last_name || 'Doctor',
                appointmentId: appointmentId,
                appointmentDate,
                appointmentTime,
                amount: transaction.amount
              })
            });
            
            if (notificationRes.ok) {
              const notificationResult = await notificationRes.json();
              console.log('✅ Payment notifications sent successfully:', notificationResult);
            } else {
              console.error('❌ Failed to send payment notifications:', await notificationRes.text());
            }
          }
        } catch (err) {
          console.error('❌ Payment notification trigger error:', err.message);
          console.error(err.stack);
        }
      });
      
      return {
        success: true,
        data: {
          transaction: updatedTransaction.rows[0],
          appointment: updatedAppointment.rows[0]
        }
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error completing payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new PaymentService();
