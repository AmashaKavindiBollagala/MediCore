// Test the verify doctor endpoint
const http = require('http');

const doctorId = '3f2e86b8-fd00-4da2-aff0-41408b93cf22'; // sss sss
const status = 'approved';
const note = 'Test approval from script';

const data = JSON.stringify({ status, note });

const options = {
  hostname: 'localhost',
  port: 3009, // Docker mapped port
  path: `/admin/doctors/${doctorId}/verify`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();

console.log('Sending approve request...');
