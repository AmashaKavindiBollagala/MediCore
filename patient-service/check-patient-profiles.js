const { Pool } = require('pg');

// Patient database connection
const patientPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/patient_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkPatientProfiles() {
  try {
    console.log('Checking patient profiles...\n');

    // Get all users from auth-service database (we'll need to check auth db)
    // For now, let's see what patients exist
    const patients = await patientPool.query('SELECT * FROM patients LIMIT 10');
    
    console.log('Existing patients:');
    console.table(patients.rows);

    console.log('\nTotal patients:', patients.rows.length);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await patientPool.end();
  }
}

checkPatientProfiles();
