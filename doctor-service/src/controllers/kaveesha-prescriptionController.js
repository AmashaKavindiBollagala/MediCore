const pool = require('../config/kaveesha-doctorPool');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM doctors.profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── POST /doctors/prescriptions — Issue a new prescription ───────────────────
const issuePrescription = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found. Please register first.' });

  const { appointment_id, patient_id, prescription_data, notes } = req.body;

  // Validate required fields
  if (!appointment_id || !patient_id || !prescription_data) {
    return res.status(400).json({ 
      error: 'appointment_id, patient_id, and prescription_data are required' 
    });
  }

  // Validate prescription_data structure
  if (!prescription_data.medications || !Array.isArray(prescription_data.medications)) {
    return res.status(400).json({ 
      error: 'prescription_data must include medications array' 
    });
  }

  try {
    // Verify the appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments.bookings WHERE id = $1 AND doctor_id = $2',
      [appointment_id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const result = await pool.query(
      `INSERT INTO doctors.prescriptions 
        (appointment_id, doctor_id, patient_id, prescription_data, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [appointment_id, doctorId, patient_id, prescription_data, notes || '']
    );

    res.status(201).json({ 
      message: 'Prescription issued successfully', 
      prescription: result.rows[0] 
    });
  } catch (err) {
    console.error('[issuePrescription]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/prescriptions — Get all prescriptions by this doctor ────────
const getMyPrescriptions = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT p.*, 
        a.scheduled_at as appointment_date,
        a.status as appointment_status
       FROM doctors.prescriptions p
       LEFT JOIN appointments.bookings a ON a.id = p.appointment_id
       WHERE p.doctor_id = $1
       ORDER BY p.issued_at DESC`,
      [doctorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getMyPrescriptions]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/prescriptions/:id — Get specific prescription ───────────────
const getPrescriptionById = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT p.*, 
        a.scheduled_at as appointment_date,
        a.status as appointment_status
       FROM doctors.prescriptions p
       LEFT JOIN appointments.bookings a ON a.id = p.appointment_id
       WHERE p.id = $1 AND p.doctor_id = $2`,
      [req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getPrescriptionById]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/prescriptions/appointment/:appointmentId ────────────────────
const getPrescriptionsByAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT * FROM doctors.prescriptions
       WHERE appointment_id = $1 AND doctor_id = $2
       ORDER BY issued_at DESC`,
      [req.params.appointmentId, doctorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getPrescriptionsByAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PUT /doctors/prescriptions/:id — Update prescription ─────────────────────
const updatePrescription = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { prescription_data, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE doctors.prescriptions 
       SET prescription_data = COALESCE($1, prescription_data),
           notes = COALESCE($2, notes)
       WHERE id = $3 AND doctor_id = $4
       RETURNING *`,
      [prescription_data, notes, req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found or not authorized' });
    }

    res.json({ message: 'Prescription updated', prescription: result.rows[0] });
  } catch (err) {
    console.error('[updatePrescription]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  issuePrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getPrescriptionsByAppointment,
  updatePrescription,
};
