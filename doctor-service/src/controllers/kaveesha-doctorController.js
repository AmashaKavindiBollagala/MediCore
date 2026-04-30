const pool = require('../config/kaveesha-doctorPool');

// Helper: build file URL from uploaded file
const fileUrl = (file) =>
  file ? `/uploads/doctors/${file.filename}` : null;

// ─── POST /doctors/register — PUBLIC (No auth required, for admin approval) ──
const registerDoctor = async (req, res) => {
  const {
    first_name, last_name, email, phone,
    specialty, sub_specialty, hospital,
    medical_license_number, years_of_experience,
    bio, consultation_fee_online, consultation_fee_physical,
  } = req.body;

  const files = req.files || {};

  try {
    // Check email not already used by another doctor profile
    const emailCheck = await pool.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'A doctor profile with this email already exists' });
    }

    const result = await pool.query(
      `INSERT INTO profiles (
        user_id, first_name, last_name, email, phone,
        specialty, sub_specialty, hospital, medical_license_number,
        years_of_experience, bio,
        consultation_fee_online, consultation_fee_physical,
        profile_photo_url, id_card_url, medical_license_url, medical_id_url,
        full_name, verification_status
      ) VALUES (
        NULL,$1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,
        $11,$12,
        $13,$14,$15,$16,
        $17,'pending'
      ) RETURNING id, first_name, last_name, email, specialty, verification_status, created_at`,
      [
        first_name.trim(), last_name.trim(), email.trim(), phone.trim(),
        specialty.trim(), (sub_specialty || '').trim(), hospital.trim(), medical_license_number.trim(),
        parseInt(years_of_experience), (bio || '').trim(),
        parseFloat(consultation_fee_online) || 0,
        parseFloat(consultation_fee_physical) || 0,
        fileUrl(files.profile_photo?.[0]),
        fileUrl(files.id_card?.[0]),
        fileUrl(files.medical_license?.[0]),
        fileUrl(files.medical_id?.[0]),
        `${first_name.trim()} ${last_name.trim()}`,
      ]
    );

    res.status(201).json({
      message: 'Doctor registration submitted successfully. Awaiting admin approval.',
      doctor: result.rows[0],
    });
  } catch (err) {
    console.error('[registerDoctor]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/me ───────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  console.log('getMyProfile called, req.user.id:', req.user?.id);
  try {
    // req.user.id contains the doctor's profile id (UUID) from the JWT token
    const result = await pool.query(
      `SELECT * FROM profiles WHERE id = $1`,
      [req.user.id]
    );
    console.log('Query result rows:', result.rows.length);
    if (!result.rows.length)
      return res.status(404).json({ error: 'Doctor profile not found' });
    console.log('Returning doctor profile:', result.rows[0].first_name, result.rows[0].last_name);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getMyProfile error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── PUT /doctors/me ───────────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
  const allowed = ['bio', 'phone', 'hospital', 'hospital_address', 'sub_specialty',
    'consultation_fee_online', 'consultation_fee_physical', 'years_of_experience'];

  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(req.body[key]);
      i++;
    }
  }

  if (!updates.length)
    return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.user.id);

  try {
    const result = await pool.query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Doctor profile not found' });
    res.json({ message: 'Profile updated', doctor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors — public list (for patients to browse) ──────────────────────
const listDoctors = async (req, res) => {
  const { specialty, name } = req.query;
  let query = `SELECT id, full_name, first_name, last_name, specialty,
    sub_specialty, hospital, years_of_experience, bio,
    consultation_fee_online, consultation_fee_physical, profile_photo_url
    FROM profiles WHERE verification_status = 'approved'`;
  const params = [];

  if (specialty) {
    params.push(`%${specialty}%`);
    query += ` AND specialty ILIKE $${params.length}`;
  }
  if (name) {
    params.push(`%${name}%`);
    query += ` AND full_name ILIKE $${params.length}`;
  }
  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/:id ─────────────────────────────────────────────────────────
const getDoctorById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, phone, full_name, first_name, last_name, specialty, sub_specialty,
        hospital, years_of_experience, bio, consultation_fee_online,
        consultation_fee_physical, profile_photo_url
       FROM profiles WHERE id = $1 AND verification_status = 'approved'`,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Doctor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── ADMIN: GET /admin/doctors — all pending/verified ─────────────────────────
const adminListDoctors = async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM profiles';
  const params = [];
  if (status) {
    params.push(status);
    query += ` WHERE verification_status = $1`;
  }
  query += ' ORDER BY created_at DESC';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── ADMIN: PATCH /admin/doctors/:id/verify ───────────────────────────────────
const verifyDoctor = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ error: 'status must be "approved" or "rejected"' });

  try {
    const result = await pool.query(
      `UPDATE profiles SET verification_status = $1, verified = $2
       WHERE id = $3 RETURNING id, full_name, verification_status`,
      [status, status === 'approved', req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: `Doctor ${status}`, doctor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerDoctor, getMyProfile, updateMyProfile,
  listDoctors, getDoctorById,
  adminListDoctors, verifyDoctor,
};