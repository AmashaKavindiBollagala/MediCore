const express = require('express');
const router = express.Router();
const notificationQueue = require('../queues/notificationQueue');

// ── Send raw SMS ──────────────────────────────────────────────────────────────
router.post('/sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message)
      return res.status(400).json({ success: false, message: 'Phone number and message are required' });

    const job = await notificationQueue.add(
      'notification',
      { type: 'SEND_SMS', data: { to, message } },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
    );

    res.json({ success: true, message: 'SMS queued successfully', jobId: job.id });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue SMS' });
  }
});

// ── Appointment booked → email patient ───────────────────────────────────────
router.post('/email/appointment-confirmation', async (req, res) => {
  try {
    const { to, patientName, doctorName, date, time, appointmentId } = req.body;

    if (!to || !patientName || !doctorName || !date || !time || !appointmentId)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const job = await notificationQueue.add(
      'notification',
      { type: 'APPOINTMENT_CONFIRMATION_EMAIL', data: { to, patientName, doctorName, date, time, appointmentId } },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
    );

    res.json({ success: true, message: 'Appointment confirmation email queued', jobId: job.id });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue email' });
  }
});

// ── Appointment booked → email doctor ────────────────────────────────────────
router.post('/email/doctor-appointment', async (req, res) => {
  try {
    const { to, doctorName, patientName, date, time, appointmentId } = req.body;

    if (!to || !doctorName || !patientName || !date || !time || !appointmentId)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const job = await notificationQueue.add(
      'notification',
      { type: 'DOCTOR_APPOINTMENT_EMAIL', data: { to, doctorName, patientName, date, time, appointmentId } },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
    );

    res.json({ success: true, message: 'Doctor appointment email queued', jobId: job.id });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue email' });
  }
});

// ── Consultation completed → email patient ────────────────────────────────────
router.post('/email/consultation-completion', async (req, res) => {
  try {
    const { to, patientName, doctorName, date, notes } = req.body;

    if (!to || !patientName || !doctorName || !date)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const job = await notificationQueue.add(
      'notification',
      { type: 'CONSULTATION_COMPLETION_EMAIL', data: { to, patientName, doctorName, date, notes } },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
    );

    res.json({ success: true, message: 'Consultation completion email queued', jobId: job.id });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue email' });
  }
});

module.exports = router;