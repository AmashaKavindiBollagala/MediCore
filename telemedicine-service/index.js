// index.js
// Telemedicine Service - Main entry point
// Kaveesha Telemedicine Module for MediCore

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import telemedicineRoutes from './src/routes/kaveesha-telemedicineRoutes.js';
import { initializeSocketService } from './src/services/kaveesha-socketService.js';
import pool from './src/config/kaveesha-dbConfig.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/telemedicine', telemedicineRoutes);

// Root ping
app.get('/', (req, res) => {
  res.json({
    service: 'MediCore Telemedicine Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Telemedicine Service Error]', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Initialize Socket.io ────────────────────────────────────────────────────
initializeSocketService(io);
console.log('[Telemedicine] Socket.io initialized');

// ── DB connection check ──────────────────────────────────────────────────────
async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('[Telemedicine] PostgreSQL connected successfully');
  } catch (err) {
    console.error('[Telemedicine] Database connection failed:', err.message);
    process.exit(1);
  }
}

// ── Start server ─────────────────────────────────────────────────────────────
async function start() {
  await checkDatabase();
  httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   MediCore Telemedicine Service          ║');
    console.log(`║   Running on port: ${PORT}                  ║`);
    console.log(`║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)}║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
}

start();

export { io };
export default app;