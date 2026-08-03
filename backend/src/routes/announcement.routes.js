const express = require('express');
const router = express.Router();
const { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcement.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { createAnnouncementSchema, updateAnnouncementSchema, mongoIdParamSchema } = require('../validators/resource.validators');
const { ROLES } = require('../config/constants');

// GET /api/announcements — List announcements (auth required)
router.get('/', authenticate, listAnnouncements);

// POST /api/announcements — Create (admin only)
router.post('/', authenticate, requireRole(ROLES.ADMIN), validate({ body: createAnnouncementSchema }), createAnnouncement);

// PUT /api/announcements/:id — Update (admin only)
router.put('/:id', authenticate, requireRole(ROLES.ADMIN), validate({ body: updateAnnouncementSchema, params: mongoIdParamSchema }), updateAnnouncement);

// DELETE /api/announcements/:id — Delete / soft-delete (admin only)
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), validate({ params: mongoIdParamSchema }), deleteAnnouncement);

module.exports = router;
