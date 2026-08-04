import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { NotificationsPopover } from '../../components/NotificationsPopover';
import { Zap, Flame, Award, CalendarCheck, TrendingUp, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityCalendar } from 'react-activity-calendar';
import api from '../../lib/axios';
import { Attendance, RewardHistory } from '../../lib/types';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const [arbpayUrl, setArbpayUrl] = useState<string | null>(null);

  // Fetch today's attendance status to show on dashboard
  const { data: attendanceHistory, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: async () => {
      const res = await api.get('/attendance/history?limit=1');
      return res.data.data as Attendance[];
    },
  });

  // Fetch full history for calendar
  const { data: fullHistory } = useQuery({
    queryKey: ['attendance', 'full-history'],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 365);
      const startDate = start.toISOString().split('T')[0];
      const res = await api.get(`/attendance/history?limit=365&startDate=${startDate}`);
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

  // Generate 365 days of data for the calendar
  const calendarData = useMemo(() => {
    const data = [];
    const d = new Date();
    d.setDate(d.getDate() - 365);
    
    for (let i = 0; i <= 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const attended = fullHistory?.some(h => h.date.startsWith(dateStr));
      data.push({
        date: dateStr,
        count: attended ? 1 : 0,
        level: attended ? 4 : 0 // Level 4 is max intensity (dark green)
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [fullHistory]);

  const explicitTheme = {
    light: ['#ebedf0', '#39d353'],
    dark: ['#2d333b', '#39d353'],
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">
            Welcome back, {user?.displayName.split(' ')[0]}!
          </h1>
          <p className="text-surface-600 mt-1">Here's your summary for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsPopover />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Activity Calendar */}
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Attendance Activity</CardTitle>
          <CardDescription>{user?.attendanceCount || 0} days active in the last year</CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 min-w-max flex justify-center">
          <ActivityCalendar
            data={calendarData}
            theme={explicitTheme}
            colorScheme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
            labels={{
              totalCount: '{{count}} attendance days in the last year',
            }}
            blockSize={14}
            blockMargin={5}
            fontSize={14}
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions / Arbpay */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Keep up your momentum</CardDescription>
          </CardHeader>
          <div className="flex-1 flex flex-col gap-3">
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200 border border-surface-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-500 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="font-medium text-surface-800">Register on Walletpay</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setArbpayUrl('https://arbpay.cc/#/register?code=AR4TEBT')}>Register</Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200 border border-surface-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-info-500/20 text-info-500 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="font-medium text-surface-800">Open Walletpay</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setArbpayUrl('https://arbpay.cc')}>Open App</Button>
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

      {/* Arbpay Iframe Modal */}
      {arbpayUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="bg-surface-50 w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-100">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-surface-900">Walletpay Portal</h2>
                <a href={arbpayUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline">
                  (Open in new tab)
                </a>
              </div>
              <button 
                onClick={() => setArbpayUrl(null)}
                className="p-2 rounded-lg hover:bg-surface-200 text-surface-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-surface-200 relative">
              <iframe 
                src={arbpayUrl} 
                className="w-full h-full border-0"
                title="Walletpay"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
