const paymentService = require('../services/dushani-paymentService');

class PaymentController {
  // Initialize payment
  async initiatePayment(req, res) {
    try {
      const { appointment_id, amount, payment_method } = req.body;
      const patient_id = req.user.id;
      
      if (!appointment_id || !amount) {
        return res.status(400).json({ error: 'Appointment ID and amount are required' });
      }
      
      // Get appointment details
      const appointment = await paymentService.getAppointmentForPayment(appointment_id, patient_id);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found or not in PENDING_PAYMENT status' });
      }
      
      // Create payment transaction
      const payment = await paymentService.createPayment(
        appointment_id,
        patient_id,
        appointment.doctor_id,
        amount,
        payment_method
      );
      
      // Generate PayHere config
      const payhereConfig = paymentService.generatePayHereConfig(payment);
      
      res.status(201).json({
        success: true,
        message: 'Payment initiated',
        data: payhereConfig
      });
      
    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  }

  // Get payment status
  async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const payment = await paymentService.getPaymentById(paymentId, userId, userRole);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({
        success: true,
        data: payment
      });
      
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ error: 'Failed to fetch payment status' });
    }
  }

  // Get payment details
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      console.log('GetPaymentDetails - Payment ID:', paymentId);
      
      const payment = await paymentService.getPaymentById(paymentId, userId, userRole);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({
        success: true,
        data: payment
      });
      
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: 'Failed to fetch payment details' });
    }
  }

  // Get payment details by order ID (for PayHere return)
  async getPaymentByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      console.log('GetPaymentByOrderId - Order ID:', orderId);
      
      // Extract payment ID from order_id (remove "ORDER_" prefix if present)
      const paymentId = orderId.startsWith('ORDER_') 
        ? orderId.replace('ORDER_', '') 
        : orderId;
      
      console.log('Extracted Payment ID:', paymentId);
      
      const payment = await paymentService.getPaymentById(paymentId, userId, userRole);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({
        success: true,
        data: payment
      });
      
    } catch (error) {
      console.error('Get payment by order ID error:', error);
      res.status(500).json({ error: 'Failed to fetch payment details' });
    }
  }

  // Get patient's payment history
  async getPatientPayments(req, res) {
    try {
      const patient_id = req.user.id;
      const { status } = req.query;
      
      const payments = await paymentService.getPatientPayments(patient_id, status);
      
      res.json({
        success: true,
        data: payments
      });
      
    } catch (error) {
      console.error('Get patient payments error:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }

  // Get doctor's payment history (earnings)
  async getDoctorEarnings(req, res) {
    try {
      const doctor_id = req.user.id;
      const { status, startDate, endDate } = req.query;
      
      const result = await paymentService.getDoctorEarnings(doctor_id, {
        status,
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        data: result.payments,
        summary: result.summary
      });
      
    } catch (error) {
      console.error('Get doctor earnings error:', error);
      res.status(500).json({ error: 'Failed to fetch earnings' });
    }
  }

  // Process refund
  async processRefund(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const result = await paymentService.processRefund(paymentId, reason, userId, userRole);
      
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json({
        success: true,
        message: 'Payment refunded successfully',
        data: result.data
      });
      
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  }

  // PayHere webhook handler
  async handleWebhook(req, res) {
    try {
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
      const result = await paymentService.processWebhook(req.body, merchantSecret);
      
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json({ status: 'ok' });
      
    } catch (error) {
      console.error('PayHere webhook error:', error);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  }

  // Cancel appointment with refund
  async cancelWithRefund(req, res) {
    try {
      const { appointment_id, reason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (!appointment_id) {
        return res.status(400).json({ error: 'Appointment ID is required' });
      }
      
      const result = await paymentService.cancelWithRefund(
        appointment_id,
        userId,
        userRole,
        reason
      );
      
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json({
        success: true,
        message: 'Appointment cancelled with refund processed',
        data: result.data
      });
      
    } catch (error) {
      console.error('Cancel with refund error:', error);
      res.status(500).json({ error: 'Failed to cancel appointment with refund' });
    }
  }
}

module.exports = new PaymentController();
