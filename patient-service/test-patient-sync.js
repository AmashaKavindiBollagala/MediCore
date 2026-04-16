// Test script to verify patient registration stores data in patient_db
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testPatientSync() {
  try {
    console.log('Testing patient sync endpoint...\n');
    
    // Simulate auth-service calling patient-service
    const patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:3001';
    const testUserId = 999; // Test user ID
    
    console.log('Sending test data to patient-service...');
    const response = await fetch(`${patientServiceUrl}/api/patients/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: testUserId,
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '+94 77 123 4567'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Patient sync successful!');
      
      // Verify data is in patient_db
      console.log('\nVerifying data in patient_db...');
      const client = await pool.connect();
      
      const result = await client.query(
        'SELECT * FROM patients WHERE user_id = $1',
        [testUserId]
      );
      
      if (result.rows.length > 0) {
        console.log('✅ Patient data found in patient_db:');
        console.log(result.rows[0]);
      } else {
        console.log('❌ Patient data NOT found in patient_db');
      }
      
      // Clean up test data
      await client.query('DELETE FROM patients WHERE user_id = $1', [testUserId]);
      console.log('\n🧹 Test data cleaned up');
      
      client.release();
    } else {
      console.log('❌ Patient sync failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPatientSync();
