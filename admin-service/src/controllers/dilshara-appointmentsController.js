
// PLACEHOLDER — Appointment & availability logic is owned by doctor-service (Kaveesha)
// Admin dashboard shows a read-only summary view only
// Wire up real queries once the doctor-service team exposes their availability schema

const pool = require('../config/dilshara-db');

// GET /admin/appointments/summary
exports.getAppointmentsSummary = async (req, res) => {
  try {
    // TODO: Replace with real queries once doctor-service availability APIs confirmed
    // Expected tables: doctors.availability, doctors.availability_exceptions

    // Attempt a lightweight query — fails gracefully if schema not yet available
    let availabilityCount = null;
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS active_slots FROM doctors.availability WHERE is_active = TRUE`
      );
      availabilityCount = result.rows[0].active_slots;
    } catch {
      // Schema might not be in admin-service DB yet
    }

    res.json({
      note: 'Full availability dashboard will be wired up once doctor-service team shares schema.',
      stub: true,
      data: {
        active_availability_slots: availabilityCount,
        doctors_with_no_availability: null,
        todays_appointments: null,
        upcoming_exceptions: null,
      },
    });
  } catch (err) {
    console.error('getAppointmentsSummary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};