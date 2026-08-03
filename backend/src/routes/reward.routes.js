const express = require('express');
const router = express.Router();
const { getHistory, adminGetAll, adminCreate, adminUpdateStatus } = require('../controllers/reward.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { createRewardSchema, updateRewardStatusSchema, mongoIdParamSchema } = require('../validators/resource.validators');
const { ROLES } = require('../config/constants');

// ── Member Routes ──

// GET /api/rewards/history — Get own reward history
router.get('/history', authenticate, getHistory);

// ── Admin Routes ──

// GET /api/rewards/admin/all — Get all rewards
router.get('/admin/all', authenticate, requireRole(ROLES.ADMIN), adminGetAll);

// POST /api/rewards/admin/create — Create a reward
router.post('/admin/create', authenticate, requireRole(ROLES.ADMIN), validate({ body: createRewardSchema }), adminCreate);

// PATCH /api/rewards/admin/:id/status — Update reward status
router.patch('/admin/:id/status', authenticate, requireRole(ROLES.ADMIN), validate({ body: updateRewardStatusSchema, params: mongoIdParamSchema }), adminUpdateStatus);

module.exports = router;
