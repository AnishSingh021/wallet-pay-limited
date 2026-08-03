import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import { Search, Users } from 'lucide-react';
import api from '../../lib/axios';
import { User, Pagination } from '../../lib/types';

interface UsersResponse {
  data: User[];
  pagination: Pagination;
}

export function ManageMembers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', debouncedSearch],
    queryFn: async () => {
      const res = await api.get(`/users?search=${debouncedSearch}`);
      return res.data as UsersResponse;
    },
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Manage Members</h1>
          <p className="text-surface-600 mt-1">View and search all registered users.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </header>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={5} rows={5} /></div>
          ) : users.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Streaks (Cur/Max)</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
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
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'admin' ? 'primary' : 'neutral'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {!user.isApproved ? (
                        <Badge variant="warning">Pending</Badge>
                      ) : !user.isActive ? (
                        <Badge variant="danger">Inactive</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-700">
                      <span className="font-medium text-surface-900">{user.currentStreak}</span> / {user.longestStreak}
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-surface-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-surface-700">No members found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
