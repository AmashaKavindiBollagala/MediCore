const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByEmail, createUser, findById } = require('../models/amasha-usermodel');

// Import patient service to sync patient data
const createPatientProfile = async (userId, name, email, phone) => {
  try {
    const patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://patient-service:3000';
    console.log(`Attempting to sync patient profile to: ${patientServiceUrl}/api/patients/sync`);
    console.log('Patient data:', { user_id: userId, name, email, phone });
    
    const response = await fetch(`${patientServiceUrl}/api/patients/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name, email, phone }),
    });
    
    const responseText = await response.text();
    console.log('Patient service response status:', response.status);
    console.log('Patient service response:', responseText);
    
    if (!response.ok) {
      console.error('Failed to create patient profile:', responseText);
      return false;
    }
    
    console.log('Patient profile synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing patient profile:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
};

const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword, role || 'patient');

    // If role is patient, also create profile in patient_db
    if (role === 'patient' || !role) {
      await createPatientProfile(user.id, name, email, phone);
    }

    res.status(201).json({ message: 'Registration successful.', user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };