import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Shield, Zap, Gift } from 'lucide-react';
import { IntroAnimation } from '../components/intro/IntroAnimation';
import { HeroReveal } from '../components/intro/HeroReveal';
import { motion } from 'framer-motion';

export function Landing() {
  const [showIntro, setShowIntro] = useState(() => {
    // Force play intro in development for previewing:
    // const hasSeenIntro = localStorage.getItem('hasSeenIntro_walletPay');
    // return !hasSeenIntro;
    return true; 
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro_walletPay', 'true');
    window.dispatchEvent(new Event('introComplete'));
  };

  const isRevealed = !showIntro;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <HeroReveal show={isRevealed}>
        <div className="flex flex-col min-h-[calc(100vh-64px-100px)]">
          {/* Hero Section */}
          <section className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
            {/* Background Gradients moving forever */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -z-10 animate-pulse-glow" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -z-10 animate-pulse-glow delay-2" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
            
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-200 border border-surface-300 text-sm font-medium text-surface-700 mb-4">
                <span className="flex w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                Wallet Pay Internal Platform
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-surface-900 leading-tight">
                Reward Your <span className="text-gradient-primary">Consistency</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-surface-600 max-w-2xl mx-auto">
                The exclusive employee platform for attendance tracking and community announcements. Build streaks, earn rewards.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/signup" className="w-full sm:w-auto hover:-translate-y-1 transition-transform duration-300">
                  <Button size="lg" iconRight={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto shadow-lg shadow-primary-500/25">
                    Join the Platform
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto hover:-translate-y-1 transition-transform duration-300">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Member Login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-surface-100 border-t border-surface-300 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-3xl font-display font-bold text-surface-900">Everything you need to thrive</h2>
                <p className="mt-4 text-lg text-surface-600">Built exclusively for our internal team.</p>
              </motion.div>

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
                  <motion.div key={i} variants={itemVariants} className={`glass p-8 rounded-2xl flex flex-col gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/20`}>
                    <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center border border-surface-300 shadow-inner">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-surface-900">{feature.title}</h3>
                    <p className="text-surface-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </HeroReveal>
    </>
  );
}
