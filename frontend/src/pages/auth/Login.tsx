import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, AlertCircle, Phone } from 'lucide-react';
import api from '../../lib/axios';

import { getAuth, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from '../../lib/firebase';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const from = location.state?.from?.pathname || '/app';
  const auth = getAuth(app);

  const handleFirebaseToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/firebase', { idToken });
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.accessToken);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Your account is pending admin approval.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await handleFirebaseToken(token);
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      setupRecaptcha();
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`; // default IN
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError('');
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      await handleFirebaseToken(token);
    } catch (err: any) {
      setError('Invalid OTP code.');
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

        <div id="recaptcha-container"></div>

        {!phoneMode ? (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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

        <div className="mt-6 flex items-center justify-between">
          <div className="w-full h-px bg-surface-200"></div>
          <span className="px-4 text-sm text-surface-500 whitespace-nowrap">Or continue with</span>
          <div className="w-full h-px bg-surface-200"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={handleGoogleLogin} type="button" disabled={isLoading}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
          <Button variant="secondary" onClick={() => setPhoneMode(true)} type="button" disabled={isLoading}>
            <Phone className="w-5 h-5 mr-2" />
            Phone
          </Button>
        </div>
        </>
        ) : (
          <div className="space-y-5">
            {!confirmationResult ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  icon={<Phone className="w-5 h-5" />}
                  placeholder="+91 9876543210"
                />
                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Send OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <Input
                  label="Enter OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="123456"
                />
                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Verify OTP
                </Button>
              </form>
            )}
            <Button variant="ghost" fullWidth onClick={() => { setPhoneMode(false); setConfirmationResult(null); }} type="button" disabled={isLoading}>
              Back to Email Login
            </Button>
          </div>
        )}

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
