// ── User ──
export interface User {
  _id: string;
  email: string;
  displayName: string;
  phone: string;
  photoURL: string;
  role: 'member' | 'admin';
  referralCode: string;
  referredBy: string;
  attendanceCount: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: string | null;
  referralCount: number;
  rewardEligible: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Attendance ──
export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface Attendance {
  _id: string;
  userId: string | User;
  date: string;
  markedAt: string;
  markedBy: string | User | null;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Referral ──
export type ReferralStatus = 'pending' | 'active';

export interface Referral {
  _id: string;
  referrerId: string;
  referrerCode: string;
  referredId: string | User;
  referredName: string;
  referredEmail: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Reward ──
export type RewardStatus = 'pending' | 'processing' | 'paid' | 'rejected';

export interface RewardHistory {
  _id: string;
  userId: string | User;
  amount: number;
  period: string;
  status: RewardStatus;
  awardedAt: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ── Announcement ──
export type AnnouncementPriority = 'low' | 'medium' | 'high';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  priority: AnnouncementPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Document ──
export interface UploadedDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// ── API Response ──
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── Auth ──
export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  referralCode?: string;
}
