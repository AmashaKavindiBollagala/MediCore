/**
 * admin-service/src/index.js
 * MediCore Admin Service — Express app entry point
 * Port: 3000 (mapped to 3009 in docker-compose)
 *
 * Routes:
 *  GET  /admin/stats                     — dashboard summary counts
 *  GET  /admin/doctors                   — list all doctors with filters
 *  GET  /admin/doctors/:id               — get one doctor's details
 *  PATCH /admin/doctors/:id/verify       — approve / reject doctor
 *  POST /admin/doctors/:id/ai-analyze    — Claude vision analyzes uploaded license
 *  GET  /admin/users                     — list all users (patients + doctors)
 *  PUT  /admin/users/:id/suspend         — suspend a user
 *  PUT  /admin/users/:id/reactivate      — reactivate a user
 *  GET  /admin/appointments              — all appointments with filters
 *  GET  /admin/payments                  — all transactions with summary
 */

require('dotenv').config();
const express  = require('express');
const { Pool } = require('pg');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const fs       = require('fs');
const path     = require('path');

// Import modular route files
const doctorsRoutes = require('./routes/dilshara-doctorsRoutes');

// ─── App + DB setup ───────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// Allow CORS from the frontend (adjust origin in production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT || 5432,
});

// Anthropic client for AI doctor verification
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Multer — store license uploads temporarily in /tmp
const upload = multer({
  dest: '/tmp/medicore-uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Verifies JWT and enforces role = 'admin'

function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

// ─── Mount Routes ─────────────────────────────────────────────────────────────

// Doctor verification routes (modular)
app.use('/admin/doctors', requireAdmin, doctorsRoutes);

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'admin-service' }));

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
// Returns aggregate numbers for the four dashboard panels

app.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [
      usersResult,
      doctorsResult,
      appointmentsResult,
      paymentsResult,
    ] = await Promise.all([
      // Total patients + doctors + admins breakdown
      pool.query(`
        SELECT role, COUNT(*) AS count,
               COUNT(*) FILTER (WHERE status = 'suspended') AS suspended
        FROM auth.users
        GROUP BY role
      `),
      // Doctors by verification status
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE verification_status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE verification_status = 'approved') AS approved,
          COUNT(*) FILTER (WHERE verification_status = 'rejected') AS rejected,
          COUNT(*) AS total
        FROM doctors.profiles
      `),
      // Appointment status breakdown
      pool.query(`
        SELECT status, COUNT(*) AS count FROM appointments.bookings GROUP BY status
      `),
      // Revenue + refunds
      pool.query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE status='completed' AND transaction_type='payment'), 0) AS total_revenue,
          COALESCE(SUM(amount) FILTER (WHERE status='completed' AND transaction_type='refund'),  0) AS total_refunds,
          COUNT(*) FILTER (WHERE status='pending')   AS pending_payments,
          COUNT(*) FILTER (WHERE status='completed') AS completed_payments
        FROM payments.transactions
      `),
    ]);

    // Reshape user counts
    const userStats = { patient: 0, doctor: 0, admin: 0, suspended: 0 };
    for (const row of usersResult.rows) {
      userStats[row.role]      = parseInt(row.count);
      userStats.suspended     += parseInt(row.suspended);
    }
    userStats.total_users = userStats.patient + userStats.doctor + userStats.admin;

    res.json({
      users:        userStats,
      doctors:      doctorsResult.rows[0],
      appointments: appointmentsResult.rows.reduce((acc, r) => {
        acc[r.status.toLowerCase()] = parseInt(r.count);
        return acc;
      }, {}),
      payments:     paymentsResult.rows[0],
    });
  } catch (err) {
    console.error('[/admin/stats]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── AI License Analysis ──────────────────────────────────────────────────────
/**
 * POST /admin/doctors/:id/ai-analyze
 * Body: multipart/form-data with field "license" (image file)
 *
 * Sends the license image to Claude claude-sonnet-4-20250514 vision model.
 * Returns structured JSON with extracted fields that pre-fill the form.
 *
 * Expected Claude response shape:
 * {
 *   doctor_name: string,
 *   license_number: string,
 *   specialty: string,
 *   issuing_authority: string,
 *   issue_date: string,      // ISO date or raw string
 *   expiry_date: string,
 *   country: string,
 *   confidence: number,      // 0-1
 *   notes: string,           // any concerns or caveats
 *   is_valid_document: boolean
 * }
 */
app.post('/admin/doctors/:id/ai-analyze', requireAdmin, upload.single('license'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    // Read the uploaded image and convert to base64
    const imageBuffer  = fs.readFileSync(req.file.path);
    const base64Image  = imageBuffer.toString('base64');
    const mediaType    = req.file.mimetype; // e.g. image/jpeg

    const prompt = `You are a medical license verification assistant for MediCore, a healthcare platform.
Carefully analyze the attached medical license / credential document image.

Extract the following fields and return ONLY a valid JSON object (no markdown, no explanation):
{
  "doctor_name": "full name on the document",
  "license_number": "license or registration number",
  "specialty": "medical specialty stated",
  "issuing_authority": "name of the council or authority that issued it",
  "issue_date": "date issued (YYYY-MM-DD or as written)",
  "expiry_date": "expiry date (YYYY-MM-DD or as written, null if lifetime)",
  "country": "country of issuance",
  "confidence": 0.95,
  "notes": "any concerns, missing info, or quality issues",
  "is_valid_document": true
}

Be conservative: if the document looks tampered, blurry, or suspicious, set is_valid_document to false and explain in notes.
If you cannot read a field clearly, set it to null.`;

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          { type: 'text', text: prompt },
        ],
      }],
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    // Parse Claude's JSON response
    const rawText = response.content[0].text.trim();
    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      // If Claude wrapped it in backticks, strip them
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      analysis = JSON.parse(cleaned);
    }

    // Persist the AI analysis in the doctors table
    await pool.query(
      `UPDATE doctors.profiles SET ai_analysis = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(analysis), req.params.id]
    );

    res.json({ analysis });
  } catch (err) {
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('[ai-analyze]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────

// GET /admin/users?role=patient&page=1&limit=20&search=email
app.get('/admin/users', requireAdmin, async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = [];
  let params = [];

  if (role && ['patient', 'doctor', 'admin'].includes(role)) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`u.email ILIKE $${params.length}`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM auth.users u ${where}`,
      params
    );

    params.push(parseInt(limit), offset);
    const dataResult = await pool.query(
      `SELECT u.id, u.email, u.role, u.status, u.created_at,
              COALESCE(p.full_name, d.full_name) AS full_name
       FROM auth.users u
       LEFT JOIN patients.profiles p ON p.user_id = u.id
       LEFT JOIN doctors.profiles  d ON d.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      total: parseInt(countResult.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
      users: dataResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/users/:id/suspend
app.put('/admin/users/:id/suspend', requireAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    const result = await pool.query(
      `UPDATE auth.users
       SET status = 'suspended', suspension_reason = $2, updated_at = NOW()
       WHERE id = $1 AND role != 'admin'
       RETURNING id, email, role, status`,
      [req.params.id, reason || null]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'User not found or cannot suspend admin' });
    res.json({ message: 'User suspended', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/users/:id/reactivate
app.put('/admin/users/:id/reactivate', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE auth.users
       SET status = 'active', suspension_reason = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, role, status`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User reactivated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Appointments ─────────────────────────────────────────────────────────────

// GET /admin/appointments?status=CONFIRMED&page=1&limit=20
app.get('/admin/appointments', requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = [];
  let params = [];

  if (status) {
    params.push(status.toUpperCase());
    conditions.push(`a.status = $${params.length}`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM appointments.bookings a ${where}`, params
    );

    params.push(parseInt(limit), offset);
    const dataResult = await pool.query(`
      SELECT a.*,
             p.full_name AS patient_name, pu.email AS patient_email,
             d.full_name AS doctor_name,  du.email AS doctor_email
      FROM appointments.bookings a
      LEFT JOIN patients.profiles p  ON p.user_id = a.patient_id
      LEFT JOIN auth.users        pu ON pu.id      = a.patient_id
      LEFT JOIN doctors.profiles  d  ON d.user_id  = a.doctor_id
      LEFT JOIN auth.users        du ON du.id       = a.doctor_id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({
      total:        parseInt(countResult.rows[0].count),
      appointments: dataResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Payments ─────────────────────────────────────────────────────────────────

// GET /admin/payments?status=completed&page=1&limit=20
app.get('/admin/payments', requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = [];
  let params = [];

  if (status) {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [countResult, dataResult, summaryResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM payments.transactions t ${where}`, params),
      pool.query(`
        SELECT t.*, pu.email AS patient_email
        FROM payments.transactions t
        LEFT JOIN auth.users pu ON pu.id = t.patient_id
        ${where}
        ORDER BY t.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, parseInt(limit), offset]),
      pool.query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE status='completed' AND transaction_type='payment'), 0) AS revenue,
          COALESCE(SUM(amount) FILTER (WHERE status='completed' AND transaction_type='refund'),  0) AS refunds,
          COUNT(*) FILTER (WHERE status='pending')   AS pending,
          COUNT(*) FILTER (WHERE status='failed')    AS failed
        FROM payments.transactions
      `),
    ]);

    res.json({
      total:        parseInt(countResult.rows[0].count),
      summary:      summaryResult.rows[0],
      transactions: dataResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅  admin-service running on :${PORT}`));