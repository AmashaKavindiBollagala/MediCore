// Test the complete registration flow
const { Pool } = require('pg');

async function testRegistration() {
  try {
    console.log('=== Testing Complete Registration Flow ===\n');
    
    // Step 1: Test auth-service registration
    console.log('Step 1: Registering patient via auth-service...');
    const authResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Patient',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        phone: '+94 77 123 4567',
        role: 'patient'
      })
    });
    
    const authData = await authResponse.json();
    console.log('Auth response status:', authResponse.status);
    console.log('Auth response:', JSON.stringify(authData, null, 2));
    
    if (!authResponse.ok) {
      console.log('❌ Registration failed at auth-service');
      process.exit(1);
    }
    
    console.log('✅ User created in auth-service\n');
    const userId = authData.user.id;
    
    // Step 2: Wait a moment for sync to complete
    console.log('Step 2: Waiting for patient sync...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Check patient_db for the patient record
    console.log('Step 3: Checking patient_db for patient record...');
    
    const patientPool = new Pool({
      connectionString: 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/patient_db?sslmode=require',
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await patientPool.connect();
    
    // Check current database
    const dbResult = await client.query('SELECT current_database()');
    console.log('Connected to database:', dbResult.rows[0].current_database);
    
    // Query for the patient
    const patientResult = await client.query(
      'SELECT * FROM patients WHERE user_id = $1',
      [userId]
    );
    
    if (patientResult.rows.length > 0) {
      console.log('✅ SUCCESS! Patient data found in patient_db:');
      console.log(patientResult.rows[0]);
    } else {
      console.log('❌ FAILED! Patient data NOT found in patient_db');
      console.log('Expected user_id:', userId);
      
      // Show all patients to debug
      const allPatients = await client.query('SELECT id, user_id, name, email FROM patients');
      console.log('\nAll patients in database:');
      console.log(allPatients.rows);
    }
    
    client.release();
    await patientPool.end();
    
    // Clean up test user from auth-service
    console.log('\nCleaning up test data...');
    const authPool = new Pool({
      connectionString: 'postgresql://neondb_owner:npg_ZnWA9KSEqO7c@ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
      ssl: { rejectUnauthorized: false }
    });
    
    const authClient = await authPool.connect();
    await authClient.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    console.log('✅ Test user cleaned up from auth-service');
    
    authClient.release();
    await authPool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testRegistration();
