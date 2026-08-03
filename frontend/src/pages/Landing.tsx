import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, CheckCircle2, Shield, Zap, Gift } from 'lucide-react';

export function Landing() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-100px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -z-10 animate-pulse-glow delay-2" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-200 border border-surface-300 text-sm font-medium text-surface-700 mb-4">
            <span className="flex w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Wallet Pay Internal Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-surface-900 leading-tight">
            Reward Your <span className="text-gradient-primary">Consistency</span>
          </h1>
          
          <p className="text-xl text-surface-600 max-w-2xl mx-auto">
            The exclusive employee platform for attendance tracking and community announcements. Build streaks, earn rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" iconRight={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
                Join the Platform
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-100 border-t border-surface-300 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-display font-bold text-surface-900">Everything you need to thrive</h2>
            <p className="mt-4 text-lg text-surface-600">Built exclusively for our internal team.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-warning-500" />,
                title: 'Attendance Streaks',
                description: 'Mark your daily attendance and build streaks. Consistency unlocks special bonuses.'
              },
              {
                icon: <Gift className="w-6 h-6 text-primary-500" />,
                title: 'Cash Rewards',
                description: 'Earn real cash rewards based on your performance and attendance. Track payouts easily.'
              },
              {
                icon: <Shield className="w-6 h-6 text-success-500" />,
                title: 'Secure & Private',
                description: 'Invite-only platform. Admins verify every registration to ensure a secure community.'
              }
            ].map((feature, i) => (
              <div key={i} className={`glass p-8 rounded-2xl flex flex-col gap-4 animate-fade-in-up delay-${i + 1}`}>
                <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center border border-surface-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-surface-900">{feature.title}</h3>
                <p className="text-surface-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
