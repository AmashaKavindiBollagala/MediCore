/**
 * Manual Payment Completion Script
 * 
 * This script manually processes payments that are stuck in PENDING status.
 * It does what the PayHere webhook should do automatically.
 * 
 * USAGE:
 * node complete-pending-payments.js
 */

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

async function completePendingPayments() {
  const client = await pool.connect();
  
  try {
    console.log('=== Manual Payment Completion Tool ===\n');
    
    // Step 1: Find all PENDING transactions
    console.log('Step 1: Finding all PENDING transactions...\n');
    
    const pendingQuery = `
      SELECT t.id, t.appointment_id, t.patient_id, t.doctor_id, 
             t.amount, t.payment_method, t.created_at,
             a.status as appointment_status
      FROM public.transactions t
      JOIN public.appointments a ON t.appointment_id = a.id
      WHERE t.status = 'PENDING' 
        AND t.transaction_type = 'payment'
        AND a.status = 'PENDING_PAYMENT'
      ORDER BY t.created_at DESC
    `;
    
    const pendingResult = await pool.query(pendingQuery);
    
    if (pendingResult.rows.length === 0) {
      console.log('✅ No PENDING transactions found. All payments are processed!');
      return;
    }
    
    console.log(`Found ${pendingResult.rows.length} PENDING transaction(s):\n`);
    
    pendingResult.rows.forEach((txn, index) => {
      console.log(`${index + 1}. Transaction ID: ${txn.id}`);
      console.log(`   Appointment ID: ${txn.appointment_id}`);
      console.log(`   Amount: LKR ${txn.amount}`);
      console.log(`   Payment Method: ${txn.payment_method}`);
      console.log(`   Appointment Status: ${txn.appointment_status}`);
      console.log(`   Created: ${txn.created_at}`);
      console.log('');
    });
    
    // Step 2: Ask user which payments to complete
    console.log('='.repeat(60));
    console.log('OPTIONS:');
    console.log('='.repeat(60));
    console.log('1. Complete ALL pending payments');
    console.log('2. Complete specific payment (you will enter appointment_id)');
    console.log('3. Exit without making changes');
    console.log('');
    
    // For now, auto-complete all (you can modify this to be interactive)
    console.log('Auto-completing ALL pending payments...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const txn of pendingResult.rows) {
      try {
        console.log(`Processing transaction: ${txn.id}`);
        console.log(`Appointment: ${txn.appointment_id}`);
        
        await client.query('BEGIN');
        
        // Update transaction to SUCCESS
        const updateTransactionQuery = `
          UPDATE public.transactions 
          SET status = 'SUCCESS',
              gateway_transaction_id = $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        
        const gatewayTransactionId = `ORDER_${txn.appointment_id}`;
        const transactionResult = await client.query(updateTransactionQuery, [
          gatewayTransactionId,
          txn.id
        ]);
        
        console.log('✅ Transaction updated to SUCCESS');
        
        // Update appointment to CONFIRMED
        const updateAppointmentQuery = `
          UPDATE public.appointments 
          SET status = 'CONFIRMED',
              payment_id = $1,
              updated_at = NOW()
          WHERE id = $2 AND status = 'PENDING_PAYMENT'
          RETURNING *
        `;
        
        const appointmentResult = await client.query(updateAppointmentQuery, [
          txn.id,
          txn.appointment_id
        ]);
        
        if (appointmentResult.rows.length > 0) {
          console.log('✅ Appointment updated to CONFIRMED');
        } else {
          console.log('⚠️  Appointment was not in PENDING_PAYMENT status (may have been updated already)');
        }
        
        await client.query('COMMIT');
        successCount++;
        console.log('✅ Payment completed successfully!\n');
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error processing transaction ${txn.id}:`, error.message);
        errorCount++;
        console.log('');
      }
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total PENDING transactions: ${pendingResult.rows.length}`);
    console.log(`Successfully completed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('');
    
    if (successCount > 0) {
      console.log('✅ All pending payments have been completed!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Check the frontend - payments should now show as SUCCESS');
      console.log('2. Appointments should show as CONFIRMED');
      console.log('3. For future payments, ensure webhook URL is accessible');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
  
  console.log('\n=== Process Complete ===');
}

// Run the script
completePendingPayments().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
