require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'doctor-service OK' }));

// ─── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Doctor Service Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Doctor service running on port ${PORT}`);
});