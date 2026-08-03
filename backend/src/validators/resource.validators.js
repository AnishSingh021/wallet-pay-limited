const { z } = require('zod');

// ── User Validators ──
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters')
    .optional(),
  phone: z.string().trim().optional(),
});

const approveRejectParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// ── Attendance Validators ──
const markAttendanceSchema = z.object({
  date: z
    .string()
    .optional()
    .default(() => new Date().toISOString().split('T')[0]),
});

const attendanceOverrideSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'leave'], {
    errorMap: () => ({ message: 'Status must be present, absent, or leave' }),
  }),
});

// ── Reward Validators ──
const createRewardSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.string().trim().min(1, 'Period is required'),
  note: z.string().trim().optional().default(''),
});

const updateRewardStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'paid', 'rejected'], {
    errorMap: () => ({ message: 'Status must be pending, processing, paid, or rejected' }),
  }),
});

// ── Announcement Validators ──
const createAnnouncementSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Content is required'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('low'),
});

const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  isActive: z.boolean().optional(),
});

// ── Document Validators ──
const uploadDocumentSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().trim().optional().default(''),
});

// ── Shared Param Validators ──
const mongoIdParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

module.exports = {
  updateProfileSchema,
  approveRejectParamsSchema,
  markAttendanceSchema,
  attendanceOverrideSchema,
  createRewardSchema,
  updateRewardStatusSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  uploadDocumentSchema,
  mongoIdParamSchema,
};
