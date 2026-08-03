const express = require('express');
const router = express.Router();
const { markAttendance, getHistory, adminGetAll, adminOverride } = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { attendanceOverrideSchema } = require('../validators/resource.validators');
const { ROLES } = require('../config/constants');

// ── Member Routes ──

// POST /api/attendance/mark — Mark today's attendance
router.post('/mark', authenticate, markAttendance);

// GET /api/attendance/history — Get own attendance history
router.get('/history', authenticate, getHistory);

// ── Admin Routes ──

// GET /api/attendance/admin/all — Get all attendance records
router.get('/admin/all', authenticate, requireRole(ROLES.ADMIN), adminGetAll);

// POST /api/attendance/admin/override — Override attendance
router.post('/admin/override', authenticate, requireRole(ROLES.ADMIN), validate({ body: attendanceOverrideSchema }), adminOverride);

module.exports = router;
