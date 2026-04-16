const pool = require('../config/amasha-patientdb');

const findByUserId = async (userId) => {
  const result = await pool.query('SELECT * FROM patients WHERE user_id = $1', [userId]);
  return result.rows[0];
};

const createPatientFromAuth = async (userId, name, email, phone) => {
  const result = await pool.query(
    `INSERT INTO patients (user_id, name, email, phone)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, email, phone]
  );
  return result.rows[0];
};

const upsertPatient = async (userId, data) => {
  const { name, email, phone, dob, address, blood_group, emergency_contact } = data;
  const existing = await findByUserId(userId);

  if (existing) {
    const result = await pool.query(
      `UPDATE patients SET name=$1, email=$2, phone=$3, dob=$4,
       address=$5, blood_group=$6, emergency_contact=$7
       WHERE user_id=$8 RETURNING *`,
      [name, email, phone, dob, address, blood_group, emergency_contact, userId]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO patients (user_id, name, email, phone, dob, address, blood_group, emergency_contact)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, name, email, phone, dob, address, blood_group, emergency_contact]
    );
    return result.rows[0];
  }
};

const getReportsByPatientId = async (patientId) => {
  const result = await pool.query(
    'SELECT * FROM medical_reports WHERE patient_id = $1 ORDER BY uploaded_at DESC',
    [patientId]
  );
  return result.rows;
};

const insertReport = async (patientId, fileName, filePath, description) => {
  const result = await pool.query(
    `INSERT INTO medical_reports (patient_id, file_name, file_path, description)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [patientId, fileName, filePath, description]
  );
  return result.rows[0];
};

const getPrescriptionsByPatientId = async (patientId) => {
  const result = await pool.query(
    'SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY issued_at DESC',
    [patientId]
  );
  return result.rows;
};

module.exports = {
  findByUserId,
  createPatientFromAuth,
  upsertPatient,
  getReportsByPatientId,
  insertReport,
  getPrescriptionsByPatientId,
};