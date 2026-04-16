
// Handles doctor listing, fetching a single doctor, and the approve/reject action
// After approve/reject → writes to admin.verification_events so the
// notification-service (another team) can pick it up and email the doctor

const pool = require('../config/dilshara-db');

// GET /admin/doctors?status=pending|approved|rejected|all
exports.getDoctors = async (req, res) => {
  const { status = 'all' } = req.query;
  try {
    const whereClause =
      status === 'all'
        ? ''
        : `WHERE verification_status = $1`;

    const params = status === 'all' ? [] : [status];

    const result = await pool.query(
      `SELECT
        id, user_id, first_name, last_name,
        COALESCE(first_name || ' ' || last_name, full_name) AS full_name,
        email, phone, specialty, sub_specialty,
        hospital, medical_license_number, years_of_experience,
        bio, consultation_fee_online, consultation_fee_physical,
        profile_photo_url, id_card_url, medical_license_url, medical_id_url,
        verification_status, verified, created_at
       FROM doctors.profiles
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getDoctors error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/doctors/:id
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        id, user_id, first_name, last_name,
        COALESCE(first_name || ' ' || last_name, full_name) AS full_name,
        email, phone, specialty, sub_specialty,
        hospital, medical_license_number, years_of_experience,
        bio, consultation_fee_online, consultation_fee_physical,
        profile_photo_url, id_card_url, medical_license_url, medical_id_url,
        verification_status, verified, created_at
       FROM doctors.profiles
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getDoctorById error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /admin/doctors/:id/verify
// Body: { status: 'approved' | 'rejected', note?: string }
//
// Flow:
//  1. Update doctors.profiles  → sets verification_status + verified flag
//  2. If approved → update auth.users  → set verified = true so doctor can log in
//  3. Write to admin.verification_events → notification team reads this to send email
exports.verifyDoctor = async (req, res) => {
  const { id } = req.params;
  const { status, note = '' } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch doctor to get email + current state
    const doctorRes = await client.query(
      `SELECT id, email, user_id, verification_status FROM doctors.profiles WHERE id = $1`,
      [id]
    );
    if (doctorRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctorRes.rows[0];
    if (doctor.verification_status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: `Doctor is already ${doctor.verification_status}. Cannot change again.`,
      });
    }

    // 2. Update doctors.profiles
    await client.query(
      `UPDATE doctors.profiles
       SET verification_status = $1,
           verified            = $2,
           updated_at          = NOW()
       WHERE id = $3`,
      [status, status === 'approved', id]
    );

    // 3. If approved, unlock the auth.users account so doctor can log in
    //    (auth-service owns auth.users — we only flip the 'verified' flag)
    if (status === 'approved' && doctor.user_id) {
      await client.query(
        `UPDATE auth.users SET verified = TRUE WHERE id = $1`,
        [doctor.user_id]
      );
    }

    // 4. Write verification event — notification-service reads this table to send email
    await client.query(
      `INSERT INTO admin.verification_events
         (doctor_id, doctor_email, status, admin_note, decided_by, decided_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, doctor.email, status, note, req.user.id]
    );

    await client.query('COMMIT');

    res.json({
      message: `Doctor ${status} successfully. Notification event created.`,
      doctor_id: id,
      status,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('verifyDoctor error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};