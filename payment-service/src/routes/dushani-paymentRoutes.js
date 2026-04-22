const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/dushani-paymentController');
const { authenticateToken } = require('../middleware/dushani-auth');

// Payment routes - ORDER MATTERS! Specific routes before parameterized routes
router.post('/initiate', authenticateToken, paymentController.initiatePayment);
router.post('/webhook/payhere', paymentController.handleWebhook);
router.post('/complete-manual', authenticateToken, paymentController.completePendingPayment);
router.post('/cancel-with-refund', authenticateToken, paymentController.cancelWithRefund);
router.get('/patient/my-payments', authenticateToken, paymentController.getPatientPayments);
router.get('/doctor/my-earnings', authenticateToken, paymentController.getDoctorEarnings);
router.get('/order/:orderId', authenticateToken, paymentController.getPaymentByOrderId);
router.get('/:paymentId/status', authenticateToken, paymentController.getPaymentStatus);
router.get('/:paymentId', authenticateToken, paymentController.getPaymentDetails);
router.post('/:paymentId/refund', authenticateToken, paymentController.processRefund);

module.exports = router;
