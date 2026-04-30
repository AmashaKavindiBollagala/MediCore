const transporter = require('../config/mailer');

// ── Appointment Confirmation ──────────────────────────────────────────────────
const sendAppointmentConfirmationEmail = async (to, data) => {
  const { patientName, doctorName, date, time, appointmentId } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '✅ Appointment Confirmation - MediCore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0d6efd; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MediCore Health</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0d6efd;">Appointment Confirmed 🎉</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are your details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Appointment ID</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${appointmentId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Doctor</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">Dr. ${doctorName}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Time</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${time}</td>
            </tr>
          </table>
          <p style="color: #6c757d; font-size: 14px;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          © 2025 MediCore Health. All rights reserved.
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Appointment confirmation email sent:', result.messageId);
  return result;
};

// ── Doctor Appointment Notification ──────────────────────────────────────────
const sendDoctorAppointmentEmail = async (to, data) => {
  const { doctorName, patientName, date, time, appointmentId } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '📅 New Appointment Scheduled - MediCore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #198754; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MediCore Health</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #198754;">New Appointment Notification</h2>
          <p>Dear <strong>Dr. ${doctorName}</strong>,</p>
          <p>A new appointment has been scheduled with you:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Appointment ID</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${appointmentId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Patient</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${patientName}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Time</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${time}</td>
            </tr>
          </table>
          <p style="color: #6c757d; font-size: 14px;">Please log in to your MediCore dashboard for more details.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          © 2025 MediCore Health. All rights reserved.
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Doctor appointment notification email sent:', result.messageId);
  return result;
};

// ── Consultation Completion ───────────────────────────────────────────────────
const sendConsultationCompletionEmail = async (to, data) => {
  const { patientName, doctorName, date, notes } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '🩺 Consultation Summary - MediCore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0d6efd; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MediCore Health</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0d6efd;">Consultation Completed</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your consultation with <strong>Dr. ${doctorName}</strong> on <strong>${date}</strong> has been completed.</p>
          ${notes ? `
          <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>Doctor's Notes:</strong>
            <p style="margin: 5px 0 0 0;">${notes}</p>
          </div>` : ''}
          <p>Thank you for choosing MediCore Health. We hope you feel better soon!</p>
          <p style="color: #6c757d; font-size: 14px;">For any follow-up questions, please book a new appointment through our platform.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          © 2025 MediCore Health. All rights reserved.
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Consultation completion email sent:', result.messageId);
  return result;
};

// ── Payment Success Confirmation ──────────────────────────────────────────────
const sendPaymentConfirmationEmail = async (to, data) => {
  const { patientName, doctorName, date, time, appointmentId, amount, transactionId } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '💳 Payment Successful - MediCore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #198754; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MediCore Health</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #198754;">Payment Successful ✅</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your payment for the appointment has been successfully processed. Here are your payment details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Transaction ID</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Appointment ID</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${appointmentId}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Doctor</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${date}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Time</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Amount Paid</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6; color: #198754; font-weight: bold; font-size: 18px;">LKR ${parseFloat(amount).toLocaleString()}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Payment Status</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6; color: #198754; font-weight: bold;">✅ SUCCESS</td>
            </tr>
          </table>
          <div style="background-color: #d1e7dd; border-left: 4px solid #198754; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>Appointment Confirmed!</strong>
            <p style="margin: 5px 0 0 0;">Your appointment is now fully confirmed. Please log in to your MediCore dashboard to view appointment details.</p>
          </div>
          <p style="color: #6c757d; font-size: 14px;">If you have any questions about this payment, please contact our support team.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          © 2025 MediCore Health. All rights reserved.
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Payment confirmation email sent:', result.messageId);
  return result;
};

module.exports = {
  sendAppointmentConfirmationEmail,
  sendDoctorAppointmentEmail,
  sendConsultationCompletionEmail,
  sendPaymentConfirmationEmail,
};