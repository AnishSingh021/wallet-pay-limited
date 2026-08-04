const Notification = require('../models/Notification');
const { PAGINATION } = require('../config/constants');

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Auth
 */
const getNotifications = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    unreadOnly,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = { userId: req.user.id };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user.id, isRead: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Mark a notification as read (or all)
 * @route   PATCH /api/notifications/:id/read
 * @access  Auth
 */
const markAsRead = async (req, res) => {
  const { id } = req.params;

  if (id === 'all') {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  res.json({ success: true, data: notification });
};

module.exports = { getNotifications, markAsRead };
