const pool = require('./src/config/paymentdb');

async function updatePaymentStatus() {
  const appointmentIds = [
    'd478a303-b787-4531-ae29-4d09a88cf206',
    '18d7e9b6-6345-4f0a-bb29-f15fb3e3d95f'
  ];

  try {
    console.log('Updating payment status for appointments...');
    
    for (const appointmentId of appointmentIds) {
      // Update the transaction status to 'SUCCESS' for the given appointment_id
      const result = await pool.query(
        `UPDATE public.transactions 
         SET status = 'SUCCESS', updated_at = CURRENT_TIMESTAMP 
         WHERE appointment_id = $1`,
        [appointmentId]
      );
      
      console.log(`Appointment ${appointmentId}: ${result.rowCount} record(s) updated`);
    }
    
    console.log('✅ Payment status update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating payment status:', error.message);
  } finally {
    await pool.end();
  }
}

updatePaymentStatus();
