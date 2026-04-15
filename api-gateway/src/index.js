require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Apply multer to routes that need file uploads
app.post('/doctors/register', upload.any(), (req, res, next) => {
  // Forward to routes.js
  next();
});

app.post('/doctors/me/reports/upload', upload.any(), (req, res, next) => {
  // Forward to routes.js
  next();
});

// Routes — mounted at '/' so frontend calls /appointments/... work directly
app.use('/', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});