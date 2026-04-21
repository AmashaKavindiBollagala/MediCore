const express = require('express');
const router = express.Router();
const { syncPatientProfile, getPatientProfile, updateProfile } = require('../controllers/amasha-patientController');
const authMiddleware = require('../middleware/amasha-auth');

// Sync patient profile (called from auth-service after registration)
router.post('/sync', syncPatientProfile);

// Get patient profile (protected)
router.get('/profile', authMiddleware, getPatientProfile);

// Update patient profile (protected)
router.post('/profile', authMiddleware, updateProfile);

module.exports = router;