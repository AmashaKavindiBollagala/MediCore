const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewear/auth');
const symptomController = require('../controllers/dilshara-controller');

// Multer for file uploads (PDF + images)
const uploadFile = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and image files (JPG, PNG, WEBP) are supported'));
  }
});

// Multer for audio uploads (voice recording)
const uploadAudio = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/x-m4a'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only audio files are supported'));
  }
});

// All routes require authentication
router.use(auth);

router.post('/text',  symptomController.checkByText);
router.post('/file',  uploadFile.single('file'), symptomController.checkByFile);
router.post('/voice', uploadAudio.single('audio'), symptomController.checkByVoice);
router.get('/history', symptomController.getHistory);

module.exports = router;