const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initPatientTable() {
  try {
    console.log('Connecting to patient database...');
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Create public schema if it doesn't exist
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Public schema created');
    
    // Set search path to public schema
    await client.query('SET search_path TO public');
    console.log('✅ Schema set to public');
    
    // Create patients table
    console.log('Creating patients table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Patients table ready');
    
    client.release();
    console.log('\n✅ Patient table created successfully!');
    console.log('\nTable structure:');
    console.log('- id (SERIAL PRIMARY KEY)');
    console.log('- user_id (INT, UNIQUE, NOT NULL)');
    console.log('- name (VARCHAR(100), NOT NULL)');
    console.log('- email (VARCHAR(150), NOT NULL)');
    console.log('- phone (VARCHAR(20))');
    console.log('- created_at (TIMESTAMP)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initPatientTable();
