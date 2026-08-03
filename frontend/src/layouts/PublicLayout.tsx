import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Wallet, Menu } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PublicLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <header className="sticky top-0 z-40 glass w-full border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-display font-bold text-surface-900 tracking-tight">
                Wallet Pay
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">Home</Link>
              <Link to="/documents" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">Resources</Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                {!isLoginPage && (
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                )}
                {!isSignupPage && (
                  <Link to="/signup">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                )}
              </div>
              <Button variant="ghost" size="sm" className="md:hidden p-1.5">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-surface-200 py-8 bg-surface-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-500" />
            <span className="font-display font-semibold text-surface-800">Wallet Pay</span>
          </div>
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} Wallet Pay Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
