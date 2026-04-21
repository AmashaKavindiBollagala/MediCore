const { Pool } = require('pg');

const pool = new Pool({
  host: 'ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'medicore_doctor',
  user: 'neondb_owner',
  password: 'npg_ZnWA9KSEqO7c',
  ssl: { rejectUnauthorized: false }
});

async function checkDoctorDocuments() {
  try {
    console.log('Checking doctor documents in database...\n');
    
    const result = await pool.query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        profile_photo_url,
        id_card_front_url,
        id_card_back_url,
        medical_license_url,
        degree_certificates_url
      FROM profiles
      LIMIT 5
    `);
    
    console.log(`Found ${result.rows.length} doctors:\n`);
    
    result.rows.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}: ${doctor.first_name} ${doctor.last_name}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Profile Photo: ${doctor.profile_photo_url || 'NULL'}`);
      console.log(`  ID Card Front: ${doctor.id_card_front_url || 'NULL'}`);
      console.log(`  ID Card Back: ${doctor.id_card_back_url || 'NULL'}`);
      console.log(`  Medical License: ${doctor.medical_license_url || 'NULL'}`);
      console.log(`  Degree Certificates: ${doctor.degree_certificates_url || 'NULL'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDoctorDocuments();
