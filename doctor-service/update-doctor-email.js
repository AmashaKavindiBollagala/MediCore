// Script to update doctor email in medicore_doctor database
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DOCTOR_DB_URL || 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/medicore_doctor?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function updateDoctorEmail() {
  const doctorId = '00854469-ab5c-4f28-b76d-59d4f62e178a';
  const email = 'bollagalawasantha@gmail.com';

  try {
    console.log('Updating doctor email...');
    console.log(`Doctor ID: ${doctorId}`);
    console.log(`Email: ${email}\n`);

    const result = await pool.query(
      `UPDATE profiles SET email = $1 WHERE id = $2 RETURNING id, email, full_name, specialty`,
      [email, doctorId]
    );

    if (result.rows.length > 0) {
      console.log('✅ Doctor email updated successfully!');
      console.log('Updated doctor:', result.rows[0]);
    } else {
      console.log('❌ Doctor not found');
    }
  } catch (error) {
    console.error('❌ Error updating email:', error.message);
  } finally {
    await pool.end();
  }
}

updateDoctorEmail();
