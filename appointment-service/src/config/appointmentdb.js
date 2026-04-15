const { Pool } = require('pg');
const config = require('./appointmentdatabase');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

module.exports = pool;
