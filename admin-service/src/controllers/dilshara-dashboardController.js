
// Returns high-level stats shown on the admin dashboard home page

const pool = require('../config/dilshara-db');

// GET /admin/stats
// Returns doctor counts by verification_status + total user counts by role
exports.getStats = async (req, res) => {
  try {
    // Doctor counts from doctor-service DB (doctors schema)
    const doctorStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE verification_status = 'pending')  AS pending,
        COUNT(*) FILTER (WHERE verification_status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE verification_status = 'rejected') AS rejected,
        COUNT(*)                                                  AS total
      FROM public.profiles
    `);

    // User counts from auth-service DB (auth schema)
    const userStats = await pool.query(`
      SELECT
        COUNT(*)                                           AS total_users,
        COUNT(*) FILTER (WHERE role = 'patient')          AS patients,
        COUNT(*) FILTER (WHERE role = 'doctor')           AS doctors,
        COUNT(*) FILTER (WHERE role = 'admin')            AS admins
      FROM auth.users
    `);

    res.json({
      doctors: doctorStats.rows[0],
      users:   userStats.rows[0],
    });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ error: err.message });
  }
};