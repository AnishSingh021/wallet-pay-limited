import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, XCircle, Clock, Calendar, Download, CheckSquare } from 'lucide-react';
import api from '../../lib/axios';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

export function AdminAttendance() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Calculate dynamic dates for the API
  const dateParams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const p: any = {};
    if (filterDate === 'today') {
      p.date = today.toISOString();
    } else if (filterDate === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      p.date = y.toISOString();
    } else if (filterDate === 'week') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      p.startDate = w.toISOString();
      p.endDate = today.toISOString();
    } else if (filterDate === 'month') {
      const m = new Date(today);
      m.setMonth(m.getMonth() - 1);
      p.startDate = m.toISOString();
      p.endDate = today.toISOString();
    }
    return p;
  }, [filterDate]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'attendance', dateParams, department, status],
    queryFn: async () => {
      const res = await api.get('/attendance/admin/all', {
        params: { ...dateParams, department, status, limit: 100 }
      });
      return res.data.data;
    }
  });

  const overrideMutation = useMutation({
    mutationFn: async ({ userIds, newStatus }: { userIds: string[], newStatus: string }) => {
      const res = await api.post('/attendance/admin/override', {
        userIds,
        date: dateParams.date || new Date().toISOString(), // bulk fallback
        status: newStatus
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance'] });
      toast.success('Attendance updated successfully.');
      setSelectedIds([]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update attendance.');
    }
  });

  const records = data || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(records.map((r: any) => r.userId._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const markBulk = (newStatus: string) => {
    if (selectedIds.length === 0) return toast.error('No users selected');
    overrideMutation.mutate({ userIds: selectedIds, newStatus });
  };

  // Stats calculation
  const presentCount = records.filter((r: any) => r.status === 'present').length;
  const absentCount = records.filter((r: any) => r.status === 'absent').length;
  const leaveCount = records.filter((r: any) => r.status === 'leave').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Attendance Management</h1>
          <p className="text-surface-500 mt-1">Monitor and manage employee daily check-ins.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-2 bg-gradient-to-br from-success-500/10 to-transparent border-success-500/20">
          <div className="flex items-center gap-2 text-success-600"><CheckCircle2 className="w-5 h-5"/> <span className="font-semibold">Present</span></div>
          <span className="text-3xl font-bold text-surface-900">{presentCount}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-2 bg-gradient-to-br from-danger-500/10 to-transparent border-danger-500/20">
          <div className="flex items-center gap-2 text-danger-600"><XCircle className="w-5 h-5"/> <span className="font-semibold">Absent</span></div>
          <span className="text-3xl font-bold text-surface-900">{absentCount}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-2 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
          <div className="flex items-center gap-2 text-primary-600"><Calendar className="w-5 h-5"/> <span className="font-semibold">Leave</span></div>
          <span className="text-3xl font-bold text-surface-900">{leaveCount}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-2 bg-gradient-to-br from-warning-500/10 to-transparent border-warning-500/20">
          <div className="flex items-center gap-2 text-warning-600"><Clock className="w-5 h-5"/> <span className="font-semibold">Total</span></div>
          <span className="text-3xl font-bold text-surface-900">{records.length}</span>
        </Card>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 p-4 items-center bg-surface-100 border-surface-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <Input 
            className="pl-10" 
            placeholder="Search by name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select className="input min-w-[140px]" value={filterDate} onChange={(e: any) => setFilterDate(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select className="input min-w-[140px]" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Depts</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select className="input min-w-[140px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
        </div>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-primary-600 font-semibold">
            <CheckSquare className="w-5 h-5" />
            <span>{selectedIds.length} users selected</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => markBulk('present')} isLoading={overrideMutation.isPending}>Mark Present</Button>
            <Button size="sm" variant="danger" onClick={() => markBulk('absent')} isLoading={overrideMutation.isPending}>Mark Absent</Button>
            <Button size="sm" variant="secondary" onClick={() => markBulk('leave')} isLoading={overrideMutation.isPending}>Mark Leave</Button>
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={6} rows={5} /></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3">
                    <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500" onChange={handleSelectAll} checked={records.length > 0 && selectedIds.length === records.length} />
                  </th>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Streak</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {records.filter((r: any) => r.userId?.displayName.toLowerCase().includes(search.toLowerCase())).map((record: any) => (
                  <tr key={record._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary-500 focus:ring-primary-500" 
                        checked={selectedIds.includes(record.userId._id)}
                        onChange={() => handleSelectOne(record.userId._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={record.userId.photoURL} name={record.userId.displayName} size="sm" />
                        <div>
                          <p className="font-medium text-surface-900">{record.userId.displayName}</p>
                          <p className="text-xs text-surface-500">{record.userId.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'present' ? (
                        <Badge variant="success">Present</Badge>
                      ) : record.status === 'absent' ? (
                        <Badge variant="danger">Absent</Badge>
                      ) : record.status === 'leave' ? (
                        <Badge variant="primary">Leave</Badge>
                      ) : (
                        <Badge variant="warning">{record.status}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-600 font-bold">
                      {/* We don't have currentStreak directly on the record, but we'd normally pull it. */}
                      -
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-success-600 hover:underline text-xs" onClick={() => { setSelectedIds([record.userId._id]); setTimeout(() => markBulk('present'), 50); }}>Mark P</button>
                        <button className="text-danger-600 hover:underline text-xs" onClick={() => { setSelectedIds([record.userId._id]); setTimeout(() => markBulk('absent'), 50); }}>Mark A</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
