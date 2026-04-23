// admin-service/src/controllers/dilshara-usersController.js
// User management — view, suspend, reactivate users

const { mainPool } = require('../config/dilshara-db');

// GET /admin/users?role=all|patient|doctor|admin&status=all|active|suspended|banned&search=email
exports.getUsers = async (req, res) => {
  const { role = 'all', status = 'all', search = '' } = req.query;
  
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filter by role
    if (role !== 'all') {
      whereClause += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Filter by status
    if (status !== 'all') {
      whereClause += ` AND u.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Search by email, name, or phone
    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR p.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get users with profile information
    const result = await mainPool.query(
      `SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.status,
        u.suspension_reason,
        u.created_at,
        u.last_login
       FROM users u
       ${whereClause}
       ORDER BY u.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getUsers error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const result = await mainPool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'patient') as patients,
        COUNT(*) FILTER (WHERE role = 'doctor') as doctors,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
        COUNT(*) FILTER (WHERE status = 'banned') as banned
       FROM users`
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getUserStats error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT /admin/users/:id/suspend
exports.suspendUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await mainPool.query(
      `UPDATE users 
       SET status = 'suspended',
           suspension_reason = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, role, status, suspension_reason`,
      [id, reason || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User suspended successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('suspendUser error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT /admin/users/:id/activate
exports.activateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await mainPool.query(
      `UPDATE users 
       SET status = 'active',
           suspension_reason = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, role, status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User activated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('activateUser error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT /admin/users/:id/ban
exports.banUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await mainPool.query(
      `UPDATE users 
       SET status = 'banned',
           suspension_reason = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, role, status, suspension_reason`,
      [id, reason || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User banned successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('banUser error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/users/:id
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await mainPool.query(
      `SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.status,
        u.suspension_reason,
        u.created_at,
        u.last_login
       FROM users u
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getUserById error:', err.message);
    res.status(500).json({ error: err.message });
  }
};