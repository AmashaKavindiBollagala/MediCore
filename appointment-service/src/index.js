require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/medicare',
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ─── 1. Search doctors by specialty ──────────────────────────────────────────
app.get('/api/appointments/doctors/search', async (req, res) => {
  try {
    const { specialty } = req.query;

    const query = `
      SELECT d.id, d.full_name, d.specialty, d.verified,
             a.day_of_week, a.start_time, a.end_time, a.is_available
      FROM doctors.profiles d
      LEFT JOIN doctors.availability a ON d.id = a.doctor_id
      WHERE d.specialty ILIKE $1 AND d.verified = true
      ORDER BY d.full_name
    `;

    const result = await pool.query(query, [`%${specialty}%`]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

// ─── 2. Get doctor availability for a specific date ───────────────────────────
app.get('/api/appointments/doctors/:doctorId/availability', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required' });
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

    const query = `
      SELECT day_of_week, start_time, end_time, is_available
      FROM doctors.availability
      WHERE doctor_id = $1 AND day_of_week = $2 AND is_available = true
    `;

    const result = await pool.query(query, [doctorId, dayOfWeek]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get doctor availability' });
  }
});

// ─── 3. Book appointment ──────────────────────────────────────────────────────
app.post('/api/appointments/book', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { doctor_id, scheduled_at, consultation_type, symptoms, specialty } = req.body;
    const patient_id = req.user.id;

    if (!doctor_id || !scheduled_at) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Doctor ID and scheduled time are required' });
    }

    // Check if slot is already booked
    const conflictQuery = `
      SELECT id FROM appointments.bookings
      WHERE doctor_id = $1
        AND scheduled_at = $2
        AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
    `;
    const conflictResult = await client.query(conflictQuery, [doctor_id, scheduled_at]);

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    const insertQuery = `
      INSERT INTO appointments.bookings
        (patient_id, doctor_id, scheduled_at, consultation_type, symptoms, specialty, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_PAYMENT')
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      patient_id,
      doctor_id,
      scheduled_at,
      consultation_type || 'video',
      symptoms || '',
      specialty || '',
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Appointment created. Please proceed to payment.',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  } finally {
    client.release();
  }
});

// ─── 4. Update appointment status (after payment) ────────────────────────────
app.patch('/api/appointments/:appointmentId/status', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, payment_id } = req.body;

    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE appointments.bookings
      SET status = $1, payment_id = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [status, payment_id || null, appointmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment status updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// ─── 5. Get patient's appointments ───────────────────────────────────────────
app.get('/api/appointments/patient/my-appointments', authenticateToken, async (req, res) => {
  try {
    const patient_id = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT a.*,
             d.full_name as doctor_name, d.specialty
      FROM appointments.bookings a
      JOIN doctors.profiles d ON a.doctor_id = d.id
      WHERE a.patient_id = $1
    `;

    const params = [patient_id];

    if (status) {
      query += ' AND a.status = $2';
      params.push(status);
    }

    query += ' ORDER BY a.scheduled_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// ─── 6. Get doctor's appointments ────────────────────────────────────────────
app.get('/api/appointments/doctor/my-appointments', authenticateToken, async (req, res) => {
  try {
    const doctor_id = req.user.id;
    const { status, date } = req.query;

    let query = `
      SELECT a.*,
             p.full_name as patient_name, p.phone as patient_phone
      FROM appointments.bookings a
      JOIN patients.profiles p ON a.patient_id = p.id
      WHERE a.doctor_id = $1
    `;

    const params = [doctor_id];

    if (status) {
      query += ' AND a.status = $' + (params.length + 1);
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(a.scheduled_at) = $' + (params.length + 1);
      params.push(date);
    }

    query += ' ORDER BY a.scheduled_at ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// ─── 7. Get single appointment ────────────────────────────────────────────────
app.get('/api/appointments/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const query = `
      SELECT a.*,
             d.full_name as doctor_name, d.specialty,
             p.full_name as patient_name, p.phone as patient_phone
      FROM appointments.bookings a
      LEFT JOIN doctors.profiles d ON a.doctor_id = d.id
      LEFT JOIN patients.profiles p ON a.patient_id = p.id
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [appointmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// ─── 8. Cancel appointment ────────────────────────────────────────────────────
app.delete('/api/appointments/:appointmentId/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const getResult = await client.query(
      'SELECT * FROM appointments.bookings WHERE id = $1',
      [appointmentId]
    );

    if (getResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = getResult.rows[0];

    if (userRole === 'patient' && appointment.patient_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (userRole === 'doctor' && appointment.doctor_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateQuery = `
      UPDATE appointments.bookings
      SET status = 'CANCELLED', cancelled_by = $2, cancellation_reason = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      appointmentId,
      userRole,
      req.body.reason || '',
    ]);

    await client.query('COMMIT');

    // If appointment was paid, trigger refund via payment service
    if (appointment.payment_id && appointment.status === 'CONFIRMED') {
      try {
        const fetch = (await import('node-fetch')).default;
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000';
        
        await fetch(`${paymentServiceUrl}/api/payments/${appointment.payment_id}/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization,
          },
          body: JSON.stringify({
            reason: req.body.reason || `Appointment cancelled by ${userRole}`,
          }),
        });
        
        console.log('Refund triggered for appointment:', appointmentId);
      } catch (refundError) {
        console.error('Failed to trigger refund:', refundError.message);
        // Don't fail the cancellation if refund fails - it can be processed manually
      }
    }

    // TODO: send notification (notification service)

    res.json({
      success: true,
      message: 'Appointment cancelled',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  } finally {
    client.release();
  }
});

// ─── 9. Reschedule appointment ────────────────────────────────────────────────
app.patch('/api/appointments/:appointmentId/reschedule', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { appointmentId } = req.params;
    const { new_scheduled_at } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!new_scheduled_at) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'New scheduled time is required' });
    }

    const getResult = await client.query(
      'SELECT * FROM appointments.bookings WHERE id = $1',
      [appointmentId]
    );

    if (getResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = getResult.rows[0];

    // Only the patient who owns the appointment can reschedule
    if (userRole === 'patient' && appointment.patient_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check new slot availability
    const conflictResult = await client.query(
      `SELECT id FROM appointments.bookings
       WHERE doctor_id = $1
         AND scheduled_at = $2
         AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
         AND id != $3`,
      [appointment.doctor_id, new_scheduled_at, appointmentId]
    );

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    const result = await client.query(
      `UPDATE appointments.bookings
       SET scheduled_at = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [appointmentId, new_scheduled_at]
    );

    await client.query('COMMIT');

    // TODO: send notification (notification service)

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  } finally {
    client.release();
  }
});

// ─── 10. Reject appointment (doctor only) ────────────────────────────────────
app.patch('/api/appointments/:appointmentId/reject', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctor_id = req.user.id;

    const query = `
      UPDATE appointments.bookings
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = $1 AND doctor_id = $2 AND status = 'PENDING_PAYMENT'
      RETURNING *
    `;

    const result = await pool.query(query, [appointmentId, doctor_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or cannot be rejected' });
    }

    // TODO: send notification (notification service)

    res.json({
      success: true,
      message: 'Appointment rejected',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ error: 'Failed to reject appointment' });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'appointment-service' });
});

// Use PORT 3000 for Docker internal communication (docker-compose maps host 3004 → container 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`);
});