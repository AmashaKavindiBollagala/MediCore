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

// Helper: create patient profile from users table
const createPatientProfile = async (userId) => {
  // Connect to auth database to get user info
  const authDbUrl = process.env.AUTH_DATABASE_URL;
  if (!authDbUrl) {
    console.error('AUTH_DATABASE_URL not configured');
    return null;
  }

  const { Pool } = require('pg');
  const authPool = new Pool({
    connectionString: authDbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Get user from auth database
    const userResult = await authPool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User ${userId} not found in users table`);
      return null;
    }

    const user = userResult.rows[0];
    console.log(`Creating patient profile for user: ${user.name} (${user.email})`);

    // Create patient profile
    const insertResult = await pool.query(
      'INSERT INTO patients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
      [user.id, user.name, user.email]
    );

    console.log(`Created patient profile with id: ${insertResult.rows[0].id}`);
    return insertResult.rows[0].id;
  } catch (err) {
    console.error('Error creating patient profile:', err.message);
    return null;
  } finally {
    await authPool.end();
  }
};

// ─── POST /patients/reports — Upload patient report ─────────────────────
const uploadPatientReport = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    console.log('Upload request from user:', userId);
    
    let patientId = await getPatientProfileId(userId);
    
    // If patient profile doesn't exist, create it automatically from users table
    if (!patientId) {
      console.log(`Patient profile not found for user ${userId}, creating...`);
      patientId = await createPatientProfile(userId);
      
      if (!patientId) {
        return res.status(500).json({ error: 'Failed to create patient profile' });
      }
    }

    const { appointment_id, report_type, description, doctor_id } = req.body;
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

    // If appointment_id is provided but doctor_id is not, fetch doctor_id from the appointment
    let finalDoctorId = doctor_id;
    if (appointment_id && !finalDoctorId) {
      const appointmentCheck = await doctorPool.query(
        'SELECT doctor_id FROM appointments.bookings WHERE id = $1',
        [appointment_id]
      );
      if (appointmentCheck.rows.length > 0) {
        finalDoctorId = appointmentCheck.rows[0].doctor_id;
        console.log(`Auto-assigning doctor_id ${finalDoctorId} from appointment ${appointment_id}`);
      }
    }

    const result = await doctorPool.query(
      `INSERT INTO patient_reports 
        (appointment_id, patient_id, doctor_id, report_url, report_type, description, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'patient')
       RETURNING *`,
      [
        appointment_id || null, // appointment_id - links to completed consultation (UUID)
        `00000000-0000-0000-0000-${String(patientId).padStart(12, '0')}`, // patient_id - convert integer to UUID format
        finalDoctorId || null, // doctor_id - auto-fetched from appointment if not provided
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
    const userId = req.user.id;
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
       WHERE r.patient_id = $1::uuid
       ORDER BY r.uploaded_at DESC`,
      [`00000000-0000-0000-0000-${String(patientId).padStart(12, '0')}`]
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
    const userId = req.user.id;
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
