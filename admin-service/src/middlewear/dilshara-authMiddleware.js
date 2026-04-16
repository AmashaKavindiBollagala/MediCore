// admin-service/src/middleware/dilshara-authMiddleware.js
// Verifies JWT and ensures the caller has the 'admin' role
// The token is issued by auth-service (Amasha's team) — we only verify it here

const jwt = require('jsonwebtoken');

module.exports = function dilsharaAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};