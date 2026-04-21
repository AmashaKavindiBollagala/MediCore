const pool = require('./src/config/appointmentdb.js');

async function fixSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to database');
    
    // Drop and recreate the table with correct ID types
    await client.query('DROP TABLE IF EXISTS public.appointments CASCADE');
    console.log('✅ Dropped old appointments table');
    
    // patient_id = INTEGER (from auth-service users table)
    // doctor_id = UUID (from doctor-service profiles table)
    await client.query(`
      CREATE TABLE public.appointments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id INTEGER NOT NULL,
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
    console.log('✅ Created new appointments table with correct ID types');
    console.log('   - patient_id: INTEGER (from auth-service users table)');
    console.log('   - doctor_id: UUID (from doctor-service profiles table)');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at)');
    console.log('✅ indexes created');
    
    console.log('🎉 Schema fix complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema();
