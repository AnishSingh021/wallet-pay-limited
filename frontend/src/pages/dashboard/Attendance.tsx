import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Select } from '../../components/ui/Select';
import { CalendarCheck, Flame, Zap, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/auth.store';
import { Attendance } from '../../lib/types';

export function AttendancePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  // Date filters
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Fetch Attendance History
  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance', month, year],
    queryFn: async () => {
      const res = await api.get(`/attendance/history?month=${month}&year=${year}&limit=31`);
      return res.data.data as Attendance[];
    },
  });

  // Mark Attendance Mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/attendance/mark');
      return res.data.data;
    },
    onSuccess: (data) => {
      // Update local user stats for streaks
      updateUser({
        attendanceCount: data.stats.attendanceCount,
        currentStreak: data.stats.currentStreak,
        longestStreak: data.stats.longestStreak,
      });
      // Refresh current month's attendance view
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to mark attendance.');
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const isMarkedToday = records?.some((r) => r.date.split('T')[0] === today);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));
  const years = [
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Attendance</h1>
          <p className="text-surface-600 mt-1">Mark your daily presence and track streaks.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}

      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover padding="lg" className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-warning-500/15 text-warning-500 flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Current Streak</p>
            <p className="text-4xl font-display font-bold text-surface-900">{user?.currentStreak || 0} <span className="text-xl font-normal text-surface-500">days</span></p>
          </div>
        </Card>
        
        <Card hover padding="lg" className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Total Days Present</p>
            <p className="text-4xl font-display font-bold text-surface-900">{user?.attendanceCount || 0}</p>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your records for the selected month</CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              options={months}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full sm:w-32"
            />
            <Select
              options={years}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full sm:w-28"
            />
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={3} rows={5} /></div>
          ) : records && records.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Time Marked</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4 font-medium text-surface-900">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'present' ? (
                        <Badge variant="success">Present</Badge>
                      ) : record.status === 'absent' ? (
                        <Badge variant="danger">Absent</Badge>
                      ) : (
                        <Badge variant="warning">Leave</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No attendance records found for this month.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
