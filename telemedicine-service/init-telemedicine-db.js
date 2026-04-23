// init-telemedicine-db.js
// Initialize telemedicine database with required tables
// Run this script once to set up the medicore_telemedicine database

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the telemedicine database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medicore_telemedicine',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
});

async function initializeDatabase() {
  console.log('🚀 Initializing Telemedicine Database...');
  console.log(`📊 Database: ${process.env.DB_NAME || 'medicore_telemedicine'}`);
  console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log('');

  try {
    // Read the SQL schema file
    const sqlFilePath = path.join(__dirname, 'sql', 'kaveesha-telemedicine.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL schema
    await pool.query(sql);
    
    console.log('✅ Database tables created successfully:');
    console.log('   - telemedicine_sessions');
    console.log('   - telemedicine_tokens');
    console.log('   - telemedicine_chat_messages');
    console.log('   - telemedicine_session_notes');
    console.log('   - telemedicine_events');
    console.log('');
    console.log('🎉 Telemedicine database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
