require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkDoctors() {
  try {
    console.log('Checking doctors in profiles table...\n');
    
    const result = await pool.query('SELECT id, first_name, last_name, email, specialty, verification_status, verified FROM profiles');
    
    if (result.rows.length === 0) {
      console.log('⚠️  No doctors found in the profiles table!');
    } else {
      console.log(`✅ Found ${result.rows.length} doctor(s):\n`);
      result.rows.forEach((doctor, index) => {
        console.log(`Doctor ${index + 1}:`);
        console.log(`  ID: ${doctor.id}`);
        console.log(`  Name: Dr. ${doctor.first_name} ${doctor.last_name}`);
        console.log(`  Email: ${doctor.email}`);
        console.log(`  Specialty: ${doctor.specialty}`);
        console.log(`  Verification: ${doctor.verification_status} (verified: ${doctor.verified})`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDoctors();
