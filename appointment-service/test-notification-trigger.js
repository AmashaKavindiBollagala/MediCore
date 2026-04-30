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

async function testNotifications() {
  try {
    // Get the latest appointment
    const appointmentQuery = `
      SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.scheduled_at,
        a.status,
        a.consultation_fee
      FROM public.appointments a
      ORDER BY a.created_at DESC
      LIMIT 1
    `;
    
    const appointmentResult = await pool.query(appointmentQuery);
    
    if (appointmentResult.rows.length === 0) {
      console.log('❌ No appointments found');
      return;
    }
    
    const appointment = appointmentResult.rows[0];
    console.log('📋 Testing notifications for appointment:', appointment.id);
    console.log('   Status:', appointment.status);
    console.log('   Patient ID:', appointment.patient_id);
    console.log('   Doctor ID:', appointment.doctor_id);
    
    // Fetch patient info from auth-service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${appointment.patient_id}`);
    
    let patientInfo = null;
    if (patientRes.ok) {
      patientInfo = await patientRes.json();
      console.log('\n✅ Patient info fetched:');
      console.log('   Email:', patientInfo.email);
      console.log('   Phone:', patientInfo.phone);
      console.log('   Name:', patientInfo.name);
    } else {
      console.log('❌ Failed to fetch patient info');
    }
    
    // Fetch doctor info from doctor-service
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
    const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
    
    let doctorInfo = null;
    if (doctorRes.ok) {
      const doctorData = await doctorRes.json();
      doctorInfo = doctorData.success ? doctorData.data : doctorData;
      console.log('\n✅ Doctor info fetched:');
      console.log('   Email:', doctorInfo.email);
      console.log('   Phone:', doctorInfo.phone);
      console.log('   Name:', doctorInfo.full_name || `${doctorInfo.first_name} ${doctorInfo.last_name}`);
    } else {
      console.log('❌ Failed to fetch doctor info');
    }
    
    // Parse appointment date and time
    const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const appointmentTime = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('\n📅 Appointment Details:');
    console.log('   Date:', appointmentDate);
    console.log('   Time:', appointmentTime);
    console.log('   Fee:', appointment.consultation_fee);
    
    // Send notification request
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
    
    if (patientInfo || doctorInfo) {
      console.log('\n📧 Sending notification request to notification service...');
      
      const notificationRes = await fetch(`${notificationServiceUrl}/api/notifications/appointment-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: patientInfo?.email,
          patientPhone: patientInfo?.phone,
          patientName: patientInfo?.name || 'Patient',
          doctorEmail: doctorInfo?.email,
          doctorPhone: doctorInfo?.phone,
          doctorName: doctorInfo?.full_name || doctorInfo?.first_name + ' ' + doctorInfo?.last_name || 'Doctor',
          appointmentId: appointment.id,
          appointmentDate,
          appointmentTime,
          amount: appointment.consultation_fee
        })
      });
      
      if (notificationRes.ok) {
        const notificationResult = await notificationRes.json();
        console.log('✅ Notifications sent successfully!');
        console.log('   Response:', JSON.stringify(notificationResult, null, 2));
      } else {
        const errorText = await notificationRes.text();
        console.log('❌ Failed to send notifications');
        console.log('   Error:', errorText);
      }
    } else {
      console.log('❌ Cannot send notifications: Missing patient or doctor info');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testNotifications();
