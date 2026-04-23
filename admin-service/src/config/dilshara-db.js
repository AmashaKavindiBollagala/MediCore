// admin-service/src/config/dilshara-db.js
const { Pool } = require('pg');

// Pool for doctor database (medicore_doctor)
const doctorPool = new Pool({
  connectionString: process.env.DOCTOR_DB_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

doctorPool.on('error', (err) => {
  console.error('Unexpected PG pool error (doctor DB):', err.message);
});

// Pool for main database (neondb) - for transactions, users, appointments
const mainPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

mainPool.on('error', (err) => {
  console.error('Unexpected PG pool error (main DB):', err.message);
});

module.exports = { doctorPool, mainPool };