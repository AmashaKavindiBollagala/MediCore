const pool = require('../config/kaveesha-doctorPool');
const { uploadToCloudinary } = require('../middleware/kaveesha-uploadMiddleware');
const bcrypt = require('bcryptjs');

// ─── Doctor Registration Controller ──────────────────────────────────────────
const registerDoctor = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      date_of_birth,
      gender,
      specialty,
      sub_specialty,
      hospital,
      hospital_address,
      medical_license_number,
      license_issuing_authority,
      years_of_experience,
    } = req.body;

    console.log('📝 Registering doctor:', email);

    // ─── Hash Password ─────────────────────────────────────────────────────
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // ─── Upload Files to Cloudinary ────────────────────────────────────────
    console.log('📤 Uploading files to Cloudinary...');
    
    const [
      profile_photo_url,
      id_card_front_url,
      id_card_back_url,
      medical_license_url,
      degree_certificates_url,
    ] = await Promise.all([
      uploadToCloudinary(req.files.profile_photo[0].buffer, 'profile-photos'),
      uploadToCloudinary(req.files.id_card_front[0].buffer, 'id-cards'),
      uploadToCloudinary(req.files.id_card_back[0].buffer, 'id-cards'),
      uploadToCloudinary(req.files.medical_license[0].buffer, 'licenses'),
      uploadToCloudinary(req.files.degree_certificates[0].buffer, 'degrees'),
    ]);

    console.log('✅ Files uploaded successfully');

    // ─── Insert Doctor into Database ───────────────────────────────────────
    const query = `
      INSERT INTO profiles (
        first_name,
        last_name,
        full_name,
        email,
        password,
        phone,
        date_of_birth,
        gender,
        specialty,
        sub_specialty,
        hospital,
        hospital_address,
        medical_license_number,
        license_issuing_authority,
        years_of_experience,
        profile_photo_url,
        id_card_front_url,
        id_card_back_url,
        medical_license_url,
        degree_certificates_url,
        verification_status,
        verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING id, first_name, last_name, email, specialty, verification_status, created_at
    `;

    const fullName = `${first_name.trim()} ${last_name.trim()}`;
    const dob = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;
    const gen = gender && gender.trim() !== '' ? gender.toLowerCase().trim() : null;
    const subSpec = sub_specialty && sub_specialty.trim() !== '' ? sub_specialty.trim() : null;
    const hospAddr = hospital_address && hospital_address.trim() !== '' ? hospital_address.trim() : null;

    const values = [
      first_name.trim(),
      last_name.trim(),
      fullName,
      email.trim().toLowerCase(),
      hashedPassword,
      phone.trim(),
      dob,
      gen,
      specialty.trim(),
      subSpec,
      hospital.trim(),
      hospAddr,
      medical_license_number.trim(),
      license_issuing_authority.trim(),
      parseInt(years_of_experience),
      profile_photo_url,
      id_card_front_url,
      id_card_back_url,
      medical_license_url,
      degree_certificates_url,
      'pending',
      false,
    ];

    const result = await pool.query(query, values);
    const doctor = result.rows[0];

    console.log('✅ Doctor registered successfully:', doctor.id);

    // ─── Send Success Response ─────────────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Doctor registration successful! Your details have been submitted for verification.',
      data: {
        doctor_id: doctor.id,
        full_name: doctor.full_name,
        email: doctor.email,
        specialty: doctor.specialty,
        verification_status: doctor.verification_status,
        registered_at: doctor.created_at,
      },
      next_steps: [
        'Our admin team will review your application and verify your documents.',
        'You will receive an email notification once your account is approved.',
        'After approval, you can login to the system using your email and password.',
        'This process usually takes 24-48 hours.',
      ],
    });
  } catch (error) {
    console.error('❌ Doctor registration error:', error);

    // Handle duplicate email
    if (error.code === '23505') {
      if (error.constraint && error.constraint.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'A doctor with this email already exists',
        });
      }
      if (error.constraint && error.constraint.includes('medical_license')) {
        return res.status(409).json({
          success: false,
          message: 'This medical license number is already registered',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ─── Get Pending Doctors (For Admin Service) ─────────────────────────────────
const getPendingDoctors = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        full_name,
        email,
        phone,
        specialty,
        sub_specialty,
        hospital,
        medical_license_number,
        license_issuing_authority,
        years_of_experience,
        profile_photo_url,
        verification_status,
        created_at
      FROM profiles
      WHERE verification_status = 'pending'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending doctors',
    });
  }
};

// ─── Verify/Approve Doctor (For Admin Service) ───────────────────────────────
const verifyDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { status, admin_note } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"',
      });
    }

    const query = `
      UPDATE profiles
      SET 
        verification_status = $1,
        verified = CASE WHEN $1 = 'approved' THEN TRUE ELSE FALSE END,
        rejection_reason = CASE WHEN $1 = 'rejected' THEN $2 ELSE NULL END,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, full_name, email, verification_status, verified
    `;

    const result = await pool.query(query, [status, admin_note || null, doctor_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const doctor = result.rows[0];

    res.json({
      success: true,
      message: `Doctor ${status} successfully`,
      data: doctor,
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify doctor',
    });
  }
};

// ─── Check Doctor Verification Status (For Auth Service) ─────────────────────
const getDoctorVerificationStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT id, email, verification_status, verified
      FROM profiles
      WHERE email = $1
    `;

    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const doctor = result.rows[0];

    res.json({
      success: true,
      data: {
        doctor_id: doctor.id,
        email: doctor.email,
        verification_status: doctor.verification_status,
        verified: doctor.verified,
        can_login: doctor.verified,
      },
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status',
    });
  }
};

module.exports = {
  registerDoctor,
  getPendingDoctors,
  verifyDoctor,
  getDoctorVerificationStatus,
};
