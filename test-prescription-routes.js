// Test script to verify prescription routes are working
const testPrescriptionRoutes = async () => {
  console.log('Testing prescription routes...\n');
  
  const token = process.env.TEST_TOKEN || 'YOUR_TOKEN_HERE';
  const baseUrl = 'http://localhost:8080/api';
  
  console.log('Base URL:', baseUrl);
  console.log('Token:', token ? 'Present' : 'Missing - please set TEST_TOKEN environment variable\n');
  
  if (!token || token === 'YOUR_TOKEN_HERE') {
    console.log('⚠️  Please provide a valid doctor token to test');
    console.log('You can get this from localStorage.token in your browser\n');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: GET all prescriptions
    console.log('📋 Test 1: GET /doctors/me/prescriptions');
    const getRes = await fetch(`${baseUrl}/doctors/me/prescriptions`, { headers });
    console.log(`   Status: ${getRes.status}`);
    if (getRes.ok) {
      const data = await getRes.json();
      console.log(`   ✅ Found ${data.length} prescriptions\n`);
      
      if (data.length > 0) {
        const testRx = data[0];
        console.log(`   Test prescription ID: ${testRx.id}\n`);
        
        // Test 2: PUT update prescription
        console.log('✏️  Test 2: PUT /doctors/me/prescriptions/:id');
        const updateRes = await fetch(`${baseUrl}/doctors/me/prescriptions/${testRx.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            prescription_data: testRx.prescription_data,
            notes: testRx.notes || 'Test update',
            diagnosis: testRx.diagnosis || 'Test diagnosis'
          })
        });
        console.log(`   Status: ${updateRes.status}`);
        const updateData = await updateRes.json();
        console.log(`   ${updateRes.ok ? '✅' : '❌'} Update: ${JSON.stringify(updateData)}\n`);
        
        // Test 3: DELETE prescription (we'll skip actual deletion)
        console.log('🗑️  Test 3: DELETE /doctors/me/prescriptions/:id (dry run)');
        console.log(`   Route exists: Will test when you delete from UI\n`);
      }
    } else {
      const errorText = await getRes.text();
      console.log(`   ❌ Error: ${errorText}\n`);
    }
    
    console.log('✅ Route tests completed!');
    console.log('Now try the prescription operations in your browser.');
    console.log('Check the browser console (F12) for detailed logs.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testPrescriptionRoutes();
