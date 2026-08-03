import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Zap, Flame, Award, CalendarCheck, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Attendance, RewardHistory } from '../../lib/types';

export function DashboardOverview() {
  const { user } = useAuthStore();

  // Fetch today's attendance status to show on dashboard
  const { data: attendanceHistory, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: async () => {
      const res = await api.get('/attendance/history?limit=1');
      return res.data.data as Attendance[];
    },
  });

  // Fetch recent rewards
  const { data: recentRewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewards', 'history'],
    queryFn: async () => {
      const res = await api.get('/rewards/history?limit=3');
      return res.data.data as RewardHistory[];
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const lastMarkedDate = attendanceHistory?.[0]?.date.split('T')[0];
  const isMarkedToday = lastMarkedDate === today;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">
            Welcome back, {user?.displayName.split(' ')[0]}!
          </h1>
          <p className="text-surface-600 mt-1">Here's your summary for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/attendance">
            <Button 
              variant={isMarkedToday ? 'secondary' : 'primary'} 
              icon={<CalendarCheck className="w-4 h-4" />}
            >
              {isMarkedToday ? 'Attendance Marked' : 'Mark Attendance'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning-500/15 text-warning-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-surface-600">Current Streak</p>
            <p className="text-2xl font-display font-bold text-surface-900">{user?.currentStreak || 0} days</p>
          </div>
        </Card>
        
        <Card hover padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info-500/15 text-info-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-surface-600">Longest Streak</p>
            <p className="text-2xl font-display font-bold text-surface-900">{user?.longestStreak || 0} days</p>
          </div>
        </Card>

        <Card hover padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-surface-600">Referrals</p>
            <p className="text-2xl font-display font-bold text-surface-900">{user?.referralCount || 0}</p>
          </div>
        </Card>

        <Card hover padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-500/15 text-success-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-surface-600">Status</p>
            <p className="text-lg font-display font-bold text-surface-900">
              {user?.rewardEligible ? <Badge variant="success">Eligible</Badge> : <Badge variant="neutral">Not Eligible</Badge>}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions / Getting Started */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Keep up your momentum</CardDescription>
          </CardHeader>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200 border border-surface-300">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMarkedToday ? 'bg-success-500/20 text-success-500' : 'bg-surface-300 text-surface-600'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-medium text-surface-800">Today's Attendance</span>
              </div>
              {isMarkedToday ? <Badge variant="success">Done</Badge> : <Link to="/app/attendance"><Button size="sm">Mark Now</Button></Link>}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200 border border-surface-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-medium text-surface-800">Refer a colleague</span>
              </div>
              <Link to="/app/referrals"><Button variant="secondary" size="sm">Get Code</Button></Link>
            </div>
          </div>
        </Card>

        {/* Recent Rewards */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Rewards</CardTitle>
            <CardDescription>Your latest earnings</CardDescription>
          </CardHeader>
          <div className="flex-1">
            {isLoadingRewards ? (
              <SkeletonCard />
            ) : recentRewards && recentRewards.length > 0 ? (
              <div className="space-y-3">
                {recentRewards.map((reward) => (
                  <div key={reward._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-200 border border-surface-300">
                    <div>
                      <p className="font-medium text-surface-900">₹{reward.amount}</p>
                      <p className="text-xs text-surface-500">{reward.period} • {reward.note}</p>
                    </div>
                    <Badge 
                      variant={
                        reward.status === 'paid' ? 'success' : 
                        reward.status === 'processing' ? 'primary' : 
                        reward.status === 'rejected' ? 'danger' : 'warning'
                      }
                    >
                      {reward.status}
                    </Badge>
                  </div>
                ))}
                <Link to="/app/rewards" className="block text-center text-sm font-medium text-primary-500 hover:text-primary-600 mt-4">
                  View all history →
                </Link>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                <Award className="w-12 h-12 text-surface-400 mb-3" />
                <p className="text-surface-600 font-medium">No rewards yet</p>
                <p className="text-sm text-surface-500">Keep your streak up to earn!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
