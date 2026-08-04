const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadQRCloudinary } = require('../middleware/upload');
const User = require('../models/User');

// POST /api/payment/upload-qr
router.post('/upload-qr', authenticate, (req, res, next) => {
  uploadQRCloudinary(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    // req.file.path contains the secure Cloudinary URL when using multer-storage-cloudinary
    const qrImage = req.file.path;

    // Save the URL to the user's document
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { qrImage, paymentUpdatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'QR Image uploaded to Cloudinary.', data: { qrImage } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
