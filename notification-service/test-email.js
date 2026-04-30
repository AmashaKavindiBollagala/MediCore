// Test email sending directly
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Testing Email Configuration...\n');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email connection FAILED:');
    console.error(error.message);
    console.error('\n🔧 POSSIBLE FIXES:');
    console.error('1. Check if EMAIL_USER and EMAIL_PASS are correct');
    console.error('2. Enable "Less secure apps" in Gmail: https://myaccount.google.com/lesssecureapps');
    console.error('3. Use App Password instead of regular password');
    console.error('4. Check your internet connection');
    process.exit(1);
  } else {
    console.log('✅ Email server is ready to send messages');
    
    // Try sending a test email
    console.log('\n📧 Sending test email...');
    
    const testEmail = process.env.TEST_EMAIL || 'amashakav23@gmail.com'; // Change this to your email
    
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: '✅ MediCore Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #184E77;">Test Email Successful! 🎉</h2>
          <p>This is a test email from MediCore Notification Service.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    })
    .then(info => {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log(`\n📧 Check your inbox at: ${testEmail}`);
      console.log('\n⚠️  If you don\'t see it:');
      console.log('   1. Check Spam/Junk folder');
      console.log('   2. Wait a few minutes');
      console.log('   3. Check if the email address is correct');
    })
    .catch(err => {
      console.error('❌ Failed to send test email:');
      console.error(err.message);
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('1. Gmail may have blocked the sign-in attempt');
      console.error('2. You need to use an App Password, not your regular password');
      console.error('3. Go to: https://myaccount.google.com/appliances');
      console.error('4. Generate an App Password for "Mail"');
      console.error('5. Replace EMAIL_PASS in .env with the App Password');
    });
  }
});
