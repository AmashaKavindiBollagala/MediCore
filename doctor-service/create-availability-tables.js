require('dotenv').config({ path: './doctor-service/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createAvailabilityTables() {
  try {
    console.log('Creating availability tables in medicore_doctor database...\n');
    
    // Create availability table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        slot_duration_minutes INTEGER DEFAULT 30,
        consultation_type VARCHAR(20) DEFAULT 'online' CHECK (consultation_type IN ('online', 'physical', 'both')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ availability table created/verified');
    
    // Create availability_exceptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability_exceptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        exception_date DATE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(doctor_id, exception_date)
      )
    `);
    console.log('✅ availability_exceptions table created/verified');
    
    console.log('\n✅ All availability tables are ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

createAvailabilityTables();
