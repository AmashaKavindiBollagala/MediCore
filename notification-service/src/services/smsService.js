require('dotenv').config();
const axios = require('axios');

const sendSMS = async (to, message) => {
  try {
    // Format phone number: remove + sign if present, ensure it starts with country code
    let recipient = to.startsWith('+') ? to.substring(1) : to;
    
    // If number doesn't start with 94, add it (Sri Lanka country code)
    if (!recipient.startsWith('94')) {
      recipient = `94${recipient}`;
    }
    
    const response = await axios.post(
      'https://app.text.lk/api/v3/sms/send',
      {
        sender_id: process.env.TEXTLK_SENDER_ID || 'TextLKDemo',
        recipient: recipient,
        type: 'plain',
        message: message
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEXTLK_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ SMS sent via TextLK:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ TextLK SMS sending failed:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendSMS };