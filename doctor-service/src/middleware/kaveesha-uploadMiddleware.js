const multer = require('multer');
const cloudinary = require('../config/kaveesha-cloudinary');
const path = require('path');

// ─── Memory storage for Cloudinary upload ────────────────────────────────────
const storage = multer.memoryStorage();

// ─── Disk storage for patient reports (temporary) ───────────────────────────
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('/app/uploads', 'reports');
    const fs = require('fs');
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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}. Only JPG, PNG, PDF allowed.`), false);
  }
};

// ─── Upload instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
});

// ─── Report upload instance ───────────────────────────────────────────────────
const reportUpload = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file for reports
  fileFilter,
});

// ─── Multi-field upload for doctor registration ────────────────────────────────
const doctorRegisterUpload = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'id_card_front', maxCount: 1 },
  { name: 'id_card_back', maxCount: 1 },
  { name: 'medical_license', maxCount: 1 },
  { name: 'degree_certificates', maxCount: 1 },
]);

// ─── Upload to Cloudinary helper ───────────────────────────────────────────────
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `medicore/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    
    // Convert buffer to stream and upload
    const Readable = require('stream').Readable;
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

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

module.exports = { doctorRegisterUpload, reportUpload, handleUpload, uploadToCloudinary };