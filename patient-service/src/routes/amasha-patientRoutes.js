const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, authorizeRole } = require('../middleware/amasha-authmiddleware');
const {
  getProfile, saveProfile,
  uploadReport, getReports, getPrescriptions
} = require('../controllers/amasha-patientController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

router.get('/profile',       verifyToken, authorizeRole('patient', 'admin'), getProfile);
router.post('/profile',      verifyToken, authorizeRole('patient'), saveProfile);
router.post('/reports',      verifyToken, authorizeRole('patient'), upload.single('report'), uploadReport);
router.get('/reports',       verifyToken, authorizeRole('patient', 'admin'), getReports);
router.get('/prescriptions', verifyToken, authorizeRole('patient'), getPrescriptions);

module.exports = router;