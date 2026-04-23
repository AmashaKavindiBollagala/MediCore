// kaveesha-authMiddleware.js
// JWT authentication middleware for telemedicine service

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medicore_secret';

/**
 * Verify JWT token and attach user to request
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

/**
 * Only allow doctors
 */
export function requireDoctor(req, res, next) {
  if (req.user?.role !== 'doctor') {
    return res.status(403).json({ success: false, error: 'Doctor access required' });
  }
  next();
}

/**
 * Only allow patients
 */
export function requirePatient(req, res, next) {
  if (req.user?.role !== 'patient') {
    return res.status(403).json({ success: false, error: 'Patient access required' });
  }
  next();
}

/**
 * Allow both doctors and patients
 */
export function requireDoctorOrPatient(req, res, next) {
  if (!['doctor', 'patient'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, error: 'Access restricted to doctors and patients' });
  }
  next();
}