const pool = require('../config/kaveesha-doctorPool');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  console.log('[getDoctorProfileId] Looking for user_id:', userId);
  
  // First try: look for user_id
  let result = await pool.query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length > 0) {
    console.log('[getDoctorProfileId] Found profile with user_id:', result.rows[0].id);
    return result.rows[0].id;
  }
  
  // Fallback: check if userId is itself a profile id
  console.log('[getDoctorProfileId] user_id not found, checking if userId is a profile id');
  const checkResult = await pool.query(
    'SELECT id FROM profiles WHERE id = $1',
    [userId]
  );
  
  if (checkResult.rows.length > 0) {
    console.log('[getDoctorProfileId] userId is a profile id:', checkResult.rows[0].id);
    return checkResult.rows[0].id;
  }
  
  console.log('[getDoctorProfileId] No profile found for userId:', userId);
  return null;
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
    // Insert prescription directly (bookings table is in appointment-service DB)
    const result = await pool.query(
      `INSERT INTO prescriptions 
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
              pr.first_name || ' ' || pr.last_name as patient_name
       FROM prescriptions p
       LEFT JOIN profiles pr ON p.patient_id = pr.id
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
      `SELECT p.*
       FROM prescriptions p
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
      `SELECT p.*,
              pr.first_name || ' ' || pr.last_name as patient_name
       FROM prescriptions p
       LEFT JOIN profiles pr ON p.patient_id = pr.id
       WHERE p.appointment_id = $1 AND p.doctor_id = $2
       ORDER BY p.issued_at DESC`,
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

  const { prescription_data, notes, diagnosis } = req.body;

  try {
    const result = await pool.query(
      `UPDATE prescriptions 
       SET prescription_data = COALESCE($1, prescription_data),
           notes = COALESCE($2, notes),
           diagnosis = COALESCE($3, diagnosis)
       WHERE id = $4 AND doctor_id = $5
       RETURNING *`,
      [prescription_data, notes, diagnosis, req.params.id, doctorId]
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

// ─── GET /patients/:patientId/prescriptions — Get patient's prescriptions ─────
const getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;

  console.log('[getPatientPrescriptions] Fetching prescriptions for patient_id:', patientId);

  try {
    const result = await pool.query(
      `SELECT p.*, 
              pr.first_name || ' ' || pr.last_name as doctor_name
       FROM prescriptions p
       LEFT JOIN profiles pr ON p.doctor_id = pr.id
       WHERE p.patient_id = $1
       ORDER BY p.issued_at DESC`,
      [patientId]
    );

    console.log('[getPatientPrescriptions] Found', result.rows.length, 'prescriptions');
    res.json(result.rows);
  } catch (err) {
    console.error('[getPatientPrescriptions]', err);
    res.status(500).json({ error: err.message });
  }
};

// Get prescriptions by user_id (looks up patient UUID from patient-service)
const getPatientPrescriptionsByUserId = async (req, res) => {
  const { userId } = req.params;

  console.log('[getPatientPrescriptionsByUserId] Fetching prescriptions for user_id:', userId);

  try {
    // The prescriptions table stores patient_id as UUID-formatted user_id
    // Example: user_id 9 → 00000000-0000-0000-0000-000000000009
    const paddedId = userId.toString().padStart(12, '0');
    const patientUUID = `00000000-0000-0000-0000-${paddedId}`;
    console.log('[getPatientPrescriptionsByUserId] user_id:', userId, '→ patient_id:', patientUUID);

    // Fetch prescriptions from doctor database with appointment details
    // Note: We need to connect to appointment-service database to get appointment details
    const appointmentDbUrl = process.env.APPOINTMENT_DATABASE_URL;
    
    const result = await pool.query(
      `SELECT p.*, 
              pr.first_name || ' ' || pr.last_name as doctor_name,
              pr.specialty as doctor_specialty
       FROM prescriptions p
       LEFT JOIN profiles pr ON p.doctor_id = pr.id
       WHERE p.patient_id = $1
       ORDER BY p.issued_at DESC`,
      [patientUUID]
    );

    console.log('[getPatientPrescriptionsByUserId] Found', result.rows.length, 'prescriptions');
    
    // If we have prescriptions and appointment DB is configured, enrich with appointment data
    if (result.rows.length > 0 && appointmentDbUrl) {
      const { Pool } = require('pg');
      const appointmentPool = new Pool({
        connectionString: appointmentDbUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        // Get all appointment IDs
        const appointmentIds = result.rows.map(rx => rx.appointment_id);
        
        // Fetch appointment details
        const apptResult = await appointmentPool.query(
          'SELECT id, patient_name, symptoms FROM appointments WHERE id = ANY($1)',
          [appointmentIds]
        );

        // Create a map of appointment_id to appointment details
        const apptMap = {};
        apptResult.rows.forEach(appt => {
          apptMap[appt.id] = {
            patient_name: appt.patient_name,
            symptoms: appt.symptoms
          };
        });

        // Enrich prescriptions with appointment data
        result.rows.forEach(rx => {
          const appt = apptMap[rx.appointment_id];
          if (appt) {
            rx.patient_name = appt.patient_name;
            rx.symptoms = appt.symptoms;
          }
        });

        console.log('[getPatientPrescriptionsByUserId] Enriched prescriptions with appointment data');
      } catch (err) {
        console.error('[getPatientPrescriptionsByUserId] Error fetching appointment data:', err.message);
      } finally {
        await appointmentPool.end();
      }
    }
    
    if (result.rows.length > 0) {
      console.log('[getPatientPrescriptionsByUserId] First prescription:', result.rows[0].id);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('[getPatientPrescriptionsByUserId]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  issuePrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getPrescriptionsByAppointment,
  updatePrescription,
  getPatientPrescriptions,
  getPatientPrescriptionsByUserId,
};
