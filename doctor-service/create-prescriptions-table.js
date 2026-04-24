const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createPrescriptionsTable() {
  try {
    // Drop existing table to recreate with correct structure
    await pool.query('DROP TABLE IF EXISTS prescriptions CASCADE');
    console.log('🗑️  Dropped existing prescriptions table');
    
    await pool.query(`
      CREATE TABLE prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appointment_id UUID NOT NULL,
        doctor_id UUID NOT NULL,
        patient_id UUID NOT NULL,
        diagnosis TEXT,
        prescription_data JSONB NOT NULL,
        notes TEXT,
        issued_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Prescriptions table created successfully');
    
    // Check if table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      ORDER BY ordinal_position
    `);
    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createPrescriptionsTable();
