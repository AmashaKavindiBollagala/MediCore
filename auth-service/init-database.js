const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Create public schema if it doesn't exist
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Public schema created');
    
    // Set search path to public schema
    await client.query('SET search_path TO public');
    console.log('✅ Schema set to public');
    
    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table ready');
    
    // Create patients table
    console.log('Creating patients table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        dob DATE,
        address TEXT,
        blood_group VARCHAR(5),
        emergency_contact VARCHAR(100),
        consultation_type VARCHAR(20) CHECK (consultation_type IN ('online', 'physical')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Patients table ready');
    
    // Create medical_reports table
    console.log('Creating medical_reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_reports (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        description TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Medical reports table ready');
    
    // Create prescriptions table
    console.log('Creating prescriptions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
        doctor_name VARCHAR(100),
        appointment_id INT,
        medicine TEXT,
        dosage TEXT,
        notes TEXT,
        issued_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Prescriptions table ready');
    
    client.release();
    console.log('\n✅ All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initDatabase();
