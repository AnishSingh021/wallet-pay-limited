import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, XCircle, Copy, Download, Maximize2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

export function ManagePayments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [qrModal, setQrModal] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const res = await api.get('/users/admin/payments');
      return res.data.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
      const res = await api.put(`/users/${userId}/payment/verify`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast.success('Payment status updated.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadQR = async (qrUrl: string, name: string) => {
    const fullUrl = qrUrl.startsWith('http') ? qrUrl : `http://localhost:5000${qrUrl}`;
    
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${name}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const filteredUsers = (users || []).filter((u: any) => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Payment Management</h1>
          <p className="text-surface-500 mt-1">Verify payment details and process payouts.</p>
        </div>
      </div>

      <Card className="flex items-center gap-4 p-4 bg-surface-100 border-surface-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <Input 
            className="pl-10" 
            placeholder="Search users..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={6} rows={5} /></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Details</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {filteredUsers.map((user: any) => (
                  <tr key={user._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                        <div>
                          <p className="font-medium text-surface-900">{user.displayName}</p>
                          <p className="text-xs text-surface-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.paymentMethod === 'UPI' ? 'primary' : user.paymentMethod === 'BANK' ? 'warning' : 'success'}>
                        {user.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.paymentMethod === 'UPI' && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-surface-900">{user.upiId}</span>
                          <button onClick={() => handleCopy(user.upiId)} className="text-surface-400 hover:text-primary-500 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {user.paymentMethod === 'QR' && user.qrImage && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={user.qrImage.startsWith('http') ? user.qrImage : `http://localhost:5000${user.qrImage}`} 
                            alt="QR" 
                            className="w-10 h-10 object-cover rounded bg-white shadow-sm cursor-pointer" 
                            onClick={() => setQrModal(user.qrImage.startsWith('http') ? user.qrImage : `http://localhost:5000${user.qrImage}`)} 
                          />
                          <button onClick={() => handleDownloadQR(user.qrImage, user.displayName)} className="text-surface-400 hover:text-primary-500 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {user.paymentMethod === 'BANK' && (
                        <div className="text-xs text-surface-600">
                          <p><span className="font-semibold">Acct:</span> {user.accountNumber}</p>
                          <p><span className="font-semibold">IFSC:</span> {user.ifsc}</p>
                          <p><span className="font-semibold">Bank:</span> {user.bankName}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.paymentStatus === 'Verified' ? (
                        <Badge variant="success">Verified</Badge>
                      ) : user.paymentStatus === 'Paid' ? (
                        <Badge variant="primary">Paid</Badge>
                      ) : user.paymentStatus === 'Rejected' ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {user.paymentStatus !== 'Verified' && user.paymentStatus !== 'Paid' && (
                          <Button size="sm" variant="secondary" className="text-success-600 hover:text-success-700 hover:bg-success-50" onClick={() => verifyMutation.mutate({ userId: user._id, status: 'Verified' })} isLoading={verifyMutation.isPending}>
                            Approve
                          </Button>
                        )}
                        {user.paymentStatus === 'Verified' && (
                          <Button size="sm" variant="primary" onClick={() => verifyMutation.mutate({ userId: user._id, status: 'Paid' })} isLoading={verifyMutation.isPending}>
                            Mark Paid
                          </Button>
                        )}
                        {user.paymentStatus !== 'Rejected' && user.paymentStatus !== 'Paid' && (
                          <Button size="sm" variant="ghost" className="text-danger-600 hover:bg-danger-50" onClick={() => verifyMutation.mutate({ userId: user._id, status: 'Rejected' })} isLoading={verifyMutation.isPending}>
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* QR Code Zoom Modal */}
      <AnimatePresence>
        {qrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-2xl shadow-2xl relative max-w-md w-full flex flex-col items-center"
            >
              <button 
                onClick={() => setQrModal(null)}
                className="absolute top-4 right-4 text-surface-400 hover:text-surface-900 bg-surface-100 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-surface-900 mb-4">QR Code</h3>
              <img src={qrModal} alt="Expanded QR" className="w-full max-w-[300px] h-auto rounded-lg shadow-inner border border-surface-200" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
