const { Pool } = require('pg');

// Database configuration (same as auth-service)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    console.log('🔍 Checking if user exists in auth-service database...\n');
    
    const userId = '00000000-0000-0000-0000-000000000015';
    
    // Check if user exists
    const result = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User NOT FOUND in database!');
      console.log(`   User ID: ${userId}`);
      console.log('\n⚠️  This is WHY auth-service returns 500 error!');
      console.log('💡 The user does not exist in the users table.\n');
    } else {
      const user = result.rows[0];
      console.log('✅ User found in database:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'NOT SET'}`);
      console.log(`   Email: ${user.email || 'NOT SET'}`);
      console.log(`   Role: ${user.role || 'NOT SET'}`);
      console.log(`   Phone: ${user.phone || 'NOT SET'}`);
      console.log(`   Created: ${user.created_at}`);
      
      if (!user.email) {
        console.log('\n⚠️  WARNING: User has NO EMAIL!');
        console.log('   This will cause notifications to fail.\n');
      }
    }
    
    // Also check all users to see what's available
    console.log('\n📋 Recent users in database (last 5):');
    console.log('=' .repeat(70));
    const allUsers = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    
    if (allUsers.rows.length === 0) {
      console.log('   No users found in database!');
    } else {
      allUsers.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email || 'NO EMAIL'}`);
        console.log(`   Role: ${user.role || 'NO ROLE'}`);
        console.log(`   Created: ${user.created_at}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(70));
    console.log('\nIf the user exists and has an email, but auth-service still returns 500:');
    console.log('  → The auth-service endpoint has a bug');
    console.log('  → Check auth-service terminal for error logs');
    console.log('  → Restart auth-service');
    console.log('\nIf the user does NOT exist:');
    console.log('  → You need to login/register first');
    console.log('  → The appointment was created with an invalid user ID');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

checkUser();
