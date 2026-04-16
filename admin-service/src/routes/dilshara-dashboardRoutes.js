// admin-service/src/routes/dilshara-dashboardRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-dashboardController');

// GET /admin/stats  →  overall dashboard numbers
router.get('/stats', controller.getStats);

module.exports = router;