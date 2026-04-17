const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewear/auth');
const symptomController = require('../controllers/dilshara-controller');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(auth);

// Text symptom check
router.post('/text', symptomController.checkByText);

// File upload symptom check
router.post('/file', upload.single('file'), symptomController.checkByFile);

// Voice recording symptom check
router.post('/voice', upload.single('audio'), symptomController.checkByVoice);

// Get symptom history
router.get('/history', symptomController.getHistory);

module.exports = router;
