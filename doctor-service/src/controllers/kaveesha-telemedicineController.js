const pool = require('../config/kaveesha-doctorPool');
const crypto = require('crypto');

// Helper: get doctor profile id from user id
const getDoctorProfileId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM doctors.profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
};

// ─── POST /doctors/telemedicine/generate-room — Generate video call room ──────
const generateVideoRoom = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  const { appointment_id } = req.body;

  if (!appointment_id) {
    return res.status(400).json({ error: 'appointment_id is required' });
  }

  try {
    // Verify appointment belongs to this doctor
    const appointmentCheck = await pool.query(
      'SELECT id, patient_id, scheduled_at, consultation_type FROM appointments.bookings WHERE id = $1 AND doctor_id = $2',
      [appointment_id, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    const appointment = appointmentCheck.rows[0];

    // Generate unique room ID
    const roomId = `room_${appointment_id}_${crypto.randomBytes(8).toString('hex')}`;
    
    // For Jitsi integration (free, no API key needed)
    const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    const roomURL = `https://${jitsiDomain}/${roomId}`;

    // Store room info in database (you can create a telemedicine_sessions table)
    // For now, we'll just return the room info
    
    res.json({
      message: 'Video room generated successfully',
      room: {
        room_id: roomId,
        room_url: roomURL,
        appointment_id: appointment_id,
        doctor_id: doctorId,
        patient_id: appointment.patient_id,
        platform: 'jitsi',
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[generateVideoRoom]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /doctors/telemedicine/appointment/:appointmentId — Get room info ─────
const getVideoRoomByAppointment = async (req, res) => {
  const doctorId = await getDoctorProfileId(req.user.id);
  if (!doctorId)
    return res.status(404).json({ error: 'Doctor profile not found' });

  try {
    // This would query a telemedicine_sessions table if you create one
    // For now, we'll generate a new room or return placeholder
    res.json({
      message: 'Use generate-room endpoint to create a video room for this appointment',
      appointment_id: req.params.appointmentId
    });
  } catch (err) {
    console.error('[getVideoRoomByAppointment]', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  generateVideoRoom,
  getVideoRoomByAppointment,
};
