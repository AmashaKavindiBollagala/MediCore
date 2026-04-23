// create-telemedicine-db.js
// Create medicore_telemedicine database on Neon
// Run this ONCE to create the database

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connect to the default 'neondb' database to create our new database
const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'neondb', // Connect to default database first
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function createDatabase() {
  console.log('🚀 Creating medicore_telemedicine database...');
  console.log(`📊 Host: ${process.env.DB_HOST}`);
  console.log(`👤 User: ${process.env.DB_USER}`);
  console.log('');

  try {
    // Create the database (ignore error if it already exists)
    await adminPool.query(`
      CREATE DATABASE medicore_telemedicine;
    `);
    
    console.log('✅ Database "medicore_telemedicine" created successfully!');
    console.log('');
    console.log('🎉 Next step: Run init-telemedicine-db.js to create tables');
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database "medicore_telemedicine" already exists!');
      console.log('');
      console.log('🎉 Next step: Run init-telemedicine-db.js to create tables');
    } else {
      console.error('❌ Failed to create database:', error.message);
      console.error('Error code:', error.code);
      console.log('');
      console.log('💡 Alternative: Create the database manually via Neon Dashboard');
      console.log('   https://console.neon.tech/');
      process.exit(1);
    }
  } finally {
    await adminPool.end();
  }
}

createDatabase();
