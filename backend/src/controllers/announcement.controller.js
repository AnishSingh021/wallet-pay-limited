const Announcement = require('../models/Announcement');
const { PAGINATION } = require('../config/constants');

/**
 * @desc    List active announcements
 * @route   GET /api/announcements
 * @access  Auth
 */
const listAnnouncements = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    includeInactive,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = {};
  // Admin can view inactive if requested
  if (req.user.role !== 'admin' || includeInactive !== 'true') {
    filter.isActive = true;
  }

  // Priority sort order: high > medium > low
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Announcement.countDocuments(filter),
  ]);

  // Sort by priority (high first) then by date
  announcements.sort((a, b) => {
    const pDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({
    success: true,
    data: announcements,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Create announcement (admin)
 * @route   POST /api/announcements
 * @access  Admin
 */
const createAnnouncement = async (req, res) => {
  const { title, content, priority } = req.body;

  // Get admin's display name
  const User = require('../models/User');
  const admin = await User.findById(req.user.id).select('displayName');

  const announcement = await Announcement.create({
    title,
    content,
    priority: priority || 'low',
    authorId: req.user.id,
    authorName: admin ? admin.displayName : 'Admin',
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created.',
    data: announcement,
  });
};

/**
 * @desc    Update announcement (admin)
 * @route   PUT /api/announcements/:id
 * @access  Admin
 */
const updateAnnouncement = async (req, res) => {
  const { title, content, priority, isActive } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (priority !== undefined) updateData.priority = priority;
  if (isActive !== undefined) updateData.isActive = isActive;

  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }

  res.json({
    success: true,
    message: 'Announcement updated.',
    data: announcement,
  });
};

/**
 * @desc    Delete announcement (soft delete — set isActive: false)
 * @route   DELETE /api/announcements/:id
 * @access  Admin
 */
const deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }

  res.json({
    success: true,
    message: 'Announcement deleted.',
    data: announcement,
  });
};

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
