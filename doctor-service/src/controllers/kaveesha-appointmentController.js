const pool = require('../config/kaveesha-doctorPool');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM doctors.profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── GET /doctors/appointments — Get all appointments for this doctor ─────────
const getMyAppointments = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { status, date } = req.query;

  try {
    let query = `
      SELECT a.*, 
        p.full_name as patient_name,
        p.phone as patient_phone
      FROM appointments.bookings a
      LEFT JOIN patients.profiles p ON p.user_id::text = a.patient_id::text
      WHERE a.doctor_id = $1
    `;
    const params = [doctorId];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(a.scheduled_at) = $${params.length}::date`;
    }

    query += ' ORDER BY a.scheduled_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[getMyAppointments]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /doctors/appointments/:id/confirm — Accept appointment ─────────────
const confirmAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    // Verify appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id, status FROM appointments.bookings WHERE id = $1 AND doctor_id = $2',
      [req.params.id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const currentStatus = appointmentCheck.rows[0].status;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      return res.status(400).json({ 
        error: `Cannot confirm appointment with status: ${currentStatus}` 
      });
    }

    const result = await pool.query(
      `UPDATE appointments.bookings 
       SET status = 'CONFIRMED', updated_at = NOW()
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [req.params.id, doctorId]
    );

    res.json({ 
      message: 'Appointment confirmed successfully', 
      appointment: result.rows[0] 
    });
  } catch (err) {
    console.error('[confirmAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /doctors/appointments/:id/reject — Reject appointment ──────────────
const rejectAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { reason } = req.body;

  try {
    // Verify appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id, status FROM appointments.bookings WHERE id = $1 AND doctor_id = $2',
      [req.params.id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const currentStatus = appointmentCheck.rows[0].status;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      return res.status(400).json({ 
        error: `Cannot reject appointment with status: ${currentStatus}` 
      });
    }

    const result = await pool.query(
      `UPDATE appointments.bookings 
       SET status = 'REJECTED', 
           cancelled_by = 'doctor',
           cancellation_reason = $1,
           updated_at = NOW()
       WHERE id = $2 AND doctor_id = $3
       RETURNING *`,
      [reason || 'Appointment rejected by doctor', req.params.id, doctorId]
    );

    res.json({ 
      message: 'Appointment rejected successfully', 
      appointment: result.rows[0] 
    });
  } catch (err) {
    console.error('[rejectAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /doctors/appointments/:id/complete — Complete appointment ──────────
const completeAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    // Verify appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id, status FROM appointments.bookings WHERE id = $1 AND doctor_id = $2',
      [req.params.id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const currentStatus = appointmentCheck.rows[0].status;
    if (currentStatus !== 'CONFIRMED') {
      return res.status(400).json({ 
        error: `Can only complete CONFIRMED appointments. Current status: ${currentStatus}` 
      });
    }

    const result = await pool.query(
      `UPDATE appointments.bookings 
       SET status = 'COMPLETED', updated_at = NOW()
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [req.params.id, doctorId]
    );

    res.json({ 
      message: 'Appointment completed successfully', 
      appointment: result.rows[0] 
    });
  } catch (err) {
    console.error('[completeAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/appointments/:id — Get single appointment details ───────────
const getAppointmentById = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT a.*, 
        p.full_name as patient_name,
        p.phone as patient_phone,
        p.dob as patient_dob
      FROM appointments.bookings a
      LEFT JOIN patients.profiles p ON p.user_id::text = a.patient_id::text
      WHERE a.id = $1 AND a.doctor_id = $2`,
      [req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getAppointmentById]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyAppointments,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getAppointmentById,
};
