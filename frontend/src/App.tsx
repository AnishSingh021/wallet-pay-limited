import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { DashboardOverview } from './pages/dashboard/Overview';
import { AttendancePage } from './pages/dashboard/Attendance';
import { RewardsPage } from './pages/dashboard/Rewards';
import { ProfilePage } from './pages/dashboard/Profile';
import { AnnouncementsPage } from './pages/dashboard/Announcements';
import { PaymentDetails } from './pages/dashboard/PaymentDetails';

import { AdminOverview } from './pages/admin/AdminOverview';
import { ManageMembers } from './pages/admin/ManageMembers';
import { ApprovalsPage } from './pages/admin/Approvals';
import { ManageRewards } from './pages/admin/ManageRewards';
import { ManageAnnouncements } from './pages/admin/ManageAnnouncements';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { ManagePayments } from './pages/admin/ManagePayments';
import { PublicDocuments } from './pages/Documents';
import { Toaster } from 'react-hot-toast';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  // Check authentication on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Don't render routing until initial auth check is done to prevent flickering
  if (isLoading) {
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/documents" element={<PublicDocuments />} />
          </Route>

          {/* Protected Member Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="payment" element={<PaymentDetails />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="members" element={<ManageMembers />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="rewards" element={<ManageRewards />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="documents" element={<ManageDocuments />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
