// Test script to verify TextLK SMS integration
require('dotenv').config();
const axios = require('axios');

async function testSMS() {
  console.log('=== Testing TextLK SMS Integration ===\n');
  
  // Replace with your actual phone number
  const testPhone = '94770220793'; // Your phone number from doctor profile (without +)
  const testMessage = 'MediCore Test: SMS integration is working! ✅';
  
  try {
    console.log('Sending SMS to:', testPhone);
    console.log('Message:', testMessage);
    console.log('Using API Token:', process.env.TEXTLK_API_TOKEN ? 'Present ✅' : 'Missing ❌');
    console.log('Using Sender ID:', process.env.TEXTLK_SENDER_ID || 'Not set');
    console.log('');
    
    const response = await axios.post(
      'https://app.text.lk/api/v3/sms/send',
      {
        sender_id: process.env.TEXTLK_SENDER_ID || 'TextLKDemo',
        recipient: testPhone,
        type: 'plain',
        message: testMessage
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEXTLK_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ SMS sent successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ SMS sending failed!');
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testSMS();
