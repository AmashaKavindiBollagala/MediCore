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
    
    // Check if request has files (multipart/form-data)
    if (req.files && req.files.length > 0) {
      // For file uploads, use FormData
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      
      // Add files
      req.files.forEach(file => {
        formData.append(file.fieldname, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
      
      // Add other body fields
      if (req.body) {
        Object.entries(req.body).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Authorization': req.headers.authorization || '',
          ...formData.getHeaders(),
        },
        body: formData,
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      // Regular JSON request
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
    }
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

// ─── DOCTOR SERVICE ROUTES ─────────────────────────────────────────────────────

// Public routes
router.get('/doctors', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.doctor, `/doctors?${query}`);
});

router.get('/doctors/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/${req.params.id}`);
});

router.get('/doctors/:id/availability', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/${req.params.id}/availability`);
});

// Doctor registration
router.post('/doctors/register', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/register');
});

// Doctor profile
router.get('/doctors/me/profile', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/profile');
});

router.put('/doctors/me/profile', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/profile');
});

// Doctor availability
router.get('/doctors/me/availability', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/availability');
});

router.post('/doctors/me/availability', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/availability');
});

router.delete('/doctors/me/availability/:slotId', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/availability/${req.params.slotId}`);
});

router.get('/doctors/me/availability/exceptions', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/availability/exceptions');
});

router.post('/doctors/me/availability/block', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/availability/block');
});

// Doctor appointments
router.get('/doctors/me/appointments', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/appointments?${query}`);
});

router.get('/doctors/me/appointments/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/appointments/${req.params.id}`);
});

router.patch('/doctors/me/appointments/:id/confirm', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/appointments/${req.params.id}/confirm`);
});

router.patch('/doctors/me/appointments/:id/reject', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/appointments/${req.params.id}/reject`);
});

router.patch('/doctors/me/appointments/:id/complete', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/appointments/${req.params.id}/complete`);
});

// Doctor prescriptions
router.post('/doctors/me/prescriptions', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/prescriptions');
});

router.get('/doctors/me/prescriptions', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/prescriptions');
});

router.get('/doctors/me/prescriptions/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/prescriptions/${req.params.id}`);
});

router.get('/doctors/me/prescriptions/appointment/:appointmentId', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/prescriptions/appointment/${req.params.appointmentId}`);
});

router.put('/doctors/me/prescriptions/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/prescriptions/${req.params.id}`);
});

// Doctor patient reports
router.post('/doctors/me/reports/upload', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/reports/upload');
});

router.get('/doctors/me/reports', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/reports?${query}`);
});

router.get('/doctors/me/reports/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/reports/${req.params.id}`);
});

router.get('/doctors/me/reports/appointment/:appointmentId', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/reports/appointment/${req.params.appointmentId}`);
});

router.delete('/doctors/me/reports/:id', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/reports/${req.params.id}`);
});

// Doctor telemedicine
router.post('/doctors/me/telemedicine/generate-room', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, '/doctors/me/telemedicine/generate-room');
});

router.get('/doctors/me/telemedicine/appointment/:appointmentId', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/me/telemedicine/appointment/${req.params.appointmentId}`);
});

// Admin routes
router.get('/doctors/admin/all', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  proxyRequest(req, res, SERVICES.doctor, `/doctors/admin/all?${query}`);
});

router.patch('/doctors/admin/:id/verify', (req, res) => {
  proxyRequest(req, res, SERVICES.doctor, `/doctors/admin/${req.params.id}/verify`);
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

module.exports = router;