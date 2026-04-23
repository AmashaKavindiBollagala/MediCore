// admin-service/src/routes/dilshara-paymentsRoutes.js
const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/dilshara-paymentsController');

// Payment overview routes
router.get('/stats', paymentsController.getPaymentStats);
router.get('/transactions', paymentsController.getTransactions);
router.get('/analytics', paymentsController.getAnalytics);
router.get('/:id', paymentsController.getTransactionById);

module.exports = router;
