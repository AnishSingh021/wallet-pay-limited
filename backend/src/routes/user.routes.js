const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, listUsers, approveUser, rejectUser } = require('../controllers/user.controller');
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

module.exports = router;
