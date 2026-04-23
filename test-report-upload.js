const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a test file
const testFilePath = path.join(__dirname, 'test-upload.txt');
fs.writeFileSync(testFilePath, 'Test report content');

const boundary = '----TestBoundary123';
const fileContent = fs.readFileSync(testFilePath);

const bodyParts = [
  Buffer.from(`--${boundary}\r\n`),
  Buffer.from('Content-Disposition: form-data; name="file"; filename="test-upload.txt"\r\n'),
  Buffer.from('Content-Type: text/plain\r\n\r\n'),
  fileContent,
  Buffer.from(`\r\n--${boundary}--\r\n`)
];

const body = Buffer.concat(bodyParts);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/patients/reports',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Authorization': 'Bearer test123',
    'Content-Length': body.length
  }
};

console.log('Testing POST /api/patients/reports...');

const req = http.request(options, res => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data.substring(0, 500));
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
});

req.write(body);
req.end();
