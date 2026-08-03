import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  // Computed effective theme (resolved 'system' preference)
  resolvedTheme: 'light' | 'dark';
  setResolvedTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark', // Default to dark theme as requested
      resolvedTheme: 'dark',
      
      setMode: (mode) => {
        set({ mode });
      },
      
      setResolvedTheme: (theme) => {
        set({ resolvedTheme: theme });
      }
    }),
    {
      name: 'walletpay-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode }), // Only persist user preference
    }
  )
);
