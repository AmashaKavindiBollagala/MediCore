const { Pool } = require('pg');
const config = require('./paymentdatabase');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

module.exports = pool;
