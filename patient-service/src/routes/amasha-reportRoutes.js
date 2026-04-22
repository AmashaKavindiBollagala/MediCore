const express = require('express');
const router = express.Router();
const { uploadPatientReport, getPatientReports, deletePatientReport } = require('../controllers/amasha-reportController');
const authMiddleware = require('../middleware/amasha-auth');
const { reportUpload, handleUpload } = require('../middleware/amasha-uploadMiddleware');

// Upload patient report (protected, with file upload)
router.post('/reports', authMiddleware, handleUpload(reportUpload.single('file')), uploadPatientReport);

// Get all patient reports (protected)
router.get('/reports', authMiddleware, getPatientReports);

// Delete a report (protected)
router.delete('/reports/:id', authMiddleware, deletePatientReport);

module.exports = router;
