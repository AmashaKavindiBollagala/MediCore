const { Pool } = require('pg');

// Database configuration (same as auth-service)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    console.log('🔍 Checking if user exists in database...\n');
    
    const userId = '00000000-0000-0000-0000-000000000015';
    
    // Check if user exists
    const result = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User NOT FOUND in database!');
      console.log(`   User ID: ${userId}`);
      console.log('\nThis is why the auth-service is returning 500 error.');
      console.log('The user does not exist in the users table.');
    } else {
      const user = result.rows[0];
      console.log('✅ User found in database:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone || 'NOT SET'}`);
      console.log(`   Created: ${user.created_at}`);
      
      if (!user.email) {
        console.log('\n⚠️  WARNING: User has NO EMAIL!');
        console.log('   This will cause notifications to fail.');
      }
    }
    
    // Also check all users to see what's available
    console.log('\n📋 All users in database:');
    const allUsers = await pool.query('SELECT id, name, email, role FROM users ORDER BY created_at DESC LIMIT 10');
    
    allUsers.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

checkUser();
