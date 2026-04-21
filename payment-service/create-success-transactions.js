const pool = require('./src/config/paymentdb');

async function createSuccessTransactions() {
  const appointments = [
    {
      appointment_id: 'd478a303-b787-4531-ae29-4d09a88cf206',
      patient_id: '00000000-0000-0000-0000-000000000009',
      doctor_id: '040741f4-c5cd-48a7-9f4c-eba39c41a349',
      amount: 3000.00
    },
    {
      appointment_id: '18d7e9b6-6345-4f0a-bb29-f15fb3e3d95f',
      patient_id: '00000000-0000-0000-0000-000000000009',
      doctor_id: '040741f4-c5cd-48a7-9f4c-eba39c41a349',
      amount: 3000.00
    }
  ];

  try {
    console.log('Creating SUCCESS transactions for appointments...\n');
    
    for (const appt of appointments) {
      // First check if transaction already exists
      const checkResult = await pool.query(
        `SELECT id, status FROM public.transactions WHERE appointment_id = $1`,
        [appt.appointment_id]
      );
      
      if (checkResult.rows.length > 0) {
        // Update existing transaction
        const existing = checkResult.rows[0];
        console.log(`Transaction already exists for ${appt.appointment_id}`);
        console.log(`  Current status: ${existing.status}`);
        
        const updateResult = await pool.query(
          `UPDATE public.transactions 
           SET status = 'SUCCESS', updated_at = CURRENT_TIMESTAMP 
           WHERE appointment_id = $1
           RETURNING id, status, updated_at`,
          [appt.appointment_id]
        );
        
        console.log(`  ✅ Updated to: ${updateResult.rows[0].status}`);
        console.log(`  Transaction ID: ${updateResult.rows[0].id}`);
        console.log(`  Updated at: ${updateResult.rows[0].updated_at}`);
      } else {
        // Insert new transaction
        const insertResult = await pool.query(
          `INSERT INTO public.transactions 
           (appointment_id, patient_id, doctor_id, amount, currency, payment_method, payment_gateway, status, transaction_type, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'LKR', 'payhere', 'payhere', 'SUCCESS', 'payment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id, status, created_at`,
          [appt.appointment_id, appt.patient_id, appt.doctor_id, appt.amount]
        );
        
        console.log(`✅ Created new transaction for ${appt.appointment_id}`);
        console.log(`  Transaction ID: ${insertResult.rows[0].id}`);
        console.log(`  Status: ${insertResult.rows[0].status}`);
        console.log(`  Amount: LKR ${appt.amount}`);
        console.log(`  Created: ${insertResult.rows[0].created_at}`);
      }
      console.log('');
    }
    
    console.log('🎉 All transactions marked as SUCCESS!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

createSuccessTransactions();
