require('dotenv').config();
const pool = require('./src/config/kaveesha-doctorPool');

async function checkProfiles() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position
    `);
    console.log('Profiles columns:', result.rows);
    
    // Also check sample data
    const sample = await pool.query('SELECT id, user_id, email, first_name, last_name FROM profiles LIMIT 3');
    console.log('Sample profiles:', sample.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkProfiles();
