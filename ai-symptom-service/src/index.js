const express = require('express');
const cors = require('cors');
//const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const symptomRoutes = require('./routes/symptom');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ai-symptom-service is running' });
});

// Routes
app.use('/api/symptoms', symptomRoutes);

app.listen(PORT, () => {
  console.log(`AI Symptom Service running on port ${PORT}`);
});