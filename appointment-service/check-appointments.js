const pool = require('./src/config/appointmentdb');

async function checkAppointments() {
  const appointmentIds = [
    'd478a303-b787-4531-ae29-4d09a88cf206',
    '18d7e9b6-6345-4f0a-bb29-f15fb3e3d95f'
  ];

  try {
    console.log('Checking appointments in appointment-service database...\n');
    
    for (const appointmentId of appointmentIds) {
      const result = await pool.query(
        `SELECT id, patient_id, doctor_id, scheduled_at, status, consultation_fee, consultation_type, patient_name
         FROM public.appointments 
         WHERE id = $1`,
        [appointmentId]
      );
      
      console.log(`Appointment ${appointmentId}:`);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`  Patient: ${row.patient_name} (${row.patient_id})`);
        console.log(`  Doctor: ${row.doctor_id}`);
        console.log(`  Scheduled: ${row.scheduled_at}`);
        console.log(`  Status: ${row.status}`);
        console.log(`  Fee: ${row.consultation_fee}`);
        console.log(`  Type: ${row.consultation_type}`);
      } else {
        console.log('  NOT FOUND in appointment-service database');
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAppointments();
