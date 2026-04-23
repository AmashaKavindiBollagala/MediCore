const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DOCTOR_DATABASE_URL || 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/medicore_doctor?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'patient_reports'
      ORDER BY ordinal_position
    `);
    
    console.log('patient_reports table schema:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
