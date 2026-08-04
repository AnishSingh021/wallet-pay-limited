const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/notifications — Get all user notifications
router.get('/', getNotifications);

// PATCH /api/notifications/:id/read — Mark notification(s) as read
router.patch('/:id/read', markAsRead);

module.exports = router;
