const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    // Get all users
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    
    console.log(`Found ${result.rows.length} users:\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'NO EMAIL'}`);
      console.log(`   Role: ${user.role || 'NO ROLE'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    // Check the specific patient ID from the appointment
    const patientId = '00000000-0000-0000-0000-000000000015';
    const checkResult = await pool.query('SELECT id FROM users WHERE id::text = $1', [patientId]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Patient ID from appointment NOT FOUND in users table:');
      console.log(`   ${patientId}`);
      console.log('\n⚠️  THIS IS THE PROBLEM!');
      console.log('   The appointment was created with a user ID that does not exist.');
      console.log('   Solution: Login with an existing account and book a new appointment.');
    } else {
      console.log('✅ Patient ID exists in users table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
