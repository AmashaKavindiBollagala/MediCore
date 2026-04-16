const { Pool } = require('pg');
const config = require('./appointmentdatabase');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false // Disable SSL in local development to avoid connection errors
});

module.exports = pool;
