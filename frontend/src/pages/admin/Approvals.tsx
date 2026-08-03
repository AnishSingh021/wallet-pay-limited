import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Check, X, ShieldAlert } from 'lucide-react';
import api from '../../lib/axios';
import { User, Pagination } from '../../lib/types';

interface UsersResponse {
  data: User[];
  pagination: Pagination;
}

export function ApprovalsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: async () => {
      const res = await api.get('/users?isApproved=false');
      return res.data as UsersResponse;
    },
  });

  const users = data?.data || [];

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/users/${userId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Pending Approvals</h1>
        <p className="text-surface-600 mt-1">Review and approve new member registrations.</p>
      </header>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={4} rows={3} /></div>
          ) : users.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Applicant</th>
                  <th className="px-6 py-3 font-semibold">Date Applied</th>
                  <th className="px-6 py-3 font-semibold">Referral Code Used</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.displayName} src={user.photoURL} size="sm" />
                        <div>
                          <p className="font-medium text-surface-900">{user.displayName}</p>
                          <p className="text-xs text-surface-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.referredBy ? (
                        <span className="font-mono bg-surface-200 px-2 py-1 rounded text-surface-700 text-xs">
                          {user.referredBy}
                        </span>
                      ) : (
                        <span className="text-surface-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger-500 hover:text-danger-600 hover:bg-danger-500/10"
                          icon={<X className="w-4 h-4" />}
                          isLoading={rejectMutation.isPending && rejectMutation.variables === user._id}
                          onClick={() => rejectMutation.mutate(user._id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Check className="w-4 h-4" />}
                          isLoading={approveMutation.isPending && approveMutation.variables === user._id}
                          onClick={() => approveMutation.mutate(user._id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-surface-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50 text-success-500" />
              <p className="text-lg font-medium text-surface-700">All caught up!</p>
              <p className="text-sm mt-1">There are no pending registrations.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
