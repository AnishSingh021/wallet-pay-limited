import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, UploadCloud, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export function PaymentDetails() {
  const { user, refreshUser } = useAuthStore();
  const [method, setMethod] = useState<'NONE' | 'UPI' | 'QR' | 'BANK'>(user?.paymentMethod || 'NONE');
  
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [ifsc, setIfsc] = useState(user?.ifsc || '');
  const [accountHolder, setAccountHolder] = useState(user?.accountHolder || '');
  
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>(user?.qrImage || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = user?.paymentStatus || 'None';

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      setMethod(user.paymentMethod || 'NONE');
      setUpiId(user.upiId || '');
      setBankName(user.bankName || '');
      setAccountNumber(user.accountNumber || '');
      setIfsc(user.ifsc || '');
      setAccountHolder(user.accountHolder || '');
      setQrPreview(user.qrImage || '');
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalQrImage = qrPreview;

      // Upload QR if there's a new file
      if (method === 'QR' && qrFile) {
        const formData = new FormData();
        formData.append('photo', qrFile);
        const uploadRes = await api.post('/payment/upload-qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data.success) {
          finalQrImage = uploadRes.data.data.qrImage;
        }
      }

      const payload = {
        paymentMethod: method,
        upiId,
        bankName,
        accountNumber,
        ifsc,
        accountHolder,
        qrImage: finalQrImage
      };

      const res = await api.put('/users/me/payment', payload);
      if (res.data.success) {
        toast.success('Payment details saved successfully!');
        await refreshUser(); // refresh user context
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save payment details');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatus = () => {
    if (status === 'Verified') {
      return (
        <div className="flex items-center gap-2 p-4 bg-success-500/10 text-success-600 rounded-xl border border-success-500/20">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Your payment details are verified and ready for payouts.</p>
        </div>
      );
    }
    if (status === 'Paid') {
      return (
        <div className="flex items-center gap-2 p-4 bg-primary-500/10 text-primary-600 rounded-xl border border-primary-500/20">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Your payout has been processed successfully.</p>
        </div>
      );
    }
    if (status === 'Pending') {
      return (
        <div className="flex items-center gap-2 p-4 bg-warning-500/10 text-warning-600 rounded-xl border border-warning-500/20">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <p className="text-sm font-medium">Your details are pending admin verification.</p>
        </div>
      );
    }
    if (status === 'Rejected') {
      return (
        <div className="flex items-center gap-2 p-4 bg-danger-500/10 text-danger-600 rounded-xl border border-danger-500/20">
          <XCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Your details were rejected. Please update them.</p>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-4 bg-surface-200 text-surface-600 rounded-xl border border-surface-300">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm font-medium">Please add your payment details to receive rewards.</p>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Payment Details</h1>
          <p className="text-surface-500 mt-1">Manage how you receive your rewards.</p>
        </div>
      </div>

      {renderStatus()}

      <form onSubmit={handleSave} className="glass p-6 md:p-8 rounded-2xl border border-surface-300 space-y-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-4">
          <label className="text-sm font-semibold text-surface-900">Select Payment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['UPI', 'QR', 'BANK'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  method === m 
                    ? 'border-primary-500 bg-primary-500/5 text-primary-600' 
                    : 'border-surface-200 bg-surface-100 text-surface-600 hover:border-surface-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="font-medium">{m === 'BANK' ? 'Bank Account' : m === 'QR' ? 'QR Code' : 'UPI ID'}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === 'UPI' && (
            <motion.div key="upi" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <Input
                label="UPI ID"
                placeholder="e.g. username@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </motion.div>
          )}

          {method === 'QR' && (
            <motion.div key="qr" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <label className="text-sm font-semibold text-surface-900 block mb-2">Upload Payment QR Code</label>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  qrPreview ? 'border-primary-500 bg-primary-500/5' : 'border-surface-300 hover:border-primary-500/50'
                }`}
              >
                {qrPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img 
                      src={
                        qrPreview.startsWith('blob:') || qrPreview.startsWith('http')
                          ? qrPreview 
                          : `http://localhost:5000${qrPreview}`
                      } 
                      alt="QR Preview" 
                      className="w-48 h-48 object-contain rounded-lg shadow-md bg-white p-2" 
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-10 h-10 text-surface-400" />
                    <p className="text-surface-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-surface-400 text-xs">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileSelect}
                />
              </div>
            </motion.div>
          )}

          {method === 'BANK' && (
            <motion.div key="bank" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Account Holder Name" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required />
              <Input label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
              <Input label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
              <Input label="IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} required />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-surface-200 flex justify-end">
          <Button type="submit" isLoading={isSaving} disabled={method === 'NONE' || isSaving}>
            Save Details
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
