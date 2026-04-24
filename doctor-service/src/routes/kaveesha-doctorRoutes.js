const express = require('express');
const router = express.Router();
const pool = require('../config/kaveesha-doctorPool');

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
router.get('/me/prescriptions/:id', authenticate, requireDoctor, getPrescriptionById);
router.get('/me/prescriptions/appointment/:appointmentId', authenticate, requireDoctor, getPrescriptionsByAppointment);
router.put('/me/prescriptions/:id', authenticate, requireDoctor, updatePrescription);
router.delete('/me/prescriptions/:id', authenticate, requireDoctor, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prescriptions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('[deletePrescription]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Patient: get their prescriptions ──────────────────────────────────────────
router.get('/patients/:patientId/prescriptions', getPatientPrescriptions);

// ── Doctor: manage reports ────────────────────────────────────────────────────
router.get('/me/reports', authenticate, requireDoctor, getMyPatientReports);

// ── Public routes with parameters (MUST be after /me/* routes) ────────────────
router.get('/:id', getDoctorById);                     // GET  /doctors/:id
router.get('/:id/availability', getDoctorAvailability);// GET  /doctors/:id/availability
router.delete('/:id/availability/delete-by-slot', deleteAvailabilityBySlot); // DELETE /doctors/:id/availability/delete-by-slot

// ── Doctor: manage patient reports ────────────────────────────────────────────
router.post('/me/reports/upload', authenticate, requireDoctor, reportUpload.single('report_file'), uploadPatientReport);
router.get('/me/reports', authenticate, requireDoctor, getMyPatientReports);
router.get('/me/reports/:id', authenticate, requireDoctor, getReportById);
router.get('/me/reports/appointment/:appointmentId', authenticate, requireDoctor, getReportsByAppointment);
router.delete('/me/reports/:id', authenticate, requireDoctor, deleteReport);

// ── Doctor: telemedicine/video calls ──────────────────────────────────────────
router.post('/me/telemedicine/generate-room', authenticate, requireDoctor, generateVideoRoom);
router.get('/me/telemedicine/appointment/:appointmentId', authenticate, requireDoctor, getVideoRoomByAppointment);

// ── Admin routes ───────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireAdmin, adminListDoctors);
router.patch('/admin/:id/verify', authenticate, requireAdmin, verifyDoctor);

module.exports = router;