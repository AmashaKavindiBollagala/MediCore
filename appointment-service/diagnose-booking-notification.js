const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: 'ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_ZnWA9KSEqO7c',
  ssl: true
});

async function diagnoseBookingNotification() {
  try {
    console.log('🔍 DIAGNOSTIC: Testing notification flow for appointment booking\n');
    console.log('=' .repeat(70));
    
    // Step 1: Get latest appointment
    console.log('\n📋 Step 1: Fetching latest appointment...');
    const appointmentQuery = `
      SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.scheduled_at,
        a.status,
        a.consultation_fee,
        a.patient_name,
        a.created_at
      FROM public.appointments a
      ORDER BY a.created_at DESC
      LIMIT 1
    `;
    
    const appointmentResult = await pool.query(appointmentQuery);
    
    if (appointmentResult.rows.length === 0) {
      console.log('❌ No appointments found in database');
      return;
    }
    
    const appointment = appointmentResult.rows[0];
    console.log('✅ Appointment found:');
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Patient ID: ${appointment.patient_id}`);
    console.log(`   Doctor ID: ${appointment.doctor_id}`);
    console.log(`   Status: ${appointment.status}`);
    console.log(`   Created: ${appointment.created_at}`);
    
    // Step 2: Try to fetch patient info from auth-service
    console.log('\n📋 Step 2: Fetching patient info from auth-service...');
    const authServiceUrl = 'http://localhost:3001';
    
    try {
      console.log(`   URL: ${authServiceUrl}/api/auth/users/${appointment.patient_id}`);
      const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${appointment.patient_id}`);
      
      if (patientRes.ok) {
        const patientInfo = await patientRes.json();
        console.log('✅ Patient info fetched successfully:');
        console.log(`   Email: ${patientInfo.email || 'NOT AVAILABLE'}`);
        console.log(`   Phone: ${patientInfo.phone || 'NOT AVAILABLE'}`);
        console.log(`   Name: ${patientInfo.name || 'NOT AVAILABLE'}`);
        
        if (!patientInfo.email) {
          console.log('⚠️  WARNING: Patient has no email! Notifications will fail.');
        }
      } else {
        console.log(`❌ Failed to fetch patient info (Status: ${patientRes.status})`);
        console.log('   This means auth-service might not be running or user not found');
      }
    } catch (err) {
      console.log('❌ Error fetching patient info:', err.message);
      console.log('   Is auth-service running on port 3001?');
    }
    
    // Step 3: Try to fetch doctor info from doctor-service
    console.log('\n📋 Step 3: Fetching doctor info from doctor-service...');
    const doctorServiceUrl = 'http://localhost:3003';
    
    try {
      console.log(`   URL: ${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
      const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
      
      if (doctorRes.ok) {
        const doctorData = await doctorRes.json();
        const doctorInfo = doctorData.success ? doctorData.data : doctorData;
        console.log('✅ Doctor info fetched successfully:');
        console.log(`   Email: ${doctorInfo.email || 'NOT AVAILABLE'}`);
        console.log(`   Phone: ${doctorInfo.phone || 'NOT AVAILABLE'}`);
        console.log(`   Name: ${doctorInfo.full_name || `${doctorInfo.first_name} ${doctorInfo.last_name}` || 'NOT AVAILABLE'}`);
        
        if (!doctorInfo.email) {
          console.log('⚠️  WARNING: Doctor has no email! Notifications will fail.');
        }
      } else {
        console.log(`❌ Failed to fetch doctor info (Status: ${doctorRes.status})`);
        console.log('   This means doctor-service might not be running');
      }
    } catch (err) {
      console.log('❌ Error fetching doctor info:', err.message);
      console.log('   Is doctor-service running on port 3003?');
    }
    
    // Step 4: Check notification service
    console.log('\n📋 Step 4: Checking notification service...');
    const notificationServiceUrl = 'http://localhost:3000';
    
    try {
      const healthRes = await fetch(`${notificationServiceUrl}/`);
      if (healthRes.ok) {
        const healthData = await healthRes.text();
        console.log('✅ Notification service is running');
        console.log(`   Response: ${healthData}`);
      } else {
        console.log('❌ Notification service health check failed');
      }
    } catch (err) {
      console.log('❌ Cannot reach notification service:', err.message);
      console.log('   Is notification-service running on port 3000?');
    }
    
    // Step 5: Parse appointment date/time
    console.log('\n📋 Step 5: Parsing appointment date/time...');
    const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const appointmentTime = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    console.log(`✅ Date: ${appointmentDate}`);
    console.log(`✅ Time: ${appointmentTime}`);
    console.log(`✅ Fee: ${appointment.consultation_fee}`);
    
    // Step 6: Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log('='.repeat(70));
    console.log('\nTo fix notification issues, ensure:');
    console.log('  1. ✅ Auth-service is running (port 3001)');
    console.log('  2. ✅ Doctor-service is running (port 3003)');
    console.log('  3. ✅ Notification-service is running (port 3000)');
    console.log('  4. ✅ Patient has an email address in the database');
    console.log('  5. ✅ Doctor has an email address in the database');
    console.log('\nThen book a NEW appointment to trigger notifications.');
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

diagnoseBookingNotification();
