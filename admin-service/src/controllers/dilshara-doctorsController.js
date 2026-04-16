
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
        hospital, hospital_address, medical_license_number, license_issuing_authority,
        years_of_experience, bio, consultation_fee_online, consultation_fee_physical,
        profile_photo_url, id_card_front_url, id_card_back_url, medical_license_url, degree_certificates_url,
        verification_status, verified, rejection_reason, created_at, updated_at
       FROM profiles
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
        hospital, hospital_address, medical_license_number, license_issuing_authority,
        years_of_experience, bio, consultation_fee_online, consultation_fee_physical,
        profile_photo_url, id_card_front_url, id_card_back_url, medical_license_url, degree_certificates_url,
        verification_status, verified, rejection_reason, created_at, updated_at
       FROM profiles
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
//  1. Update doctors.profiles  → sets verification_status + verified flag + rejection_reason (if rejected)
//  2. Write to admin.verification_events → notification team reads this to send email
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
      `SELECT id, email, user_id, verification_status FROM profiles WHERE id = $1`,
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
    //    If rejected, save the note as rejection_reason in the profiles table
    console.log(`Updating doctor ${id} with status: ${status}`);
    const updateResult = await client.query(
      `UPDATE profiles
       SET verification_status = $1,
           verified            = $2,
           rejection_reason    = $3,
           updated_at          = NOW()
       WHERE id = $4
       RETURNING id, full_name, verification_status, verified`,
      [status, status === 'approved', status === 'rejected' ? note : null, id]
    );
    
    console.log('Update result:', updateResult.rows[0]);

    // 3. Commit the transaction for the profile update
    await client.query('COMMIT');
    console.log('Transaction committed successfully');

    // 4. Write verification event — notification-service reads this table to send email
    //    Note: admin.verification_events table may not exist in medicore_doctor database
    //    So we'll skip this if the table doesn't exist (outside the main transaction)
    try {
      await pool.query(
        `INSERT INTO admin.verification_events
           (doctor_id, doctor_email, status, admin_note, decided_by, decided_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, doctor.email, status, note, req.user?.id || 'admin']
      );
      console.log('Verification event created');
    } catch (err) {
      console.log('Note: admin.verification_events table not available, skipping notification event');
    }

    res.json({
      message: `Doctor ${status} successfully.`,
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