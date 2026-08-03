import React, { useEffect } from 'react';
import { useThemeStore } from '../store/theme.store';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './ui/Button';

export function ThemeToggle() {
  const { mode, setMode, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let isDark = false;
      if (mode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = mode === 'dark';
      }
      
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        setResolvedTheme('dark');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    applyTheme();

    const listener = () => {
      if (mode === 'system') applyTheme();
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode, setResolvedTheme]);

  const cycleTheme = () => {
    if (mode === 'dark') setMode('light');
    else if (mode === 'light') setMode('system');
    else setMode('dark');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={cycleTheme}
      className="w-9 h-9 p-0 rounded-full"
      title={`Current theme: ${mode}`}
    >
      {mode === 'dark' && <Moon className="w-5 h-5 text-primary-400" />}
      {mode === 'light' && <Sun className="w-5 h-5 text-warning-500" />}
      {mode === 'system' && <Monitor className="w-5 h-5 text-surface-500" />}
    </Button>
  );
}
