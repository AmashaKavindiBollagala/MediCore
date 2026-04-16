// ─── Doctor Registration Validation ──────────────────────────────────────────

const validateDoctorRegistration = (req, res, next) => {
  const errors = [];
  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
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

  // ─── First Name Validation ───────────────────────────────────────────────
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  } else if (first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  } else if (first_name.trim().length > 100) {
    errors.push('First name must be less than 100 characters');
  } else if (!/^[a-zA-Z\s'-]+$/.test(first_name.trim())) {
    errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // ─── Last Name Validation ────────────────────────────────────────────────
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  } else if (last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  } else if (last_name.trim().length > 100) {
    errors.push('Last name must be less than 100 characters');
  } else if (!/^[a-zA-Z\s'-]+$/.test(last_name.trim())) {
    errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // ─── Email Validation ────────────────────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address');
  } else if (email.trim().length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  // ─── Password Validation ─────────────────────────────────────────────────
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (!/(?=.*[@$!%*?&#])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#)');
  }

  // ─── Confirm Password Validation ─────────────────────────────────────────
  if (!confirm_password || confirm_password.trim() === '') {
    errors.push('Please confirm your password');
  } else if (password !== confirm_password) {
    errors.push('Passwords do not match');
  }

  // ─── Phone Validation ────────────────────────────────────────────────────
  const phoneRegex = /^\+?[\d\s-]{7,20}$/;
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phone.trim())) {
    errors.push('Please provide a valid phone number (7-20 digits)');
  }

  // ─── Date of Birth Validation (optional but validate if provided) ────────
  if (date_of_birth && date_of_birth.trim() !== '') {
    const dob = new Date(date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth format');
    } else if (age < 25) {
      errors.push('Doctor must be at least 25 years old');
    } else if (age > 100) {
      errors.push('Please provide a valid date of birth');
    }
  }

  // ─── Gender Validation (optional) ────────────────────────────────────────
  if (gender && gender.trim() !== '') {
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase().trim())) {
      errors.push('Gender must be male, female, or other');
    }
  }

  // ─── Specialty Validation ────────────────────────────────────────────────
  const validSpecialties = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Practice', 'Gynecology', 'Hematology', 'Neurology',
    'Oncology', 'Ophthalmology', 'Orthopedics', 'Otolaryngology',
    'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology',
    'Rheumatology', 'Urology', 'Emergency Medicine', 'Anesthesiology',
    'Pathology', 'Plastic Surgery', 'Sports Medicine'
  ];

  if (!specialty || specialty.trim() === '') {
    errors.push('Specialty is required');
  } else if (!validSpecialties.includes(specialty.trim())) {
    errors.push(`Invalid specialty. Must be one of: ${validSpecialties.join(', ')}`);
  }

  // ─── Sub-Specialty Validation (optional) ─────────────────────────────────
  if (sub_specialty && sub_specialty.trim() !== '') {
    if (sub_specialty.trim().length > 100) {
      errors.push('Sub-specialty must be less than 100 characters');
    }
  }

  // ─── Hospital Validation ─────────────────────────────────────────────────
  if (!hospital || hospital.trim() === '') {
    errors.push('Hospital/Workplace name is required');
  } else if (hospital.trim().length < 2) {
    errors.push('Hospital name must be at least 2 characters');
  } else if (hospital.trim().length > 255) {
    errors.push('Hospital name must be less than 255 characters');
  }

  // ─── Hospital Address Validation (optional) ─────────────────────────────
  if (hospital_address && hospital_address.trim() !== '') {
    if (hospital_address.trim().length > 500) {
      errors.push('Hospital address must be less than 500 characters');
    }
  }

  // ─── Medical License Number Validation ──────────────────────────────────
  if (!medical_license_number || medical_license_number.trim() === '') {
    errors.push('Medical license number is required');
  } else if (medical_license_number.trim().length < 5) {
    errors.push('Medical license number must be at least 5 characters');
  } else if (medical_license_number.trim().length > 100) {
    errors.push('Medical license number must be less than 100 characters');
  }

  // ─── License Issuing Authority Validation ───────────────────────────────
  if (!license_issuing_authority || license_issuing_authority.trim() === '') {
    errors.push('License issuing authority is required');
  } else if (license_issuing_authority.trim().length < 2) {
    errors.push('License issuing authority must be at least 2 characters');
  } else if (license_issuing_authority.trim().length > 255) {
    errors.push('License issuing authority must be less than 255 characters');
  }

  // ─── Years of Experience Validation ─────────────────────────────────────
  if (!years_of_experience && years_of_experience !== 0) {
    errors.push('Years of experience is required');
  } else {
    const exp = parseInt(years_of_experience);
    if (isNaN(exp) || exp < 0) {
      errors.push('Years of experience must be a valid number');
    } else if (exp > 60) {
      errors.push('Years of experience cannot exceed 60');
    }
  }

  // ─── File Upload Validation ─────────────────────────────────────────────
  if (!req.files || !req.files.profile_photo) {
    errors.push('Profile photo is required');
  }
  if (!req.files || !req.files.id_card_front) {
    errors.push('ID card (front) is required');
  }
  if (!req.files || !req.files.id_card_back) {
    errors.push('ID card (back) is required');
  }
  if (!req.files || !req.files.medical_license) {
    errors.push('Medical license certificate is required');
  }
  if (!req.files || !req.files.degree_certificates) {
    errors.push('Degree certificate is required');
  }

  // ─── Return Validation Errors ───────────────────────────────────────────
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  // ─── All Validations Passed ─────────────────────────────────────────────
  next();
};

module.exports = { validateDoctorRegistration };
