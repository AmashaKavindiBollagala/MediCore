const jwt = require('jsonwebtoken');

// ─── Verify JWT and attach user to req ────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── Restrict to specific roles ────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

// ─── Convenience guards ────────────────────────────────────────────────────────
const requireDoctor = requireRole('doctor');
const requireAdmin = requireRole('admin');
const requireDoctorOrAdmin = requireRole('doctor', 'admin');

module.exports = { authenticate, requireRole, requireDoctor, requireAdmin, requireDoctorOrAdmin };