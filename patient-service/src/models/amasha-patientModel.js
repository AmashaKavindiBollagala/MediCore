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

const updatePatientProfile = async (userId, data) => {
  const { name, email, phone, dob, address, blood_group, emergency_contact } = data;
  const result = await pool.query(
    `UPDATE patients 
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         dob = COALESCE($5, dob),
         address = COALESCE($6, address),
         blood_group = COALESCE($7, blood_group),
         emergency_contact = COALESCE($8, emergency_contact),
         updated_at = NOW()
     WHERE user_id = $1 
     RETURNING *`,
    [userId, name, email, phone, dob, address, blood_group, emergency_contact]
  );
  return result.rows[0];
};

module.exports = {
  findByUserId,
  createPatientFromAuth,
  updatePatientProfile,
};