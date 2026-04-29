const express = require('express');
const router = express.Router();
const pool = require('../config/kaveesha-doctorPool');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  console.log('[getDoctorProfileId] Looking for user_id:', userId);
  
  // First try: look for user_id
  let result = await pool.query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length > 0) {
    console.log('[getDoctorProfileId] Found profile with user_id:', result.rows[0].id);
    return result.rows[0].id;
  }
  
  // Fallback: check if userId is itself a profile id
  console.log('[getDoctorProfileId] user_id not found, checking if userId is a profile id');
  const checkResult = await pool.query(
    'SELECT id FROM profiles WHERE id = $1',
    [userId]
  );
  
  if (checkResult.rows.length > 0) {
    console.log('[getDoctorProfileId] userId is a profile id:', checkResult.rows[0].id);
    return checkResult.rows[0].id;
  }
  
  console.log('[getDoctorProfileId] No profile found for userId:', userId);
  return null;
};

const {
  registerDoctor, getMyProfile, updateMyProfile,
  listDoctors, getDoctorById,
  adminListDoctors, verifyDoctor,
} = require('../controllers/kaveesha-doctorController');

const {
  addAvailabilitySlot, getMyAvailability, getDoctorAvailability,
  removeAvailabilitySlot, deleteAvailabilityBySlot, updateAvailabilitySlot,
  addExceptionDate, getExceptionDates,
  updateExceptionDate, removeExceptionDate,
} = require('../controllers/kaveesha-availabilityController');

const {
  getMyAppointments, confirmAppointment, rejectAppointment,
  completeAppointment, getAppointmentById,
} = require('../controllers/kaveesha-appointmentController');

const {
  issuePrescription, getMyPrescriptions, getPrescriptionById,
  getPrescriptionsByAppointment, updatePrescription, getPatientPrescriptions,
  getPatientPrescriptionsByUserId,
} = require('../controllers/kaveesha-prescriptionController');

const {
  uploadPatientReport, getMyPatientReports, getReportById,
  getReportsByAppointment, deleteReport,
} = require('../controllers/kaveesha-reportController');

const {
  generateVideoRoom, getVideoRoomByAppointment,
} = require('../controllers/kaveesha-telemedicineController');

const { authenticate, requireDoctor, requireAdmin, requireDoctorOrAdmin } =
  require('../middleware/kaveesha-roleMiddleware');

const { doctorRegisterUpload, reportUpload, handleUpload } =
  require('../middleware/kaveesha-uploadMiddleware');

const { validateDoctorRegistration, validateAvailability } =
  require('../middleware/kaveesha-validationMiddleware');

// ── Public routes ──────────────────────────────────────────────────────────────
router.get('/', listDoctors);                          // GET  /doctors

// ── Doctor: register own profile (PUBLIC - No auth required) ──────────────────
router.post(
  '/register',
  handleUpload(doctorRegisterUpload),
  validateDoctorRegistration,
  registerDoctor
);

// ── Doctor: manage own profile ─────────────────────────────────────────────────
router.get('/me/profile', authenticate, requireDoctor, getMyProfile);
router.put('/me/profile', authenticate, requireDoctor, updateMyProfile);

// ── Doctor: manage own availability (MUST be before /:id routes) ──────────────
router.get('/me/availability', authenticate, requireDoctor, getMyAvailability);
router.post(
  '/me/availability',
  authenticate, requireDoctor, validateAvailability,
  addAvailabilitySlot
);
router.put('/me/availability/:slotId', authenticate, requireDoctor, updateAvailabilitySlot);
router.delete('/me/availability/:slotId', authenticate, requireDoctor, removeAvailabilitySlot);
router.get('/me/availability/exceptions', authenticate, requireDoctor, getExceptionDates);
router.post('/me/availability/block', authenticate, requireDoctor, addExceptionDate);
router.put('/me/availability/exceptions/:exceptionId', authenticate, requireDoctor, updateExceptionDate);
router.delete('/me/availability/exceptions/:exceptionId', authenticate, requireDoctor, removeExceptionDate);

// ── Doctor: manage appointments ───────────────────────────────────────────────
router.get('/me/appointments', authenticate, requireDoctor, getMyAppointments);
router.get('/me/appointments/:id', authenticate, requireDoctor, getAppointmentById);
router.patch('/me/appointments/:id/confirm', authenticate, requireDoctor, confirmAppointment);
router.patch('/me/appointments/:id/reject', authenticate, requireDoctor, rejectAppointment);
router.patch('/me/appointments/:id/complete', authenticate, requireDoctor, completeAppointment);

// ── Doctor: manage prescriptions ──────────────────────────────────────────────
router.post('/me/prescriptions', authenticate, requireDoctor, issuePrescription);
router.get('/me/prescriptions', authenticate, requireDoctor, getMyPrescriptions);
// IMPORTANT: More specific routes MUST come before parameterized routes
router.get('/me/prescriptions/appointment/:appointmentId', authenticate, requireDoctor, getPrescriptionsByAppointment);
router.get('/me/prescriptions/:id', authenticate, requireDoctor, getPrescriptionById);
router.put('/me/prescriptions/:id', authenticate, requireDoctor, updatePrescription);
router.patch('/me/prescriptions/appointment/:appointmentId/finish', authenticate, requireDoctor, async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId) {
    return res.status(404).json({ error: 'Doctor profile not found' });
  }
  
  try {
    // Check if appointment already has prescriptions
    const checkResult = await pool.query(
      'SELECT id FROM prescriptions WHERE appointment_id = $1 AND doctor_id = $2 LIMIT 1',
      [req.params.appointmentId, doctorId]
    );
    
    if (checkResult.rows.length > 0) {
      // Update existing prescriptions
      await pool.query(
        'UPDATE prescriptions SET is_finished = TRUE WHERE appointment_id = $1 AND doctor_id = $2',
        [req.params.appointmentId, doctorId]
      );
    } else {
      // Create a dummy prescription record to track finished status
      await pool.query(
        `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, prescription_data, notes, is_finished) 
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [req.params.appointmentId, doctorId, '00000000-0000-0000-0000-000000000000', '{"medications": []}', 'Finished consultation tracking record']
      );
    }
    
    res.json({ 
      message: 'Appointment marked as finished',
      appointment_id: req.params.appointmentId
    });
  } catch (err) {
    console.error('[markAppointmentFinished]', err);
    res.status(500).json({ error: err.message });
  }
});
router.delete('/me/prescriptions/:id', authenticate, requireDoctor, async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId) {
    return res.status(404).json({ error: 'Doctor profile not found' });
  }
  
  try {
    const result = await pool.query('DELETE FROM prescriptions WHERE id = $1 AND doctor_id = $2 RETURNING *', [req.params.id, doctorId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found or not authorized' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('[deletePrescription]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Patient: get their prescriptions ──────────────────────────────────────────
router.get('/patients/:patientId/prescriptions', getPatientPrescriptions);
router.get('/patients/user/:userId/prescriptions', getPatientPrescriptionsByUserId);

// ── Doctor: manage reports ────────────────────────────────────────────────────
router.get('/me/reports', authenticate, requireDoctor, getMyPatientReports);

// ── Public routes with parameters (MUST be after /me/* routes) ────────────────
router.get('/:id', getDoctorById);                     // GET  /doctors/:id
router.get('/:id/availability', getDoctorAvailability);// GET  /doctors/:id/availability
router.delete('/:id/availability/delete-by-slot', deleteAvailabilityBySlot); // DELETE /doctors/:id/availability/delete-by-slot

// ── Doctor: manage patient reports ────────────────────────────────────────────
router.post('/me/reports/upload', authenticate, requireDoctor, reportUpload.single('report_file'), uploadPatientReport);
router.get('/me/reports', authenticate, requireDoctor, getMyPatientReports);
// IMPORTANT: More specific routes MUST come before parameterized routes
router.get('/me/reports/appointment/:appointmentId', authenticate, requireDoctor, getReportsByAppointment);
router.get('/me/reports/:id', authenticate, requireDoctor, getReportById);
router.delete('/me/reports/:id', authenticate, requireDoctor, deleteReport);

// ── Doctor: telemedicine/video calls ──────────────────────────────────────────
router.post('/me/telemedicine/generate-room', authenticate, requireDoctor, generateVideoRoom);
router.get('/me/telemedicine/appointment/:appointmentId', authenticate, requireDoctor, getVideoRoomByAppointment);

// ── Admin routes ───────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireAdmin, adminListDoctors);
router.patch('/admin/:id/verify', authenticate, requireAdmin, verifyDoctor);

module.exports = router;