const { Pool } = require('pg');
require('dotenv').config();

// Test connection to patient_db
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing patient_db connection...');
    console.log('Connection string:', process.env.DATABASE_URL);
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Check current database
    const dbResult = await client.query('SELECT current_database()');
    console.log('Current database:', dbResult.rows[0].current_database);
    
    // Check if patients table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patients'
      )
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ patients table exists');
      
      // Show table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'patients'
        ORDER BY ordinal_position
      `);
      console.log('\nTable structure:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'})`);
      });
    } else {
      console.log('❌ patients table does NOT exist');
    }
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    if (error.message.includes('database')) {
      console.error('\nThe database "patient_db" does not exist in your Neon project.');
      console.error('You need to either:');
      console.error('1. Create the database in your Neon dashboard, OR');
      console.error('2. Use the existing database with a different schema');
    }
    process.exit(1);
  }
}

testConnection();
