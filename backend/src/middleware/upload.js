const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads subdirectories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ── Storage Configuration ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subdirectory based on route
    let subDir = 'misc';
    if (req.baseUrl.includes('documents') || req.path.includes('upload')) {
      subDir = 'documents';
    } else if (req.baseUrl.includes('users') || req.path.includes('photo')) {
      subDir = 'photos';
    }

    const uploadPath = path.join(__dirname, '..', '..', 'uploads', subDir);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ── File Filters ──
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype.split('/')[1]);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed.'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: PDF, DOC, XLS, PPT, TXT, CSV, images.'), false);
  }
};

// ── Upload Middleware Instances ──
const uploadPhoto = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('photo');

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
}).single('file');

module.exports = { uploadPhoto, uploadDocument };
