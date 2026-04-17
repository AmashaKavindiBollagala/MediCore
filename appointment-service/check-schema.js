const pool = require('./src/config/appointmentdb.js');

pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'appointments' 
  AND column_name IN ('patient_id', 'doctor_id')
`)
.then(r => {
  console.log('Column types:');
  r.rows.forEach(row => {
    console.log(`${row.column_name}: ${row.data_type}`);
  });
  process.exit(0);
})
.catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
