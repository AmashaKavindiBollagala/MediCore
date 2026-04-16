require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function updateProfilesTable() {
  const client = await pool.connect();
  try {
    console.log('Connected to medicore_doctor database');

    // Add ai_analysis column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS ai_analysis JSONB
    `);
    console.log('✅ Added ai_analysis column');

    // Add consultation_fee_online column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS consultation_fee_online INTEGER
    `);
    console.log('✅ Added consultation_fee_online column');

    // Add consultation_fee_physical column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS consultation_fee_physical INTEGER
    `);
    console.log('✅ Added consultation_fee_physical column');

    // Add bio column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS bio TEXT
    `);
    console.log('✅ Added bio column');

    // Add id_card_url column if it doesn't exist (alias for id_card_front_url)
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS id_card_url TEXT
    `);
    console.log('✅ Added id_card_url column');

    // Add medical_id_url column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS medical_id_url TEXT
    `);
    console.log('✅ Added medical_id_url column');

    console.log('\n✅ All columns added successfully!');
  } catch (error) {
    console.error('Error updating profiles table:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateProfilesTable();
