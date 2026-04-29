// ─── Field validators ──────────────────────────────────────────────────────────

const validateDoctorRegistration = (req, res, next) => {
  const errors = [];

  const {
    first_name, last_name, email, phone,
    specialty, hospital, medical_license_number,
    years_of_experience, consultation_fee_online,
    consultation_fee_physical,
  } = req.body;

  // Required text fields
  if (!first_name || first_name.trim().length < 2)
    errors.push('First name must be at least 2 characters');

  if (!last_name || last_name.trim().length < 2)
    errors.push('Last name must be at least 2 characters');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('Valid email is required');

  if (!phone || !/^[\d\s\+\-\(\)]{7,15}$/.test(phone))
    errors.push('Valid phone number is required (7-15 digits)');

  if (!specialty || specialty.trim().length < 2)
    errors.push('Specialty is required');

  if (!hospital || hospital.trim().length < 2)
    errors.push('Hospital / clinic name is required');

  if (!medical_license_number || medical_license_number.trim().length < 4)
    errors.push('Medical license number is required');

  // Numeric fields
  const exp = parseInt(years_of_experience);
  if (isNaN(exp) || exp < 0 || exp > 60)
    errors.push('Years of experience must be between 0 and 60');

  if (consultation_fee_online !== undefined) {
    const fee = parseFloat(consultation_fee_online);
    if (isNaN(fee) || fee < 0)
      errors.push('Online consultation fee must be a positive number');
  }

  if (consultation_fee_physical !== undefined) {
    const fee = parseFloat(consultation_fee_physical);
    if (isNaN(fee) || fee < 0)
      errors.push('Physical consultation fee must be a positive number');
  }

  // Required file uploads
  const files = req.files || {};
  if (!files.profile_photo)
    errors.push('Profile photo is required');
  if (!files.id_card)
    errors.push('Identity card photo is required');
  if (!files.medical_license)
    errors.push('Medical license document is required');
  if (!files.medical_id)
    errors.push('Medical ID document is required');

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }
  next();
};

const validateAvailability = (req, res, next) => {
  const errors = [];
  const { day_of_week, start_time, end_time, slot_duration_minutes, consultation_type, slot_date } = req.body;

  const day = parseInt(day_of_week);
  if (isNaN(day) || day < 0 || day > 6)
    errors.push('day_of_week must be 0 (Sunday) to 6 (Saturday)');

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!start_time || !timeRegex.test(start_time))
    errors.push('start_time must be in HH:MM format');

  if (!end_time || !timeRegex.test(end_time))
    errors.push('end_time must be in HH:MM format');

  if (start_time && end_time && start_time >= end_time)
    errors.push('end_time must be after start_time');

  const dur = parseInt(slot_duration_minutes);
  if (!isNaN(dur) && (dur < 10 || dur > 120))
    errors.push('Slot duration must be between 10 and 120 minutes');

  const validTypes = ['online', 'physical', 'both'];
  if (!consultation_type || !validTypes.includes(consultation_type))
    errors.push(`consultation_type must be one of: ${validTypes.join(', ')}`);
  
  // Validate slot_date if provided - must be within current week (tomorrow + 6 days = 7 days total)
  if (slot_date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(slot_date))
      errors.push('slot_date must be in YYYY-MM-DD format');
    
    // Use string-based comparison to avoid timezone issues
    // Calculate dates using local timezone components
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    
    // Rolling 7-day window: tomorrow to tomorrow+6 (inclusive)
    const tomorrowDate = new Date(year, month, date + 1);
    const endDate = new Date(year, month, date + 7); // tomorrow + 6 = today + 7
    
    // Format as YYYY-MM-DD using local timezone (NOT toISOString which converts to UTC)
    const formatDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    
    const tomorrowStr = formatDate(tomorrowDate);
    const endStr = formatDate(endDate);
    
    console.log(`[Validation] slot_date=${slot_date}, range=${tomorrowStr} to ${endStr}`);
    
    if (slot_date < tomorrowStr)
      errors.push('slot_date cannot be in the past');
    
    if (slot_date > endStr)
      errors.push(`slot_date must be within the next 7 days (${tomorrowStr} to ${endStr})`);
  }

  if (errors.length > 0) return res.status(422).json({ errors });
  next();
};

module.exports = { validateDoctorRegistration, validateAvailability };