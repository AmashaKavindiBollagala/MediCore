const pool = require('../config/kaveesha-doctorPool');
const path = require('path');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// Helper: build file URL from uploaded file
const fileUrl = (file) =>
  file ? `/uploads/reports/${file.filename}` : null;

// ─── POST /doctors/reports/upload — Upload patient report ─────────────────────
const uploadPatientReport = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found. Please register first.' });

  const { appointment_id, patient_id, report_type, description } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Report file is required' });
  }

  if (!appointment_id || !patient_id) {
    return res.status(400).json({ 
      error: 'appointment_id and patient_id are required' 
    });
  }

  try {
    // Verify the appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND doctor_id = $2',
      [appointment_id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const reportUrl = fileUrl(file);

    const result = await pool.query(
      `INSERT INTO patient_reports 
        (appointment_id, patient_id, doctor_id, report_url, report_type, description, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'doctor')
       RETURNING *`,
      [appointment_id, patient_id, doctorId, reportUrl, report_type || '', description || '']
    );

    res.status(201).json({ 
      message: 'Patient report uploaded successfully', 
      report: result.rows[0] 
    });
  } catch (err) {
    console.error('[uploadPatientReport]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/reports — Get all reports for this doctor's patients ────────
const getMyPatientReports = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { appointment_id, patient_id } = req.query;

  try {
    let query = `
      SELECT r.*, 
             p.first_name || ' ' || p.last_name as patient_name
      FROM patient_reports r
      LEFT JOIN profiles p ON r.patient_id = p.id
      WHERE (r.doctor_id = $1 OR r.uploaded_by = 'patient')
    `;
    const params = [doctorId];

    if (appointment_id) {
      params.push(appointment_id);
      query += ` AND r.appointment_id = $${params.length}`;
    }

    if (patient_id) {
      params.push(patient_id);
      query += ` AND r.patient_id = $${params.length}`;
    }

    query += ' ORDER BY r.uploaded_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[getMyPatientReports]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/reports/:id — Get specific report ───────────────────────────
const getReportById = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT * FROM patient_reports
       WHERE r.id = $1 AND (r.doctor_id = $2 OR r.uploaded_by = 'patient')`,
      [req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getReportById]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/reports/appointment/:appointmentId ──────────────────────────
const getReportsByAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    // First verify the appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND doctor_id = $2',
      [req.params.appointmentId, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const result = await pool.query(
      `SELECT r.*, 
              p.first_name || ' ' || p.last_name as patient_name
       FROM patient_reports r
       LEFT JOIN profiles p ON r.patient_id = p.id
       WHERE r.appointment_id = $1
       ORDER BY r.uploaded_at DESC`,
      [req.params.appointmentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getReportsByAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /doctors/reports/:id — Delete a report ────────────────────────────
const deleteReport = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      'DELETE FROM patient_reports WHERE id = $1 AND doctor_id = $2 RETURNING id',
      [req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not authorized' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('[deleteReport]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadPatientReport,
  getMyPatientReports,
  getReportById,
  getReportsByAppointment,
  deleteReport,
};
