// admin-service/src/routes/dilshara-paymentsRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-paymentsController');

// GET /admin/payments/summary  →  stub until payments team is ready
router.get('/summary', controller.getPaymentsSummary);

module.exports = router;