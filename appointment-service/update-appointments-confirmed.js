const pool = require('./src/config/appointmentdb');

async function updateAppointmentsToConfirmed() {
  const appointmentIds = [
    'd478a303-b787-4531-ae29-4d09a88cf206',
    '18d7e9b6-6345-4f0a-bb29-f15fb3e3d95f'
  ];

  try {
    console.log('Updating appointments to CONFIRMED status...\n');
    
    for (const appointmentId of appointmentIds) {
      // Get transaction ID for this appointment
      const transactionResult = await pool.query(
        `SELECT id FROM public.transactions WHERE appointment_id = $1 AND status = 'SUCCESS'`,
        [appointmentId]
      );
      
      // Since transactions are in payment-service DB, we'll just update the appointment status
      const updateResult = await pool.query(
        `UPDATE public.appointments 
         SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND status = 'PENDING_PAYMENT'
         RETURNING id, status, patient_name, scheduled_at`,
        [appointmentId]
      );
      
      if (updateResult.rows.length > 0) {
        const appt = updateResult.rows[0];
        console.log(`✅ Updated appointment ${appointmentId}`);
        console.log(`   Patient: ${appt.patient_name}`);
        console.log(`   Status: ${appt.status}`);
        console.log(`   Scheduled: ${appt.scheduled_at}`);
      } else {
        console.log(`⚠️  Appointment ${appointmentId} not updated (may already be CONFIRMED or not found)`);
      }
      console.log('');
    }
    
    console.log('🎉 All appointments updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

updateAppointmentsToConfirmed();
