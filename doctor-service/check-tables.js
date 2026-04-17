const pool = require('./src/config/kaveesha-doctorPool');

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('availability', 'availability_exceptions')
    `);
    
    console.log('Tables found:', result.rows.length);
    result.rows.forEach(row => {
      console.log(' -', row.table_name);
    });
    
    if (result.rows.length === 0) {
      console.log('\n⚠️  Tables do not exist. Running SQL from neon-init.sql...');
      
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
      console.log('✅ availability table created');
      
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
      console.log('✅ availability_exceptions table created');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
