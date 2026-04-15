// admin-service/src/controllers/dilshara-usersController.js
// Read-only user list — auth.users is owned by auth-service (Amasha)
// Admin can VIEW users but cannot create/delete them here

const pool = require('../config/dilshara-db');

// GET /admin/users?role=all|patient|doctor|admin
exports.getUsers = async (req, res) => {
  const { role = 'all' } = req.query;
  try {
    const whereClause = role === 'all' ? '' : `WHERE role = $1`;
    const params      = role === 'all' ? [] : [role];

    const result = await pool.query(
      `SELECT id, email, role, created_at
       FROM auth.users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getUsers error:', err.message);
    res.status(500).json({ error: err.message });
  }
};