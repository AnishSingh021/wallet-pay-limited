/**
 * Shared enums and constants for the Wallet Pay backend.
 */

const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
};

const REWARD_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  REJECTED: 'rejected',
};

const REFERRAL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
};

const ANNOUNCEMENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  REWARD_STATUS,
  REFERRAL_STATUS,
  ANNOUNCEMENT_PRIORITY,
  PAGINATION,
};
