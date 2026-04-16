const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  getPendingDoctors,
  verifyDoctor,
  getDoctorVerificationStatus,
} = require('../controllers/kaveesha-doctorRegistrationController');
const { doctorRegisterUpload, handleUpload } = require('../middleware/kaveesha-uploadMiddleware');
const { validateDoctorRegistration } = require('../middleware/kaveesha-doctorRegistrationValidator');

// ─── Public Routes ───────────────────────────────────────────────────────────

// POST /api/doctors/register - Register a new doctor
router.post(
  '/register',
  handleUpload(doctorRegisterUpload),
  validateDoctorRegistration,
  registerDoctor
);

// ─── Admin Service Routes (Internal API calls) ───────────────────────────────

// GET /api/doctors/pending - Get all pending doctor registrations
router.get('/pending', getPendingDoctors);

// PUT /api/doctors/:doctor_id/verify - Approve or reject a doctor
router.put('/:doctor_id/verify', verifyDoctor);

// ─── Auth Service Route (Internal API call) ──────────────────────────────────

// GET /api/doctors/verification/:email - Check doctor verification status
router.get('/verification/:email', getDoctorVerificationStatus);

module.exports = router;
