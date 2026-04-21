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

async function initPaymentTable() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to Neon database...');
    
    // Enable UUID support
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ pgcrypto extension enabled');
    
    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appointment_id VARCHAR(255) NOT NULL,
        patient_id VARCHAR(255) NOT NULL,
        doctor_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'LKR',
        payment_method VARCHAR(50),
        payment_gateway VARCHAR(50) DEFAULT 'payhere',
        status VARCHAR(20) DEFAULT 'PENDING',
        transaction_type VARCHAR(20) DEFAULT 'payment',
        gateway_transaction_id VARCHAR(255),
        refund_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ transactions table created');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id ON public.transactions(appointment_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_patient_id ON public.transactions(patient_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_doctor_id ON public.transactions(doctor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at)');
    console.log('✅ indexes created');
    
    console.log('\n🎉 Payment database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing payment database:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initPaymentTable();
