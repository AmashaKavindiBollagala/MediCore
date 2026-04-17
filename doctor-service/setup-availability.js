const pool = require('./src/config/kaveesha-doctorPool');

async function setup() {
  try {
    console.log('Checking and creating availability tables...\n');
    
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
    console.log('✅ availability table ready');
    
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
    console.log('✅ availability_exceptions table ready');
    
    console.log('\n✅ All tables are set up!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

setup();
