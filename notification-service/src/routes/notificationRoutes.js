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

// ── Payment Success → Send Email + SMS to Patient and Doctor ─────────────────
router.post('/payment-success', async (req, res) => {
  try {
    const {
      patientEmail,
      patientPhone,
      patientName,
      doctorEmail,
      doctorPhone,
      doctorName,
      appointmentId,
      appointmentDate,
      appointmentTime,
      amount
    } = req.body;

    // Validate required fields
    if (!patientEmail || !patientName || !doctorEmail || !doctorName || !appointmentId || !appointmentDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: patientEmail, patientName, doctorEmail, doctorName, appointmentId, appointmentDate' 
      });
    }

    const jobs = [];

    // 1. Email to Patient - Payment Confirmation
    if (patientEmail) {
      const patientEmailJob = await notificationQueue.add(
        'notification',
        { 
          type: 'PAYMENT_CONFIRMATION_EMAIL', 
          data: { 
            to: patientEmail, 
            patientName, 
            doctorName, 
            date: appointmentDate, 
            time: appointmentTime || 'TBA', 
            appointmentId,
            amount,
            transactionId: req.body.transactionId
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'patient_email', jobId: patientEmailJob.id });
    }

    // 2. SMS to Patient
    if (patientPhone) {
      const patientSmsJob = await notificationQueue.add(
        'notification',
        { 
          type: 'SEND_SMS', 
          data: { 
            to: patientPhone, 
            message: `MediCore: Your appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime || 'TBA'} is confirmed! Amount: LKR ${amount}. Appointment ID: ${appointmentId}` 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'patient_sms', jobId: patientSmsJob.id });
    }

    // 3. Email to Doctor - New Appointment Notification
    if (doctorEmail) {
      const doctorEmailJob = await notificationQueue.add(
        'notification',
        { 
          type: 'DOCTOR_APPOINTMENT_EMAIL', 
          data: { 
            to: doctorEmail, 
            doctorName, 
            patientName, 
            date: appointmentDate, 
            time: appointmentTime || 'TBA', 
            appointmentId 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'doctor_email', jobId: doctorEmailJob.id });
    }

    // 4. SMS to Doctor
    if (doctorPhone) {
      const doctorSmsJob = await notificationQueue.add(
        'notification',
        { 
          type: 'SEND_SMS', 
          data: { 
            to: doctorPhone, 
            message: `MediCore: New appointment booked with ${patientName} on ${appointmentDate} at ${appointmentTime || 'TBA'}. Amount: LKR ${amount}. Appointment ID: ${appointmentId}` 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'doctor_sms', jobId: doctorSmsJob.id });
    }

    res.json({ 
      success: true, 
      message: 'Payment success notifications queued successfully',
      jobsQueued: jobs.length,
      jobs 
    });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue notifications' });
  }
});

// ── Appointment Booking → Send Email + SMS (Before Payment) ──────────────────
router.post('/appointment-booking', async (req, res) => {
  try {
    const {
      patientEmail,
      patientPhone,
      patientName,
      doctorEmail,
      doctorPhone,
      doctorName,
      appointmentId,
      appointmentDate,
      appointmentTime,
      amount
    } = req.body;

    if (!patientEmail || !doctorEmail || !appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const jobs = [];

    // Email to Patient
    if (patientEmail) {
      const job = await notificationQueue.add(
        'notification',
        { 
          type: 'APPOINTMENT_CONFIRMATION_EMAIL', 
          data: { 
            to: patientEmail, 
            patientName, 
            doctorName, 
            date: appointmentDate, 
            time: appointmentTime || 'TBA', 
            appointmentId 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'patient_email', jobId: job.id });
    }

    // SMS to Patient
    if (patientPhone) {
      const job = await notificationQueue.add(
        'notification',
        { 
          type: 'SEND_SMS', 
          data: { 
            to: patientPhone, 
            message: `MediCore: Appointment booked with Dr. ${doctorName} on ${appointmentDate}. Please complete payment to confirm. ID: ${appointmentId}` 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'patient_sms', jobId: job.id });
    }

    // Email to Doctor
    if (doctorEmail) {
      const job = await notificationQueue.add(
        'notification',
        { 
          type: 'DOCTOR_APPOINTMENT_EMAIL', 
          data: { 
            to: doctorEmail, 
            doctorName, 
            patientName, 
            date: appointmentDate, 
            time: appointmentTime || 'TBA', 
            appointmentId 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'doctor_email', jobId: job.id });
    }

    // SMS to Doctor
    if (doctorPhone) {
      const job = await notificationQueue.add(
        'notification',
        { 
          type: 'SEND_SMS', 
          data: { 
            to: doctorPhone, 
            message: `MediCore: New appointment booked with ${patientName} on ${appointmentDate} at ${appointmentTime || 'TBA'}. Amount: LKR ${amount}. Appointment ID: ${appointmentId}` 
          } 
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }
      );
      jobs.push({ type: 'doctor_sms', jobId: job.id });
    }

    res.json({ 
      success: true, 
      message: 'Appointment booking notifications queued',
      jobsQueued: jobs.length,
      jobs 
    });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue notifications' });
  }
});

module.exports = router;