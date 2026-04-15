require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./src/config/appointmentdatabase');
const appointmentRoutes = require('./src/routes/dushani-appointmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'appointment-service' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`);
});

module.exports = app;
