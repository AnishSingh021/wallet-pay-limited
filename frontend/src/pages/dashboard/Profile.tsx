import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/users/me', { displayName, phone });
      if (res.data.success) {
        updateUser(res.data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Profile</h1>
        <p className="text-surface-600 mt-1">Manage your personal information.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your display name and contact info.</CardDescription>
        </CardHeader>
        
        <div className="px-6 pb-6">
          <div className="flex items-center gap-6 mb-8">
            <Avatar name={user?.displayName || ''} src={user?.photoURL} size="xl" />
            <div>
              <p className="font-medium text-surface-900">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={user?.role === 'admin' ? 'primary' : 'neutral'}>
                  {user?.role.toUpperCase()}
                </Badge>
                {user?.isApproved && <Badge variant="success">Approved</Badge>}
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
              message.type === 'success' 
                ? 'bg-success-500/10 border-success-500/20 text-success-600' 
                : 'bg-danger-500/10 border-danger-500/20 text-danger-600'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="pt-4 border-t border-surface-200">
              <Button type="submit" icon={<Save className="w-4 h-4" />} isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
