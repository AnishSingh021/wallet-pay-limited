import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.accessToken);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Your account is pending admin approval.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-surface-900">Welcome Back</h1>
          <p className="text-surface-600 mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-5 h-5" />}
            placeholder="you@example.com"
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-5 h-5" />}
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-surface-600 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-500 hover:text-primary-600">
            Apply now
          </Link>
        </p>
      </Card>
    </div>
  );
}
