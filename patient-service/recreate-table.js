const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function recreatePatientTable() {
  try {
    console.log('Connecting to patient_db...');
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Drop old table if exists
    console.log('Dropping old patients table...');
    await client.query('DROP TABLE IF EXISTS patients CASCADE');
    console.log('✅ Old table dropped');
    
    // Create new simplified patients table
    console.log('Creating new patients table...');
    await client.query(`
      CREATE TABLE patients (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ New patients table created');
    
    // Verify structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'patients'
      ORDER BY ordinal_position
    `);
    
    console.log('\nNew table structure:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'})`);
    });
    
    client.release();
    console.log('\n✅ Patient table recreated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

recreatePatientTable();
