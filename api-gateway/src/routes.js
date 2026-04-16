const express = require('express');
const router = express.Router();

// Use Node 18+ built-in fetch (NO node-fetch needed)
const fetch = global.fetch;

// ─────────────────────────────────────────────
// SERVICE URLS (Docker internal names)
// ─────────────────────────────────────────────
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
  patient: process.env.PATIENT_SERVICE_URL || 'http://patient-service:3000',
  appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3000',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000',
  doctor: process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
  telemedicine: process.env.TELEMEDICINE_SERVICE_URL || 'http://telemedicine-service:3000',
  ai: process.env.AI_SERVICE_URL || 'http://ai-symptom-service:3000',
  admin: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3000',
};

// ─────────────────────────────────────────────
// GENERIC PROXY
// ─────────────────────────────────────────────
const proxyRequest = async (req, res, serviceUrl, path) => {
  try {
    const url = `${serviceUrl}${path}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body: req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : JSON.stringify(req.body),
    });

    const text = await response.text();

    res.status(response.status).send(text ? JSON.parse(text) : {});
  } catch (error) {
    console.error(`Proxy error -> ${serviceUrl}${path}:`, error.message);
    res.status(502).json({
      error: 'Service unavailable',
      detail: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────
router.post('/auth/register', (req, res) => {
  proxyRequest(req, res, SERVICES.auth, '/api/auth/register');
});

router.post('/auth/login', (req, res) => {
  proxyRequest(req, res, SERVICES.auth, '/api/auth/login');
});

// ─────────────────────────────────────────────
// APPOINTMENT SERVICE
// ─────────────────────────────────────────────
router.get('/appointments/doctors/search', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/doctors/search?${query}`);
});

router.get('/appointments/doctors/:doctorId/availability', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(
    req,
    res,
    SERVICES.appointment,
    `/api/appointments/doctors/${req.params.doctorId}/availability?${query}`
  );
});

router.post('/appointments/book', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, '/api/appointments/book');
});

router.patch('/appointments/:appointmentId/status', (req, res) => {
  proxyRequest(
    req,
    res,
    SERVICES.appointment,
    `/api/appointments/${req.params.appointmentId}/status`
  );
});

router.get('/appointments/patient/my-appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/patient/my-appointments?${query}`);
});

router.get('/appointments/doctor/my-appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/doctor/my-appointments?${query}`);
});

router.patch('/appointments/:appointmentId/reschedule', (req, res) => {
  proxyRequest(
    req,
    res,
    SERVICES.appointment,
    `/api/appointments/${req.params.appointmentId}/reschedule`
  );
});

router.patch('/appointments/:appointmentId/reject', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/reject`);
});

router.delete('/appointments/:appointmentId/cancel', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/cancel`);
});

router.get('/appointments/:appointmentId', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}`);
});

// ─────────────────────────────────────────────
// PAYMENT SERVICE
// ─────────────────────────────────────────────
router.post('/payments/initiate', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, '/api/payments/initiate');
});

router.get('/payments/:paymentId/status', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, `/api/payments/${req.params.paymentId}/status`);
});

router.get('/payments/:paymentId', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, `/api/payments/${req.params.paymentId}`);
});

router.get('/payments/patient/my-payments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.payment, `/api/payments/patient/my-payments?${query}`);
});

router.get('/payments/doctor/my-earnings', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.payment, `/api/payments/doctor/my-earnings?${query}`);
});

router.post('/payments/:paymentId/refund', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, `/api/payments/${req.params.paymentId}/refund`);
});

router.post('/payments/cancel-with-refund', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, '/api/payments/cancel-with-refund');
});

// ✅ FIXED WEBHOOK (THIS WAS YOUR CRASH)
router.post('/payments/webhook/payhere', (req, res) => {
  proxyRequest(req, res, SERVICES.payment, '/api/payments/webhook/payhere');
});

// ─────────────────────────────────────────────
// ADMIN SERVICE
// ─────────────────────────────────────────────
router.get('/admin/stats', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, '/admin/stats');
});

router.get('/admin/doctors', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/doctors?${query}`);
});

router.get('/admin/doctors/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, `/admin/doctors/${req.params.id}`);
});

router.patch('/admin/doctors/:id/verify', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, `/admin/doctors/${req.params.id}/verify`);
});

// AI upload (stream-safe)
router.post('/admin/doctors/:id/ai-analyze', async (req, res) => {
  try {
    const url = `${SERVICES.admin}/admin/doctors/${req.params.id}/ai-analyze`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || '',
      },
      body: req,
    });

    const data = await response.text();
    res.status(response.status).send(data ? JSON.parse(data) : {});
  } catch (error) {
    res.status(502).json({
      error: 'Service unavailable',
      detail: error.message,
    });
  }
});

router.get('/admin/users', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/users?${query}`);
});

router.put('/admin/users/:id/suspend', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, `/admin/users/${req.params.id}/suspend`);
});

router.put('/admin/users/:id/reactivate', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, `/admin/users/${req.params.id}/reactivate`);
});

router.get('/admin/appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/appointments?${query}`);
});

router.get('/admin/payments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/payments?${query}`);
});

module.exports = router;