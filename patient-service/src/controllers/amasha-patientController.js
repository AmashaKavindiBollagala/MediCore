const {
  findByUserId,
  createPatientFromAuth,
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

module.exports = { syncPatientProfile };