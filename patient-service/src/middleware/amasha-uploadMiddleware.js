const multer = require('multer');
const cloudinary = require('../config/amasha-cloudinary');

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}. Only JPG, PNG, PDF allowed.`), false);
  }
};

// Upload instance
const reportUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file for reports
  fileFilter,
});

// Upload to Cloudinary helper
const uploadToCloudinary = (fileBuffer, folder, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `medicore/${folder}`,
        resource_type: 'auto',
        public_id: `${Date.now()}-${originalName.split('.')[0]}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
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

// Error handler wrapper
const handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = { reportUpload, handleUpload, uploadToCloudinary };
