const pool = require('./src/config/paymentdb');

async function checkTransactions() {
  const appointmentIds = [
    'd478a303-b787-4531-ae29-4d09a88cf206',
    '18d7e9b6-6345-4f0a-bb29-f15fb3e3d95f'
  ];

  try {
    console.log('Checking transactions for appointments...');
    
    for (const appointmentId of appointmentIds) {
      const result = await pool.query(
        `SELECT id, appointment_id, patient_id, doctor_id, amount, status, created_at 
         FROM public.transactions 
         WHERE appointment_id = $1`,
        [appointmentId]
      );
      
      console.log(`\nAppointment ${appointmentId}:`);
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          console.log(`  Transaction ID: ${row.id}`);
          console.log(`  Status: ${row.status}`);
          console.log(`  Amount: ${row.amount} ${row.currency || 'LKR'}`);
          console.log(`  Created: ${row.created_at}`);
          console.log('  ---');
        });
      } else {
        console.log('  No transactions found');
      }
    }
    
    // Also show all transactions in the table
    console.log('\n--- All transactions in table ---');
    const allResult = await pool.query(
      `SELECT id, appointment_id, status, amount, created_at 
       FROM public.transactions 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    
    allResult.rows.forEach(row => {
      console.log(`Appointment: ${row.appointment_id} | Status: ${row.status} | Amount: ${row.amount} | Created: ${row.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTransactions();
