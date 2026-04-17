const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to database:', process.env.DB_NAME);
    
    // Enable UUID support
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ pgcrypto extension enabled');
    
    // Create appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.appointments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL,
          doctor_id UUID NOT NULL,
          scheduled_at TIMESTAMP NOT NULL,
          
          consultation_type VARCHAR(50) 
          CHECK (consultation_type IN ('video', 'physical')) 
          DEFAULT 'video',

          symptoms TEXT,
          specialty VARCHAR(100),
          status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
          payment_id UUID,

          patient_name VARCHAR(255) NOT NULL,
          patient_age INTEGER,
          consultation_fee DECIMAL(10, 2) NOT NULL,

          cancelled_by VARCHAR(50),
          cancellation_reason TEXT,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ appointments table created');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at)');
    console.log('✅ indexes created');
    
    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
