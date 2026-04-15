const express = require('express');
const router = express.Router();

const {
  registerDoctor, getMyProfile, updateMyProfile,
  listDoctors, getDoctorById,
  adminListDoctors, verifyDoctor,
} = require('../controllers/kaveesha-doctorController');

const {
  addAvailabilitySlot, getMyAvailability, getDoctorAvailability,
  removeAvailabilitySlot, addExceptionDate, getExceptionDates,
} = require('../controllers/kaveesha-availabilityController');

const {
  getMyAppointments, confirmAppointment, rejectAppointment,
  completeAppointment, getAppointmentById,
} = require('../controllers/kaveesha-appointmentController');

const {
  issuePrescription, getMyPrescriptions, getPrescriptionById,
  getPrescriptionsByAppointment, updatePrescription,
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
router.get('/:id', getDoctorById);                     // GET  /doctors/:id
router.get('/:id/availability', getDoctorAvailability);// GET  /doctors/:id/availability

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

// ── Doctor: manage own availability ───────────────────────────────────────────
router.get('/me/availability', authenticate, requireDoctor, getMyAvailability);
router.post(
  '/me/availability',
  authenticate, requireDoctor, validateAvailability,
  addAvailabilitySlot
);
router.delete('/me/availability/:slotId', authenticate, requireDoctor, removeAvailabilitySlot);
router.get('/me/availability/exceptions', authenticate, requireDoctor, getExceptionDates);
router.post('/me/availability/block', authenticate, requireDoctor, addExceptionDate);

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