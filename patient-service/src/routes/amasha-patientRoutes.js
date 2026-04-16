const express = require('express');
const router = express.Router();
const { syncPatientProfile } = require('../controllers/amasha-patientController');

// Sync patient profile (called from auth-service after registration)
router.post('/sync', syncPatientProfile);

module.exports = router;