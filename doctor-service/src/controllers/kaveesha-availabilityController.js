const pool = require('../config/kaveesha-doctorPool');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM doctors.profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── POST /doctors/availability — add a slot ──────────────────────────────────
const addAvailabilitySlot = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found. Please register first.' });

  const { day_of_week, start_time, end_time, slot_duration_minutes, consultation_type } = req.body;

  try {
    // Check for overlap on same day and type
    const overlap = await pool.query(
      `SELECT id FROM doctors.availability
       WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true
         AND consultation_type = $3
         AND (
           (start_time < $5::TIME AND end_time > $4::TIME)
         )`,
      [doctorId, parseInt(day_of_week), consultation_type, start_time, end_time]
    );
    if (overlap.rows.length > 0) {
      return res.status(409).json({
        error: 'This time slot overlaps with an existing slot on the same day.',
      });
    }

    const result = await pool.query(
      `INSERT INTO doctors.availability
        (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, consultation_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        doctorId,
        parseInt(day_of_week),
        start_time,
        end_time,
        parseInt(slot_duration_minutes) || 30,
        consultation_type,
      ]
    );

    const slot = result.rows[0];
    slot.day_name = DAY_NAMES[slot.day_of_week];
    res.status(201).json({ message: 'Availability slot added', slot });
  } catch (err) {
    console.error('[addAvailabilitySlot]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/availability — my slots ────────────────────────────────────
const getMyAvailability = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `SELECT * FROM doctors.availability
       WHERE doctor_id = $1 AND is_active = true
       ORDER BY day_of_week, start_time`,
      [doctorId]
    );
    const slots = result.rows.map((s) => ({ ...s, day_name: DAY_NAMES[s.day_of_week] }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/:id/availability — public slots for a doctor ────────────────
const getDoctorAvailability = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT day_of_week, start_time, end_time, slot_duration_minutes, consultation_type
       FROM doctors.availability
       WHERE doctor_id = $1 AND is_active = true
       ORDER BY day_of_week, start_time`,
      [req.params.id]
    );
    const slots = result.rows.map((s) => ({ ...s, day_name: DAY_NAMES[s.day_of_week] }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /doctors/availability/:slotId ─────────────────────────────────────
const removeAvailabilitySlot = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      `UPDATE doctors.availability SET is_active = false
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

// ─── POST /doctors/availability/block — add exception date ────────────────────
const addExceptionDate = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { exception_date, reason } = req.body;
  if (!exception_date)
    return res.status(400).json({ error: 'exception_date is required (YYYY-MM-DD)' });

  try {
    const result = await pool.query(
      `INSERT INTO doctors.availability_exceptions (doctor_id, exception_date, reason)
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

// ─── GET /doctors/availability/exceptions ─────────────────────────────────────
const getExceptionDates = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    const result = await pool.query(
      'SELECT * FROM doctors.availability_exceptions WHERE doctor_id = $1 ORDER BY exception_date',
      [doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addAvailabilitySlot, getMyAvailability, getDoctorAvailability,
  removeAvailabilitySlot, addExceptionDate, getExceptionDates,
};