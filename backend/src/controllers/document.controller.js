const UploadedDocument = require('../models/UploadedDocument');
const fs = require('fs');
const path = require('path');
const { PAGINATION } = require('../config/constants');

/**
 * @desc    List all documents (public access)
 * @route   GET /api/documents
 * @access  Public
 */
const listDocuments = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [documents, total] = await Promise.all([
    UploadedDocument.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('uploadedBy', 'displayName'),
    UploadedDocument.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Upload a document (admin)
 * @route   POST /api/documents/upload
 * @access  Admin
 */
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { title, description } = req.body;

  const document = await UploadedDocument.create({
    title: title || req.file.originalname,
    description: description || '',
    fileUrl: `/uploads/documents/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    uploadedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully.',
    data: document,
  });
};

/**
 * @desc    Delete a document (admin)
 * @route   DELETE /api/documents/:id
 * @access  Admin
 */
const deleteDocument = async (req, res) => {
  const document = await UploadedDocument.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  // Delete the physical file
  const filePath = path.join(__dirname, '..', '..', document.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await UploadedDocument.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Document deleted.',
  });
};

module.exports = { listDocuments, uploadDocument, deleteDocument };
