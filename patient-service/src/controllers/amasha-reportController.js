const pool = require('../config/amasha-patientdb');
const { uploadToCloudinary } = require('../middleware/amasha-uploadMiddleware');

// Helper: get patient profile id from user id
const getPatientProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM patients WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── POST /patients/reports — Upload patient report ─────────────────────
const uploadPatientReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = await getPatientProfileId(userId);
    
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found. Please register first.' });
    }

    const { report_type, description, doctor_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Report file is required' });
    }

    if (!report_type) {
      return res.status(400).json({ error: 'Report type is required' });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      file.buffer,
      'patient-reports',
      file.originalname
    );

    // Insert into doctor-service database (patient_reports table)
    // We need to connect to the doctor database to insert the report
    const doctorDbUrl = process.env.DOCTOR_DATABASE_URL;
    if (!doctorDbUrl) {
      return res.status(500).json({ error: 'Doctor database configuration missing' });
    }

    const { Pool } = require('pg');
    const doctorPool = new Pool({
      connectionString: doctorDbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const result = await doctorPool.query(
      `INSERT INTO patient_reports 
        (appointment_id, patient_id, doctor_id, report_url, report_type, description, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'patient')
       RETURNING *`,
      [
        null, // appointment_id - not required for patient uploads
        patientId,
        doctor_id || null,
        cloudinaryResult.url,
        report_type,
        description || ''
      ]
    );

    await doctorPool.end();

    res.status(201).json({ 
      message: 'Patient report uploaded successfully', 
      report: result.rows[0] 
    });
  } catch (err) {
    console.error('[uploadPatientReport]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /patients/reports — Get all reports for this patient ────────────
const getPatientReports = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = await getPatientProfileId(userId);
    
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Fetch from doctor-service database
    const doctorDbUrl = process.env.DOCTOR_DATABASE_URL;
    const { Pool } = require('pg');
    const doctorPool = new Pool({
      connectionString: doctorDbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const result = await doctorPool.query(
      `SELECT r.*, 
        d.first_name || ' ' || d.last_name as doctor_name
       FROM patient_reports r
       LEFT JOIN profiles d ON r.doctor_id = d.id
       WHERE r.patient_id = $1
       ORDER BY r.uploaded_at DESC`,
      [patientId]
    );

    await doctorPool.end();

    res.json(result.rows);
  } catch (err) {
    console.error('[getPatientReports]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /patients/reports/:id — Delete a report ──────────────────────
const deletePatientReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = await getPatientProfileId(userId);
    
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const doctorDbUrl = process.env.DOCTOR_DATABASE_URL;
    const { Pool } = require('pg');
    const doctorPool = new Pool({
      connectionString: doctorDbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const result = await doctorPool.query(
      'DELETE FROM patient_reports WHERE id = $1 AND patient_id = $2 RETURNING id',
      [req.params.id, patientId]
    );

    await doctorPool.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not authorized' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('[deletePatientReport]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadPatientReport,
  getPatientReports,
  deletePatientReport,
};
