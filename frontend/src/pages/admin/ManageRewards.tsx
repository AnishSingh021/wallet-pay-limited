import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import { Gift, Plus } from 'lucide-react';
import api from '../../lib/axios';
import { RewardHistory, User } from '../../lib/types';

export function ManageRewards() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  // New Reward Form State
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    period: '',
    note: ''
  });

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['admin', 'rewards', filterStatus],
    queryFn: async () => {
      const res = await api.get(`/rewards/admin/all${filterStatus ? `?status=${filterStatus}` : ''}`);
      return res.data.data as RewardHistory[];
    },
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['admin', 'users', 'all'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100'); // Assuming limit 100 for dropdown
      return res.data.data as User[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/rewards/admin/create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rewards'] });
      setIsModalOpen(false);
      setFormData({ userId: '', amount: '', period: '', note: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/rewards/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rewards'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Manage Rewards</h1>
          <p className="text-surface-600 mt-1">Create payouts and update reward statuses.</p>
        </div>
        <Button 
          icon={<Plus className="w-5 h-5" />} 
          onClick={() => setIsModalOpen(true)}
        >
          Issue New Reward
        </Button>
      </header>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>All Rewards</CardTitle>
            <CardDescription>Filter by status to manage payouts</CardDescription>
          </div>
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'paid', label: 'Paid' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48"
          />
        </CardHeader>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={6} rows={5} /></div>
          ) : rewards && rewards.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Period</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {rewards.map((reward) => {
                  const user = reward.userId as any;
                  return (
                    <tr key={reward._id} className="hover:bg-surface-150 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user?.displayName || 'Unknown'} src={user?.photoURL} size="sm" />
                          <span className="font-medium text-surface-900">{user?.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-display font-bold text-surface-900">
                        ₹{reward.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-surface-700">{reward.period}</td>
                      <td className="px-6 py-4 text-surface-600">
                        {new Date(reward.awardedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          reward.status === 'paid' ? 'success' : 
                          reward.status === 'processing' ? 'primary' : 
                          reward.status === 'rejected' ? 'danger' : 'warning'
                        }>
                          {reward.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Select
                          size="sm"
                          value={reward.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: reward._id, status: e.target.value })}
                          options={[
                            { value: 'pending', label: 'Set Pending' },
                            { value: 'processing', label: 'Set Processing' },
                            { value: 'paid', label: 'Mark as Paid' },
                            { value: 'rejected', label: 'Reject' },
                          ]}
                          className="w-36 inline-block text-left"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rewards found for the selected filter.</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue New Reward">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Select Member"
            required
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            options={usersResponse ? usersResponse.map(u => ({ value: u._id, label: u.displayName })) : []}
            placeholder="Choose a user..."
          />
          
          <Input
            label="Amount (₹)"
            type="number"
            required
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <Input
            label="Reward Period (e.g. August 2026)"
            required
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          />

          <Input
            label="Note (Optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create Reward</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
