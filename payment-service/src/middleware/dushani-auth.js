const jwt = require('jsonwebtoken');
const config = require('../config/paymentdatabase');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('=== authenticateToken START ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('authenticateToken - No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  console.log('authenticateToken - Verifying token...');
  
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      console.log('authenticateToken - Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    console.log('authenticateToken - Token verified for user:', user.id, 'Role:', user.role);
    console.log('=== authenticateToken END - SUCCESS ===');
    next();
  });
};

module.exports = { authenticateToken };
