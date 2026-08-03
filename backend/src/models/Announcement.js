const mongoose = require('mongoose');
const { ANNOUNCEMENT_PRIORITY } = require('../config/constants');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_PRIORITY),
      default: ANNOUNCEMENT_PRIORITY.LOW,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common query: active announcements sorted by priority + date
announcementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
