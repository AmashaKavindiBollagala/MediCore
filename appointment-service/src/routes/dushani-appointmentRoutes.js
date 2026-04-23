const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/dushani-appointmentController');
const { authenticateToken } = require('../middleware/dushani-auth');

// Search doctors by specialty
router.get('/doctors/search', appointmentController.searchDoctors);

// Get doctor availability
router.get('/doctors/:doctorId/availability', appointmentController.getDoctorAvailability);

// Book appointment
router.post('/book', authenticateToken, appointmentController.bookAppointment);

// Update appointment status
router.patch('/:appointmentId/status', authenticateToken, appointmentController.updateAppointmentStatus);

// Get patient's appointments
router.get('/patient/my-appointments', authenticateToken, appointmentController.getPatientAppointments);

// Get doctor's appointments
router.get('/doctor/my-appointments', authenticateToken, appointmentController.getDoctorAppointments);

// Get single appointment
router.get('/:appointmentId', authenticateToken, appointmentController.getAppointment);

// Cancel appointment
router.delete('/:appointmentId/cancel', authenticateToken, appointmentController.cancelAppointment);

// Complete appointment
router.put('/:appointmentId/complete', authenticateToken, appointmentController.completeAppointment);

// Reschedule appointment
router.patch('/:appointmentId/reschedule', authenticateToken, appointmentController.rescheduleAppointment);

// Reject appointment
router.patch('/:appointmentId/reject', authenticateToken, appointmentController.rejectAppointment);

// Check telemedicine eligibility
router.get('/:appointmentId/telemedicine-eligibility', authenticateToken, appointmentController.checkTelemedicineEligibility);

module.exports = router;
