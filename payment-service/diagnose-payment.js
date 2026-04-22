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

async function diagnosePayment() {
  const appointmentId = '580fe158-878f-4050-b6ca-b76c8fb32fac';
  
  console.log('=== Payment Diagnostic Tool ===');
  console.log('Checking appointment_id:', appointmentId);
  console.log('');
  
  try {
    // Check 1: Does appointment exist?
    console.log('1. Checking if appointment exists...');
    const appointmentQuery = `
      SELECT id, patient_id, doctor_id, status, scheduled_at 
      FROM public.appointments 
      WHERE id = $1
    `;
    const appointmentResult = await pool.query(appointmentQuery, [appointmentId]);
    
    if (appointmentResult.rows.length === 0) {
      console.log('❌ Appointment NOT FOUND in database!');
      console.log('This appointment_id does not exist.');
      return;
    }
    
    console.log('✅ Appointment found:');
    console.log('  ID:', appointmentResult.rows[0].id);
    console.log('  Patient ID:', appointmentResult.rows[0].patient_id);
    console.log('  Doctor ID:', appointmentResult.rows[0].doctor_id);
    console.log('  Status:', appointmentResult.rows[0].status);
    console.log('  Scheduled:', appointmentResult.rows[0].scheduled_at);
    console.log('');
    
    // Check 2: Does transaction exist?
    console.log('2. Checking if transaction exists...');
    const transactionQuery = `
      SELECT id, appointment_id, patient_id, doctor_id, amount, status, 
             gateway_transaction_id, created_at, updated_at
      FROM public.transactions 
      WHERE appointment_id = $1
    `;
    const transactionResult = await pool.query(transactionQuery, [appointmentId]);
    
    if (transactionResult.rows.length === 0) {
      console.log('❌ Transaction NOT FOUND!');
      console.log('No payment record exists for this appointment.');
      console.log('');
      console.log('THIS IS THE PROBLEM!');
      console.log('The payment was not created before redirecting to PayHere.');
      console.log('');
      console.log('Solution:');
      console.log('1. Check if POST /api/payments/initiate was called');
      console.log('2. Check payment-service logs for errors');
      console.log('3. Verify the appointment is in PENDING_PAYMENT status');
      return;
    }
    
    console.log('✅ Transaction found:');
    const txn = transactionResult.rows[0];
    console.log('  Transaction ID:', txn.id);
    console.log('  Appointment ID:', txn.appointment_id);
    console.log('  Patient ID:', txn.patient_id);
    console.log('  Doctor ID:', txn.doctor_id);
    console.log('  Amount:', txn.amount);
    console.log('  Status:', txn.status);
    console.log('  Gateway Transaction ID:', txn.gateway_transaction_id);
    console.log('  Created:', txn.created_at);
    console.log('  Updated:', txn.updated_at);
    console.log('');
    
    // Check 3: Verify patient_id matches
    console.log('3. Verifying patient_id matches...');
    if (appointmentResult.rows[0].patient_id === txn.patient_id) {
      console.log('✅ Patient IDs match');
    } else {
      console.log('⚠️  Patient ID mismatch!');
      console.log('  Appointment patient_id:', appointmentResult.rows[0].patient_id);
      console.log('  Transaction patient_id:', txn.patient_id);
    }
    console.log('');
    
    // Check 4: Status analysis
    console.log('4. Status Analysis:');
    console.log('  Appointment Status:', appointmentResult.rows[0].status);
    console.log('  Transaction Status:', txn.status);
    
    if (txn.status === 'PENDING') {
      console.log('');
      console.log('⚠️  Payment is still PENDING');
      console.log('This means:');
      console.log('- PayHere webhook has not been received yet, OR');
      console.log('- Webhook failed to process, OR');
      console.log('- Payment was not completed on PayHere');
      console.log('');
      console.log('Check payment-service logs for webhook processing.');
    } else if (txn.status === 'SUCCESS') {
      console.log('');
      console.log('✅ Payment is SUCCESS');
      console.log('If frontend shows error, check:');
      console.log('- Frontend is using correct appointment_id');
      console.log('- API endpoint /api/payments/order/ORDER_xxx is working');
      console.log('- Authorization token is valid');
    }
    console.log('');
    
    // Check 5: All transactions for this appointment
    console.log('5. All transactions for this appointment:');
    console.log('  Total:', transactionResult.rows.length, 'transaction(s)');
    transactionResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Status: ${row.status}, Created: ${row.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
  
  console.log('');
  console.log('=== Diagnostic Complete ===');
}

diagnosePayment();
