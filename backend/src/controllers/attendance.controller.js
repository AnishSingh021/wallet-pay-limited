const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { ATTENDANCE_STATUS, PAGINATION } = require('../config/constants');

/**
 * Normalize a date to midnight UTC for consistent storage.
 */
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if two dates are consecutive calendar days.
 */
const isConsecutiveDay = (prev, current) => {
  if (!prev) return false;
  const prevDate = new Date(prev);
  prevDate.setUTCHours(0, 0, 0, 0);
  const currDate = new Date(current);
  currDate.setUTCHours(0, 0, 0, 0);
  const diff = currDate.getTime() - prevDate.getTime();
  return diff === 24 * 60 * 60 * 1000;
};

/**
 * Check if two dates are the same calendar day.
 */
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

/**
 * @desc    Mark attendance for today
 * @route   POST /api/attendance/mark
 * @access  Auth
 */
const markAttendance = async (req, res) => {
  const today = normalizeDate(new Date());

  // Check if already marked today
  const existing = await Attendance.findOne({
    userId: req.user.id,
    date: today,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Attendance already marked for today.',
      data: existing,
    });
  }

  // Create attendance record
  const attendance = await Attendance.create({
    userId: req.user.id,
    date: today,
    markedAt: new Date(),
    status: ATTENDANCE_STATUS.PRESENT,
  });

  // Update user's streak and attendance stats
  const user = await User.findById(req.user.id);

  let newStreak = 1;
  if (isConsecutiveDay(user.lastAttendance, today)) {
    newStreak = user.currentStreak + 1;
  }

  user.attendanceCount += 1;
  user.currentStreak = newStreak;
  user.longestStreak = Math.max(user.longestStreak, newStreak);
  user.lastAttendance = today;
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully.',
    data: {
      attendance,
      stats: {
        attendanceCount: user.attendanceCount,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    },
  });
};

/**
 * @desc    Get current user's attendance history
 * @route   GET /api/attendance/history
 * @access  Auth
 */
const getHistory = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    startDate,
    endDate,
    month,
    year,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = { userId: req.user.id };

  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = normalizeDate(startDate);
    if (endDate) filter.date.$lte = normalizeDate(endDate);
  } else if (month && year) {
    // Month/year filter for calendar view
    const startOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    const endOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 0));
    filter.date = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('markedBy', 'displayName'),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Get all attendance records (admin)
 * @route   GET /api/attendance/admin/all
 * @access  Admin
 */
const adminGetAll = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    userId,
    startDate,
    endDate,
    date,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = {};
  if (userId) filter.userId = userId;
  if (date) {
    filter.date = normalizeDate(date);
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = normalizeDate(startDate);
    if (endDate) filter.date.$lte = normalizeDate(endDate);
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'displayName email photoURL')
      .populate('markedBy', 'displayName'),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Admin override attendance for a user
 * @route   POST /api/attendance/admin/override
 * @access  Admin
 */
const adminOverride = async (req, res) => {
  const { userId, date, status } = req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const normalizedDate = normalizeDate(date);

  // Upsert: update if exists, create if not
  const attendance = await Attendance.findOneAndUpdate(
    { userId, date: normalizedDate },
    {
      userId,
      date: normalizedDate,
      markedAt: new Date(),
      markedBy: req.user.id,
      status,
    },
    { upsert: true, new: true, runValidators: true }
  );

  // Recalculate user attendance stats if marking as present
  if (status === ATTENDANCE_STATUS.PRESENT) {
    const totalPresent = await Attendance.countDocuments({
      userId,
      status: ATTENDANCE_STATUS.PRESENT,
    });
    user.attendanceCount = totalPresent;

    // Recalculate streak
    const allAttendance = await Attendance.find({
      userId,
      status: ATTENDANCE_STATUS.PRESENT,
    }).sort({ date: 1 });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < allAttendance.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else if (isConsecutiveDay(allAttendance[i - 1].date, allAttendance[i].date)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Current streak: count back from the most recent
    currentStreak = 0;
    for (let i = allAttendance.length - 1; i >= 0; i--) {
      if (i === allAttendance.length - 1) {
        currentStreak = 1;
      } else if (isConsecutiveDay(allAttendance[i].date, allAttendance[i + 1].date)) {
        currentStreak++;
      } else {
        break;
      }
    }

    user.currentStreak = currentStreak;
    user.longestStreak = longestStreak;
    user.lastAttendance = allAttendance.length > 0 ? allAttendance[allAttendance.length - 1].date : null;
    await user.save();
  }

  res.json({
    success: true,
    message: `Attendance ${status} recorded for ${user.displayName} on ${date}.`,
    data: attendance,
  });
};

module.exports = { markAttendance, getHistory, adminGetAll, adminOverride };
