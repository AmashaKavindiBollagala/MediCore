const {
  findByUserId,
  upsertPatient,
  getReportsByPatientId,
  insertReport,
  getPrescriptionsByPatientId,
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

const getProfile = async (req, res) => {
  try {
    const patient = await findByUserId(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: 'Profile not found. Please create your profile.' });
    }
    res.json(patient);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const saveProfile = async (req, res) => {
  try {
    const patient = await upsertPatient(req.user.id, req.body);
    res.json({ message: 'Profile saved successfully.', patient });
  } catch (err) {
    console.error('saveProfile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const uploadReport = async (req, res) => {
  try {
    const patient = await findByUserId(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: 'Create your patient profile first.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const { description } = req.body;
    const report = await insertReport(
      patient.id,
      req.file.originalname,
      req.file.path,
      description
    );
    res.status(201).json({ message: 'Report uploaded successfully.', report });
  } catch (err) {
    console.error('uploadReport error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getReports = async (req, res) => {
  try {
    const patient = await findByUserId(req.user.id);
    if (!patient) return res.json([]);
    const reports = await getReportsByPatientId(patient.id);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const patient = await findByUserId(req.user.id);
    if (!patient) return res.json([]);
    const prescriptions = await getPrescriptionsByPatientId(patient.id);
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProfile, saveProfile, uploadReport, getReports, getPrescriptions, syncPatientProfile };