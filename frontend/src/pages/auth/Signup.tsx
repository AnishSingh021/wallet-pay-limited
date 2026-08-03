import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';

export function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center animate-scale-in" padding="lg">
          <div className="w-16 h-16 bg-success-500/20 text-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-surface-900 mb-2">Registration Complete</h2>
          <p className="text-surface-600 mb-8">
            Your account has been created and is pending admin approval. You will be able to log in once an admin approves your account.
          </p>
          <Button fullWidth onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md animate-scale-in" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-surface-900">Create Account</h1>
          <p className="text-surface-600 mt-2">Join the Wallet Pay community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            icon={<User className="w-5 h-5" />}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            icon={<Mail className="w-5 h-5" />}
            placeholder="you@example.com"
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone className="w-5 h-5" />}
            placeholder="+1 234 567 8900"
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            icon={<Lock className="w-5 h-5" />}
            placeholder="••••••••"
            hint="Must be at least 6 characters long."
          />



          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-4">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-surface-600 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
