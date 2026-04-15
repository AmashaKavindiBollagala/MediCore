// admin-service/src/routes/dilshara-appointmentsRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-appointmentsController');

// GET /admin/appointments/summary  →  stub until doctor-service team is ready
router.get('/summary', controller.getAppointmentsSummary);

module.exports = router;