require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./src/config/kaveesha-doctorPool');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads/doctors', express.static(path.join('/app/uploads', 'doctors')));
app.use('/uploads/reports', express.static(path.join('/app/uploads', 'reports')));

// ─── Routes ────────────────────────────────────────────────────────────────────
const doctorRoutes = require('./src/routes/kaveesha-doctorRoutes');
app.use('/doctors', doctorRoutes);

// Doctor Registration Routes
const doctorRegistrationRoutes = require('./src/routes/kaveesha-doctorRegistrationRoutes');
app.use('/api/doctors', doctorRegistrationRoutes);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'doctor-service OK' }));

// ─── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Doctor Service Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server with DB connection test ──────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`Doctor service running on port ${PORT}`);
  
  // Test database connection
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});