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
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status
      FROM public.transactions p
      JOIN public.appointments a ON p.appointment_id = a.id
      WHERE p.id = $1
    `;
    
    const params = [paymentId];
    
    if (userRole === 'patient') {
      query += ' AND p.patient_id = $2';
      params.push(userId);
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Get patient's payment history
  async getPatientPayments(patientId, status) {
    let query = `
      SELECT p.*, 
             a.scheduled_at, a.status as appointment_status
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
    return result.rows;
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
    
    // Format order_id properly
    const order_id = `ORDER_${payment.id}`;
    
    // Amount should be in LKR with 2 decimal places (NOT multiplied by 100)
    const amount = parseFloat(payment.amount).toFixed(2);
    
    console.log('=== PayHere Config Generation ===');
    console.log('Merchant ID:', merchant_id);
    console.log('Payment ID:', payment.id);
    console.log('Order ID:', order_id);
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
        order_id: order_id,
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
    
    console.log('Final PayHere Config:', JSON.stringify(payhereConfig.payhere_config, null, 2));
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
      
      console.log('PayHere webhook received:', { order_id, status_code, status_message });
      
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
      
      // Update payment
      const paymentQuery = `
        UPDATE public.transactions 
        SET status = $1, 
            gateway_transaction_id = $2,
            payment_method = $3,
            updated_at = NOW()
        WHERE id = $4 AND status = 'PENDING'
        RETURNING *
      `;
      
      const paymentResult = await client.query(paymentQuery, [
        paymentStatus,
        order_id,
        method || 'card',
        order_id
      ]);
      
      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log('Payment already processed or not found:', order_id);
        return { error: 'Payment not found or already processed', status: 404 };
      }
      
      const payment = paymentResult.rows[0];
      
      // Handle based on payment status
      if (paymentStatus === 'SUCCESS') {
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
          console.error('Associated appointment not found:', payment.appointment_id);
          return { error: 'Associated appointment not found', status: 404 };
        }
        
        await client.query('COMMIT');
        
        console.log('Payment successful and appointment confirmed:', {
          payment_id: payment.id,
          appointment_id: payment.appointment_id
        });
        
      } else if (paymentStatus === 'FAILED') {
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
      
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
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
        LEFT JOIN public.transactions p ON a.id = p.appointment_id 
          AND p.transaction_type = 'payment'
        WHERE a.id = $1
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
      
      // Convert numeric patientId to UUID format (same as appointment-service)
      const patientIdStr = patientId.toString();
      const patientIdUuid = patientIdStr.includes('-')
        ? patientIdStr 
        : `00000000-0000-0000-0000-${patientIdStr.padStart(12, '0')}`;
      
      console.log('Payment - Patient ID (original):', patientId);
      console.log('Payment - Patient ID (UUID):', patientIdUuid);
      console.log('Payment - Appointment ID:', appointmentId);
      
      const appointmentQuery = `
        SELECT * FROM public.appointments 
        WHERE id = $1 AND patient_id = $2 AND status = 'PENDING_PAYMENT'
      `;
      const appointmentResult = await client.query(appointmentQuery, [appointmentId, patientIdUuid]);
      
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
}

module.exports = new PaymentService();
