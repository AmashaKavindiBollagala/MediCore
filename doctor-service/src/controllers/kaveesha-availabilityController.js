const pool = require('../config/kaveesha-doctorPool');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── POST /doctors/availability — add a slot ──────────────────────────────────
const addAvailabilitySlot = async (req, res) => {
  // req.user.id contains the doctor's profile id (UUID) from the JWT token
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found. Please register first.' });

  const { day_of_week, start_time, end_time, slot_duration_minutes, consultation_type, slot_date } = req.body;

  console.log(`[addAvailabilitySlot] Received body:`, req.body);
  console.log(`[addAvailabilitySlot] slot_date value:`, slot_date, typeof slot_date);

  // Convert day_of_week to number if it's a string
  const dayOfWeekNum = typeof day_of_week === 'string' ? parseInt(day_of_week) : day_of_week;

  // Validations
  if (dayOfWeekNum === null || dayOfWeekNum === undefined || isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6)
    return res.status(400).json({ error: 'Invalid day of week (0-6)' });
  if (!start_time || !end_time)
    return res.status(400).json({ error: 'Start time and end time are required' });
  if (start_time >= end_time)
    return res.status(400).json({ error: 'Start time must be before end time' });
  
  // If slot_date is provided, validate it's within the current week (tomorrow + 6 days = 7 days total)
  if (slot_date) {
    // Use string-based comparison to avoid timezone issues
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
    
    console.log(`[Availability Validation] Selected: ${slot_date}, Valid range: ${tomorrowStr} to ${endStr}`);
    
    if (slot_date < tomorrowStr)
      return res.status(400).json({ error: 'Cannot add slots for past dates' });
    
    if (slot_date > endStr)
      return res.status(400).json({ error: `Can only add slots for the next 7 days (${tomorrowStr} to ${endStr})` });
  }

  try {
    // If slot_date is provided, check if it's a blocked date
    if (slot_date) {
      const blockedCheck = await pool.query(
        `SELECT id, reason FROM availability_exceptions
         WHERE doctor_id = $1 AND exception_date = $2::DATE`,
        [doctorId, slot_date]
      );
      
      if (blockedCheck.rows.length > 0) {
        return res.status(400).json({
          error: `Cannot add time slots on a blocked date (${slot_date}). Reason: ${blockedCheck.rows[0].reason || 'No reason provided'}`,
        });
      }
    }
    
    // Check for ANY overlapping slots on the same day and date
    // Two time ranges overlap if: start1 < end2 AND end1 > start2
    let overlapQuery = `
      SELECT id FROM availability
      WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true
        AND start_time < $3::TIME AND end_time > $4::TIME
    `;
    const overlapParams = [doctorId, dayOfWeekNum, end_time, start_time];
    
    if (slot_date) {
      overlapQuery += ` AND slot_date = $5::DATE`;
      overlapParams.push(slot_date);
    } else {
      overlapQuery += ` AND slot_date IS NULL`;
    }
    
    const overlap = await pool.query(overlapQuery, overlapParams);
    
    if (overlap.rows.length > 0) {
      return res.status(409).json({
        error: 'This time slot overlaps with an existing slot on the same day.',
      });
    }

    const result = await pool.query(
      `INSERT INTO availability
        (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, consultation_type, slot_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        doctorId,
        dayOfWeekNum,
        start_time,
        end_time,
        parseInt(slot_duration_minutes) || 30,
        consultation_type,
        slot_date || null,
      ]
    );

    const slot = result.rows[0];
    slot.day_name = DAY_NAMES[slot.day_of_week];
    
    // Format slot_date as YYYY-MM-DD string to avoid timezone issues in frontend
    if (slot.slot_date) {
      const slotDate = new Date(slot.slot_date);
      slot.slot_date = slotDate.getFullYear() + '-' + 
        String(slotDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(slotDate.getDate()).padStart(2, '0');
    }
    
    res.status(201).json({ message: 'Availability slot added', slot });
  } catch (err) {
    console.error('[addAvailabilitySlot]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/availability — my slots ────────────────────────────────────
const getMyAvailability = async (req, res) => {
  // req.user.id contains the doctor's profile id (UUID) from the JWT token
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    // Calculate today's date in IST (Asia/Colombo) using string formatting
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const todayIST = new Date(year, month, date);
    const todayISTStr = todayIST.getFullYear() + '-' + 
      String(todayIST.getMonth() + 1).padStart(2, '0') + '-' + 
      String(todayIST.getDate()).padStart(2, '0');
    
    console.log(`[getMyAvailability] Today in IST: ${todayISTStr}`);
    
    // First, clean up expired slots (using IST date)
    await pool.query(
      `DELETE FROM availability 
       WHERE doctor_id = $1 AND slot_date IS NOT NULL AND slot_date < $2::DATE`,
      [doctorId, todayISTStr]
    );
    
    // Then fetch active slots (both recurring and future date-specific)
    const result = await pool.query(
      `SELECT * FROM availability
       WHERE doctor_id = $1 AND is_active = true
         AND (slot_date IS NULL OR slot_date >= $2::DATE)
       ORDER BY 
         CASE WHEN slot_date IS NULL THEN 0 ELSE 1 END,
         slot_date,
         day_of_week, 
         start_time`,
      [doctorId, todayISTStr]
    );
    
    // Format slot_date as YYYY-MM-DD string to avoid timezone issues in frontend
    const slots = result.rows.map((s) => {
      let formattedSlot = { ...s, day_name: DAY_NAMES[s.day_of_week] };
      
      // If slot_date exists, format it as YYYY-MM-DD string (not ISO datetime)
      if (s.slot_date) {
        const slotDate = new Date(s.slot_date);
        formattedSlot.slot_date = slotDate.getFullYear() + '-' + 
          String(slotDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(slotDate.getDate()).padStart(2, '0');
      }
      
      return formattedSlot;
    });
    
    console.log(`[getMyAvailability] Found ${slots.length} active slots`);
    console.log(`[getMyAvailability] Sample slot_date format:`, slots[0]?.slot_date);
    res.json(slots);
  } catch (err) {
    console.error('[getMyAvailability]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/:id/availability — public slots for a doctor ────────────────
const getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    // If date is provided, filter by that specific date
    if (date) {
      // Calculate day of week for the requested date
      const requestedDate = new Date(date + 'T00:00:00'); // Local timezone
      const dayOfWeek = requestedDate.getDay();
      
      // First, get date-specific slots for this exact date
      const dateSpecificResult = await pool.query(
        `SELECT day_of_week, start_time, end_time, slot_duration_minutes, consultation_type, slot_date
         FROM availability
         WHERE doctor_id = $1 AND is_active = true AND slot_date = $2
         ORDER BY start_time`,
        [req.params.id, date]
      );
      
      // Then, get recurring weekly slots for this day of week (only if no date-specific slots exist)
      let slots = dateSpecificResult.rows;
      
      if (slots.length === 0) {
        // Fall back to recurring weekly slots
        const weeklyResult = await pool.query(
          `SELECT day_of_week, start_time, end_time, slot_duration_minutes, consultation_type
           FROM availability
           WHERE doctor_id = $1 AND is_active = true AND slot_date IS NULL AND day_of_week = $2
           ORDER BY start_time`,
          [req.params.id, dayOfWeek]
        );
        slots = weeklyResult.rows;
      }
      
      const slotsWithDayName = slots.map((s) => ({ ...s, day_name: DAY_NAMES[s.day_of_week] }));
      res.json(slotsWithDayName);
    } else {
      // No date provided - return all slots (original behavior)
      const result = await pool.query(
        `SELECT day_of_week, start_time, end_time, slot_duration_minutes, consultation_type
         FROM availability
         WHERE doctor_id = $1 AND is_active = true
         ORDER BY day_of_week, start_time`,
        [req.params.id]
      );
      const slots = result.rows.map((s) => ({ ...s, day_name: DAY_NAMES[s.day_of_week] }));
      res.json(slots);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /doctors/availability/:slotId ─────────────────────────────────────
const removeAvailabilitySlot = async (req, res) => {
  // req.user.id contains the doctor's profile id (UUID) from the JWT token
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `DELETE FROM availability
       WHERE id = $1 AND doctor_id = $2 RETURNING id`,
      [req.params.slotId, doctorId]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Slot not found or not yours' });
    res.json({ message: 'Slot removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /doctors/availability/delete-by-slot — delete by date and time ───
const deleteAvailabilityBySlot = async (req, res) => {
  const { doctor_id } = req.params;
  const { slot_date, start_time } = req.body;

  if (!doctor_id || !slot_date || !start_time) {
    return res.status(400).json({ error: 'doctor_id, slot_date, and start_time are required' });
  }

  try {
    // Delete the matching availability slot
    const result = await pool.query(
      `DELETE FROM availability
       WHERE doctor_id = $1 AND slot_date = $2 AND start_time = $3 RETURNING id`,
      [doctor_id, slot_date, start_time]
    );
    
    if (!result.rows.length) {
      console.log(`No availability slot found for doctor ${doctor_id} on ${slot_date} at ${start_time}`);
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    console.log(`Availability slot deleted: doctor=${doctor_id}, date=${slot_date}, time=${start_time}`);
    res.json({ message: 'Slot removed', deleted_count: result.rows.length });
  } catch (err) {
    console.error('[deleteAvailabilityBySlot]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PUT /doctors/availability/:slotId ────────────────────────────────────────
const updateAvailabilitySlot = async (req, res) => {
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { day_of_week, start_time, end_time, slot_duration_minutes, consultation_type } = req.body;
  
  // Convert day_of_week to number if it's a string
  const dayOfWeekNum = typeof day_of_week === 'string' ? parseInt(day_of_week) : day_of_week;
  
  // Validations
  if (dayOfWeekNum === null || dayOfWeekNum === undefined || isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6)
    return res.status(400).json({ error: 'Invalid day of week (0-6)' });
  if (!start_time || !end_time)
    return res.status(400).json({ error: 'Start time and end time are required' });
  
  // Check if start time is before end time
  if (start_time >= end_time)
    return res.status(400).json({ error: 'Start time must be before end time' });

  try {
    // Check for overlapping slots on the same day (excluding current slot)
    const overlapCheck = await pool.query(
      `SELECT id FROM availability 
       WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true AND id != $3
       AND start_time < $4 AND end_time > $5`,
      [doctorId, dayOfWeekNum, req.params.slotId, end_time, start_time]
    );
    
    if (overlapCheck.rows.length > 0)
      return res.status(409).json({ error: 'Time slot overlaps with an existing slot on this day' });

    const result = await pool.query(
      `UPDATE availability 
       SET day_of_week = $1, start_time = $2, end_time = $3, 
           slot_duration_minutes = $4, consultation_type = $5
       WHERE id = $6 AND doctor_id = $7 RETURNING *`,
      [
        dayOfWeekNum,
        start_time,
        end_time,
        parseInt(slot_duration_minutes) || 30,
        consultation_type || 'online',
        req.params.slotId,
        doctorId
      ]
    );
    
    if (!result.rows.length)
      return res.status(404).json({ error: 'Slot not found or not yours' });
    
    res.json({ message: 'Slot updated', slot: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /doctors/availability/block — add exception date ────────────────────
const addExceptionDate = async (req, res) => {
  // req.user.id contains the doctor's profile id (UUID) from the JWT token
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { exception_date, reason } = req.body;
  
  // Validations
  if (!exception_date)
    return res.status(400).json({ error: 'exception_date is required (YYYY-MM-DD)' });
  
  // Check if date is in the past
  const selectedDate = new Date(exception_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today)
    return res.status(400).json({ error: 'Cannot block a past date' });

  try {
    const result = await pool.query(
      `INSERT INTO availability_exceptions (doctor_id, exception_date, reason)
       VALUES ($1, $2, $3) RETURNING *`,
      [doctorId, exception_date, reason || '']
    );
    res.status(201).json({ message: 'Date blocked', exception: result.rows[0] });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'This date is already blocked' });
    res.status(500).json({ error: err.message });
  }
};

// ─── PUT /doctors/availability/exceptions/:exceptionId ────────────────────────
const updateExceptionDate = async (req, res) => {
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { exception_date, reason } = req.body;
  
  // Validations
  if (!exception_date)
    return res.status(400).json({ error: 'exception_date is required (YYYY-MM-DD)' });
  
  // Check if date is in the past
  const selectedDate = new Date(exception_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today)
    return res.status(400).json({ error: 'Cannot block a past date' });

  try {
    const result = await pool.query(
      `UPDATE availability_exceptions 
       SET exception_date = $1, reason = $2
       WHERE id = $3 AND doctor_id = $4 RETURNING *`,
      [exception_date, reason || '', req.params.exceptionId, doctorId]
    );
    
    if (!result.rows.length)
      return res.status(404).json({ error: 'Exception date not found or not yours' });
    
    res.json({ message: 'Exception date updated', exception: result.rows[0] });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'This date is already blocked' });
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /doctors/availability/exceptions/:exceptionId ─────────────────────
const removeExceptionDate = async (req, res) => {
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `DELETE FROM availability_exceptions
       WHERE id = $1 AND doctor_id = $2 RETURNING id`,
      [req.params.exceptionId, doctorId]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Exception date not found or not yours' });
    res.json({ message: 'Exception date removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/availability/exceptions ─────────────────────────────────────
const getExceptionDates = async (req, res) => {
  // req.user.id contains the doctor's profile id (UUID) from the JWT token
  const doctorId = req.user.id;
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      'SELECT * FROM availability_exceptions WHERE doctor_id = $1 ORDER BY exception_date',
      [doctorId]
    );
    
    // Format exception_date as YYYY-MM-DD string to avoid timezone issues
    const formattedExceptions = result.rows.map(ex => {
      if (ex.exception_date) {
        const exDate = new Date(ex.exception_date);
        ex.exception_date = exDate.getFullYear() + '-' + 
          String(exDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(exDate.getDate()).padStart(2, '0');
      }
      return ex;
    });
    
    res.json(formattedExceptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addAvailabilitySlot, getMyAvailability, getDoctorAvailability,
  removeAvailabilitySlot, deleteAvailabilityBySlot, updateAvailabilitySlot,
  addExceptionDate, getExceptionDates,
  updateExceptionDate, removeExceptionDate,
};