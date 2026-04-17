const {
  findByUserId,
  createPatientFromAuth,
  updatePatientProfile,
} = require('../models/amasha-patientModel');

const syncPatientProfile = async (req, res) => {
  try {
    const { user_id, name, email, phone } = req.body;
    
    console.log('Received sync request:', { user_id, name, email, phone });
    
    if (!user_id || !name || !email) {
      console.error('Missing required fields:', { user_id, name, email });
      return res.status(400).json({ message: 'user_id, name, and email are required.' });
    }

    // Check if patient already exists
    const existing = await findByUserId(user_id);
    if (existing) {
      console.log('Patient already exists for user_id:', user_id);
      return res.status(200).json({ message: 'Patient profile already exists.', patient: existing });
    }

    // Create patient profile
    console.log('Creating new patient profile...');
    const patient = await createPatientFromAuth(user_id, name, email, phone);
    console.log('Patient profile created:', patient);
    res.status(201).json({ message: 'Patient profile created successfully.', patient });
  } catch (err) {
    console.error('syncPatientProfile error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error during patient profile sync.' });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const patient = await findByUserId(userId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    res.json(patient);
  } catch (err) {
    console.error('getPatientProfile error:', err);
    res.status(500).json({ message: 'Server error fetching patient profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    
    const patient = await updatePatientProfile(userId, updates);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    res.json({ message: 'Profile updated successfully', patient });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error updating patient profile' });
  }
};

module.exports = { syncPatientProfile, getPatientProfile, updateProfile };