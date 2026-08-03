const express = require('express');
const router = express.Router();
const { listDocuments, uploadDocument, deleteDocument } = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { uploadDocumentSchema, mongoIdParamSchema } = require('../validators/resource.validators');
const { uploadDocument: uploadMiddleware } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

// GET /api/documents — List documents (public)
router.get('/', listDocuments);

// POST /api/documents/upload — Upload document (admin only)
router.post('/upload', authenticate, requireRole(ROLES.ADMIN), (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadDocument);

// DELETE /api/documents/:id — Delete document (admin only)
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), validate({ params: mongoIdParamSchema }), deleteDocument);

module.exports = router;
