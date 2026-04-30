require('dotenv').config();
const { Worker } = require('bullmq');
const connection = require('../config/redis');
const { sendSMS } = require('../services/smsService');
const {
  sendAppointmentConfirmationEmail,
  sendDoctorAppointmentEmail,
  sendConsultationCompletionEmail,
  sendPaymentConfirmationEmail,
} = require('../services/emailService');

const worker = new Worker(
  'notificationQueue',
  async (job) => {
    const { type, data } = job.data;
    console.log(`📩 Processing job [${type}] - Job ID: ${job.id}`);

    switch (type) {

      // ── SMS ────────────────────────────────────────────────────────────────
      case 'SEND_SMS': {
        const result = await sendSMS(data.to, data.message);
        console.log('✅ SMS sent successfully');
        return result;
      }

      // ── Appointment booked: notify patient ─────────────────────────────────
      case 'APPOINTMENT_CONFIRMATION_EMAIL': {
        const result = await sendAppointmentConfirmationEmail(data.to, data);
        return result;
      }

      // ── Payment Success: notify patient ──────────────────────────────────────
      case 'PAYMENT_CONFIRMATION_EMAIL': {
        const result = await sendPaymentConfirmationEmail(data.to, data);
        return result;
      }

      // ── Appointment booked: notify doctor ──────────────────────────────────
      case 'DOCTOR_APPOINTMENT_EMAIL': {
        const result = await sendDoctorAppointmentEmail(data.to, data);
        return result;
      }

      // ── Consultation completed: notify patient ─────────────────────────────
      case 'CONSULTATION_COMPLETION_EMAIL': {
        const result = await sendConsultationCompletionEmail(data.to, data);
        return result;
      }

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} [${job.data.type}] completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} [${job.data?.type}] failed:`, err.message);
});

module.exports = worker;