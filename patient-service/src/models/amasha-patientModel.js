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

module.exports = {
  findByUserId,
  createPatientFromAuth,
};