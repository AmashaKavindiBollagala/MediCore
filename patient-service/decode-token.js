const jwt = require('jsonwebtoken');

// Sample token - replace with actual token from browser
const token = 'YOUR_TOKEN_HERE';

try {
  const decoded = jwt.decode(token);
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
} catch (err) {
  console.error('Error:', err.message);
}
