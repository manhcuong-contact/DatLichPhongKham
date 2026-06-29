/**
 * src/middlewares/upload.js
 * Multer file upload middleware
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const BASE_UPLOAD = path.join(__dirname, '../../uploads');

const storage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(BASE_UPLOAD, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${subDir}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const uploadAvatar  = multer({ storage: storage('avatars'),    fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } });
const uploadClinic  = multer({ storage: storage('clinics'),    fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } });
const uploadSpecialty = multer({ storage: storage('specialties'), fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } });

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

module.exports = { uploadAvatar, uploadClinic, uploadSpecialty, handleUploadError };
