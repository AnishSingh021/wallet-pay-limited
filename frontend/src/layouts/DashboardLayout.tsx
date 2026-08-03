import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ThemeToggle } from '../components/ThemeToggle';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Gift, 
  Bell, 
  FileText, 
  LogOut,
  Wallet,
  Menu,
  Shield,
  User as UserIcon,
  X
} from 'lucide-react';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const memberNav = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Attendance', href: '/app/attendance', icon: CalendarCheck },
    { name: 'Referrals', href: '/app/referrals', icon: Users },
    { name: 'Rewards', href: '/app/rewards', icon: Gift },
    { name: 'Announcements', href: '/app/announcements', icon: Bell },
    { name: 'Profile', href: '/app/profile', icon: UserIcon },
  ];

  const adminNav = [
    { name: 'Admin Hub', href: '/admin', icon: Shield },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Approvals', href: '/admin/approvals', icon: CalendarCheck },
    { name: 'Manage Rewards', href: '/admin/rewards', icon: Gift },
    { name: 'Announcements', href: '/admin/announcements', icon: Bell },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
  ];

  const navItems = isAdmin && location.pathname.startsWith('/admin') ? adminNav : memberNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden glass sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b border-surface-300">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary-500" />
          <span className="font-display font-bold text-surface-900">Wallet Pay</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-surface-100 border-r border-surface-300
          transform transition-transform duration-300 ease-smooth
          md:relative md:translate-x-0
          flex flex-col
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-surface-300">
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-surface-900 tracking-tight">Wallet Pay</span>
          </Link>
          <button className="md:hidden text-surface-500" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <Avatar name={user?.displayName || 'User'} src={user?.photoURL} size="md" status="online" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-surface-900 truncate">{user?.displayName}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3 flex gap-2">
              <Link to="/app" className="flex-1">
                <Button variant={location.pathname.startsWith('/admin') ? 'secondary' : 'primary'} size="sm" fullWidth>Member</Button>
              </Link>
              <Link to="/admin" className="flex-1">
                <Button variant={location.pathname.startsWith('/admin') ? 'primary' : 'secondary'} size="sm" fullWidth>Admin</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/app' && item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' 
                    : 'text-surface-600 hover:bg-surface-200 hover:text-surface-900'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-surface-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-300 space-y-2">
          <div className="hidden md:flex justify-end mb-2">
            <ThemeToggle />
          </div>
          <Button variant="ghost" fullWidth icon={<LogOut className="w-4 h-4" />} onClick={handleLogout} className="justify-start text-danger-500 hover:text-danger-600 hover:bg-danger-500/10">
            Log Out
          </Button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
