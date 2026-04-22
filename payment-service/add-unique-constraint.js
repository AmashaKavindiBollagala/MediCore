const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function addUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database...');
    
    // Add unique constraint on appointment_id to ensure one appointment = one transaction
    await client.query(`
      ALTER TABLE public.transactions 
      ADD CONSTRAINT uk_transactions_appointment_id 
      UNIQUE (appointment_id)
    `);
    
    console.log('✅ Unique constraint added on appointment_id');
    console.log('🎉 One appointment can now only have one transaction!');
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  Unique constraint already exists or duplicate data found');
      console.log('Error:', error.message);
    } else if (error.code === '42710') {
      console.log('⚠️  Constraint already exists');
    } else {
      console.error('❌ Error adding unique constraint:', error.message);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addUniqueConstraint();
