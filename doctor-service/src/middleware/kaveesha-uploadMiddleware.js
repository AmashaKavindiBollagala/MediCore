const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Storage config for doctor registration ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('/app/uploads', 'doctors');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── Storage config for patient reports ────────────────────────────────────────
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('/app/uploads', 'reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `report-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── File type filter ──────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype.replace('image/', '').replace('application/', ''));
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}. Only JPG, PNG, PDF allowed.`), false);
  }
};

// ─── Upload instances ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
});

const reportUpload = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file for reports
  fileFilter,
});

// ─── Multi-field upload for doctor registration ────────────────────────────────
const doctorRegisterUpload = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'id_card', maxCount: 1 },
  { name: 'medical_license', maxCount: 1 },
  { name: 'medical_id', maxCount: 1 },
]);

// ─── Error handler wrapper ─────────────────────────────────────────────────────
const handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB per file.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = { doctorRegisterUpload, reportUpload, handleUpload };