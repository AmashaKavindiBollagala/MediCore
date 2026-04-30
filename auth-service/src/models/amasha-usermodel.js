const pool = require('../config/amasha-Authdb');

const findByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const createUser = async (name, email, hashedPassword, role, phone) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone',
    [name, email, hashedPassword, role, phone || null]
  );
  return result.rows[0];
};

const findById = async (id) => {
  // Handle both UUID and integer IDs
  const result = await pool.query(
    'SELECT id, name, email, role, phone, created_at FROM users WHERE id::text = $1',
    [id]
  );
  return result.rows[0];
};

module.exports = { findByEmail, createUser, findById };