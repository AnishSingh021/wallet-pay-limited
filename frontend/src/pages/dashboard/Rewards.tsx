import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Gift, Wallet, IndianRupee, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { RewardHistory } from '../../lib/types';

interface RewardsResponse {
  data: RewardHistory[];
  summary: Record<string, { total: number; count: number }>;
}

export function RewardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['rewards', 'history'],
    queryFn: async () => {
      const res = await api.get('/rewards/history');
      return res.data as RewardsResponse;
    },
  });

  const rewards = data?.data || [];
  const summary = data?.summary || {};
  
  const totalPaid = summary['paid']?.total || 0;
  const totalPending = (summary['pending']?.total || 0) + (summary['processing']?.total || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Rewards</h1>
        <p className="text-surface-600 mt-1">Track your earnings and payout history.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover padding="lg" className="flex items-center gap-5 bg-gradient-to-br from-success-500/10 to-transparent border-success-500/20">
          <div className="w-16 h-16 rounded-2xl bg-success-500 text-white flex items-center justify-center shadow-lg shadow-success-500/30">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Total Paid Out</p>
            <p className="text-4xl font-display font-bold text-surface-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card hover padding="lg" className="flex items-center gap-5 bg-gradient-to-br from-warning-500/10 to-transparent border-warning-500/20">
          <div className="w-16 h-16 rounded-2xl bg-warning-500 text-white flex items-center justify-center shadow-lg shadow-warning-500/30">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-surface-600 font-medium">Pending Processing</p>
            <p className="text-4xl font-display font-bold text-surface-900">₹{totalPending.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Complete log of your rewards</CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={4} rows={4} /></div>
          ) : rewards.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Period</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {rewards.map((reward) => (
                  <tr key={reward._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4 text-surface-600">
                      {new Date(reward.awardedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-surface-900">
                      {reward.period}
                    </td>
                    <td className="px-6 py-4 font-display font-bold text-surface-900">
                      ₹{reward.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {reward.status === 'paid' ? (
                        <Badge variant="success">Paid</Badge>
                      ) : reward.status === 'processing' ? (
                        <Badge variant="primary">Processing</Badge>
                      ) : reward.status === 'rejected' ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      {reward.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rewards history yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
