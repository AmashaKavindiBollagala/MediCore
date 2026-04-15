const express = require('express');
const router = express.Router();

// Service URLs — all point to internal Docker service names
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

// Helper function to proxy requests
const proxyRequest = async (req, res, serviceUrl, path) => {
  try {
    const fetch = (await import('node-fetch')).default;

    const url = `${serviceUrl}${path}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Proxy error to ${serviceUrl}${path}:`, error.message);
    res.status(502).json({ error: 'Service unavailable', detail: error.message });
  }
};

// ─── AUTH SERVICE ROUTES ───────────────────────────────────────────────────────

router.post('/auth/register', (req, res) => {
  proxyRequest(req, res, SERVICES.auth, '/api/auth/register');
});

router.post('/auth/login', (req, res) => {
  proxyRequest(req, res, SERVICES.auth, '/api/auth/login');
});

// ─── APPOINTMENT SERVICE ROUTES ───────────────────────────────────────────────

// Search doctors by specialty
router.get('/appointments/doctors/search', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/doctors/search?${query}`);
});

// Get doctor availability
router.get('/appointments/doctors/:doctorId/availability', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/doctors/${req.params.doctorId}/availability?${query}`);
});

// Book appointment
router.post('/appointments/book', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, '/api/appointments/book');
});

// Update appointment status (after payment)
router.patch('/appointments/:appointmentId/status', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/status`);
});

// Get patient's appointments
router.get('/appointments/patient/my-appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/patient/my-appointments?${query}`);
});

// Get doctor's appointments
router.get('/appointments/doctor/my-appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/doctor/my-appointments?${query}`);
});

// Reschedule appointment  — must come BEFORE /:appointmentId
router.patch('/appointments/:appointmentId/reschedule', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/reschedule`);
});

// Reject appointment (doctor only) — must come BEFORE /:appointmentId
router.patch('/appointments/:appointmentId/reject', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/reject`);
});

// Cancel appointment
router.delete('/appointments/:appointmentId/cancel', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}/cancel`);
});

// Get single appointment — keep LAST among appointment routes
router.get('/appointments/:appointmentId', (req, res) => {
  proxyRequest(req, res, SERVICES.appointment, `/api/appointments/${req.params.appointmentId}`);
});

// ─── ADMIN SERVICE ROUTES ───────────────────────────────────────────────────────

// Dashboard stats
router.get('/admin/stats', (req, res) => {
  proxyRequest(req, res, SERVICES.admin, '/admin/stats');
});

// Doctor verification
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

// AI license analysis (file upload)
router.post('/admin/doctors/:id/ai-analyze', (req, res) => {
  // For multipart/form-data, we need to forward differently
  const fetch = require('node-fetch');
  const url = `${SERVICES.admin}/admin/doctors/${req.params.id}/ai-analyze`;
  
  // Forward the request with headers but without JSON.stringify
  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': req.headers.authorization || '',
      'Content-Type': req.headers['content-type'] || 'multipart/form-data',
    },
    body: req,
  })
  .then(response => response.json())
  .then(data => res.status(response.status).json(data))
  .catch(error => {
    console.error(`Proxy error to ${url}:`, error.message);
    res.status(502).json({ error: 'Service unavailable', detail: error.message });
  });
});

// User management
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

// Appointments (admin view)
router.get('/admin/appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/appointments?${query}`);
});

// Payments (admin view)
router.get('/admin/payments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.admin, `/admin/payments?${query}`);
});

module.exports = router;