const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initDoctorTable() {
  try {
    console.log('Connecting to medicore_doctor database...');
    const client = await pool.connect();
    console.log('✅ Connected to database:', process.env.DB_NAME);
    
    // Create public schema
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Public schema ready');
    
    // Create profiles table
    console.log('Creating profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(20),
        specialty VARCHAR(100) NOT NULL,
        sub_specialty VARCHAR(100),
        hospital VARCHAR(200),
        hospital_address TEXT,
        medical_license_number VARCHAR(100) UNIQUE NOT NULL,
        license_issuing_authority VARCHAR(200),
        years_of_experience INTEGER,
        profile_photo_url TEXT,
        id_card_front_url TEXT,
        id_card_back_url TEXT,
        medical_license_url TEXT,
        degree_certificates_url TEXT,
        verification_status VARCHAR(20) DEFAULT 'pending',
        verified BOOLEAN DEFAULT false,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ profiles table created');
    
    client.release();
    console.log('\n✅ Doctor database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initDoctorTable();
