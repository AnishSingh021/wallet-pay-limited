const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, listUsers, approveUser, rejectUser, updatePaymentDetails, uploadQRImage, listPaymentDetails, verifyPaymentDetails } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { uploadPhoto } = require('../middleware/upload');
const { updateProfileSchema, approveRejectParamsSchema } = require('../validators/resource.validators');
const { ROLES } = require('../config/constants');

// ── Member Routes ──

// GET /api/users/me — Get profile
router.get('/me', authenticate, getProfile);

// PUT /api/users/me — Update profile (with optional photo upload)
router.put('/me', authenticate, (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, validate({ body: updateProfileSchema }), updateProfile);

// ── Admin Routes ──

// GET /api/users — List all users
router.get('/', authenticate, requireRole(ROLES.ADMIN), listUsers);

// PATCH /api/users/:id/approve
router.patch('/:id/approve', authenticate, requireRole(ROLES.ADMIN), validate({ params: approveRejectParamsSchema }), approveUser);

// PATCH /api/users/:id/reject
router.patch('/:id/reject', authenticate, requireRole(ROLES.ADMIN), validate({ params: approveRejectParamsSchema }), rejectUser);

// GET /api/users/admin/payments — List all users with payment details
router.get('/admin/payments', authenticate, requireRole(ROLES.ADMIN), listPaymentDetails);

// PUT /api/users/:id/payment/verify — Approve/Reject user payment details
router.put('/:id/payment/verify', authenticate, requireRole(ROLES.ADMIN), verifyPaymentDetails);

// ── User Payment Routes ──

// PUT /api/users/me/payment — Update payment details
router.put('/me/payment', authenticate, updatePaymentDetails);

// POST /api/users/me/payment/qr — Upload QR Image
// Assuming uploadPhoto middleware can be reused, but let's make sure it handles generic image uploads or create uploadQR.
// We will use uploadPhoto which puts it in /uploads/photos which is fine for images. We can just use it.
router.post('/me/payment/qr', authenticate, (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, uploadQRImage);

module.exports = router;
