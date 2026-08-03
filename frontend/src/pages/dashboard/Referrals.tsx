import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Users, Copy, CheckCircle2, UserPlus } from 'lucide-react';
import api from '../../lib/axios';
import { Referral } from '../../lib/types';

interface MyCodeResponse {
  referralCode: string;
  stats: {
    totalReferred: number;
    activeCount: number;
    pendingCount: number;
  };
}

export function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  // Fetch Stats & Code
  const { data: codeData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referrals', 'my-code'],
    queryFn: async () => {
      const res = await api.get('/referrals/my-code');
      return res.data.data as MyCodeResponse;
    },
  });

  // Fetch History
  const { data: referrals, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['referrals', 'list'],
    queryFn: async () => {
      const res = await api.get('/referrals/list');
      return res.data.data as Referral[];
    },
  });

  const handleCopyCode = () => {
    if (codeData?.referralCode) {
      navigator.clipboard.writeText(codeData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Referrals</h1>
        <p className="text-surface-600 mt-1">Invite colleagues and track your referral bonuses.</p>
      </header>

      {/* Your Code Section */}
      <Card padding="lg" className="bg-gradient-to-br from-primary-900 to-accent-900 border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-lg font-semibold mb-1">Your Referral Code</h2>
            <p className="text-primary-100 text-sm">Share this code with new members during registration.</p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 p-2 pl-6 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="font-mono text-xl font-bold tracking-wider text-white">
              {isLoadingStats ? 'Loading...' : codeData?.referralCode}
            </span>
            <Button
              variant="accent"
              onClick={handleCopyCode}
              icon={copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover padding="lg" className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-surface-200 text-surface-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Total Referred</p>
            <p className="text-3xl font-display font-bold text-surface-900">{codeData?.stats.totalReferred || 0}</p>
          </div>
        </Card>
        
        <Card hover padding="lg" className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-success-500/15 text-success-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Active (Approved)</p>
            <p className="text-3xl font-display font-bold text-surface-900">{codeData?.stats.activeCount || 0}</p>
          </div>
        </Card>

        <Card hover padding="lg" className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-warning-500/15 text-warning-500 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Pending Approval</p>
            <p className="text-3xl font-display font-bold text-surface-900">{codeData?.stats.pendingCount || 0}</p>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referred Members</CardTitle>
          <CardDescription>List of users who registered using your code</CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto">
          {isLoadingHistory ? (
            <div className="p-4"><SkeletonTable cols={4} rows={3} /></div>
          ) : referrals && referrals.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Date Joined</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {referrals.map((ref) => {
                  // If populated referredId exists, use it for avatar name
                  const referredUser = ref.referredId as any;
                  const name = referredUser?.displayName || ref.referredName;
                  const photo = referredUser?.photoURL;

                  return (
                    <tr key={ref._id} className="hover:bg-surface-150 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} src={photo} size="sm" />
                          <span className="font-medium text-surface-900">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-surface-600">
                        {ref.referredEmail}
                      </td>
                      <td className="px-6 py-4 text-surface-600">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {ref.status === 'active' ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>You haven't referred anyone yet.</p>
              <p className="text-sm mt-1">Share your code to get started!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
