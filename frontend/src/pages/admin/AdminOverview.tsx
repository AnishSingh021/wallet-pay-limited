import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Users, CheckCircle, Gift, Bell } from 'lucide-react';
import api from '../../lib/axios';

export function AdminOverview() {
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: async () => {
      // Just fetch page 1 with limit 1 to get total counts
      const res = await api.get('/users?limit=1');
      const resUnapproved = await api.get('/users?limit=1&isApproved=false');
      return {
        totalUsers: res.data.pagination.total,
        pendingApprovals: resUnapproved.data.pagination.total,
      };
    },
  });

  const { data: rewardsData, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['admin', 'rewards', 'stats'],
    queryFn: async () => {
      const res = await api.get('/rewards/admin/all?status=pending&limit=1');
      return {
        pendingRewards: res.data.pagination.total,
      };
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Admin Hub</h1>
        <p className="text-surface-600 mt-1">Platform overview and pending actions.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingUsers ? <SkeletonCard /> : (
          <Card hover padding="lg" className="flex items-center gap-5 border-l-4 border-l-primary-500">
            <div className="w-12 h-12 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-surface-600 font-medium">Total Members</p>
              <p className="text-3xl font-display font-bold text-surface-900">{usersData?.totalUsers || 0}</p>
            </div>
          </Card>
        )}

        {isLoadingUsers ? <SkeletonCard /> : (
          <Card hover padding="lg" className="flex items-center gap-5 border-l-4 border-l-warning-500">
            <div className="w-12 h-12 rounded-xl bg-warning-500/15 text-warning-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-surface-600 font-medium">Pending Approvals</p>
              <p className="text-3xl font-display font-bold text-surface-900">{usersData?.pendingApprovals || 0}</p>
            </div>
          </Card>
        )}

        {isLoadingRewards ? <SkeletonCard /> : (
          <Card hover padding="lg" className="flex items-center gap-5 border-l-4 border-l-success-500">
            <div className="w-12 h-12 rounded-xl bg-success-500/15 text-success-500 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-surface-600 font-medium">Pending Rewards</p>
              <p className="text-3xl font-display font-bold text-surface-900">{rewardsData?.pendingRewards || 0}</p>
            </div>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current platform status</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-surface-200">
              <span className="text-surface-600">Database</span>
              <span className="font-medium text-success-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" /> Connected
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-200">
              <span className="text-surface-600">API Status</span>
              <span className="font-medium text-success-500">Healthy</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-surface-600">Environment</span>
              <span className="font-medium text-surface-800 uppercase text-sm px-2 py-1 bg-surface-200 rounded">
                Development
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
