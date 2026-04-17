const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/dushani-paymentController');
const { authenticateToken } = require('../middleware/dushani-auth');

// Payment routes
router.post('/initiate', authenticateToken, paymentController.initiatePayment);
router.get('/:paymentId/status', authenticateToken, paymentController.getPaymentStatus);
router.get('/:paymentId', authenticateToken, paymentController.getPaymentDetails);
router.get('/order/:orderId', authenticateToken, paymentController.getPaymentByOrderId);
router.get('/patient/my-payments', authenticateToken, paymentController.getPatientPayments);
router.get('/doctor/my-earnings', authenticateToken, paymentController.getDoctorEarnings);
router.post('/:paymentId/refund', authenticateToken, paymentController.processRefund);
router.post('/webhook/payhere', paymentController.handleWebhook);
router.post('/cancel-with-refund', authenticateToken, paymentController.cancelWithRefund);

module.exports = router;
