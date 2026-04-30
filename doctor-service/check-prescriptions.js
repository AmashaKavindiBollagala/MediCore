require('dotenv').config();
const pool = require('./src/config/kaveesha-doctorPool');

async function checkPrescriptions() {
  try {
    const result = await pool.query(
      'SELECT id, appointment_id, patient_id, doctor_id FROM prescriptions LIMIT 10'
    );
    console.log('Prescriptions:');
    result.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Patient ID: ${row.patient_id}, Doctor ID: ${row.doctor_id}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPrescriptions();
