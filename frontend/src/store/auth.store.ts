import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../lib/types';
import api from '../lib/axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true, // Start loading to check session on mount

      setAuth: (user, token) => set({ 
        user, 
        accessToken: token, 
        isAuthenticated: true 
      }),

      updateUser: (partialUser) => set((state) => ({
        user: state.user ? { ...state.user, ...partialUser } as User : null
      })),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: async () => {
        try {
          // Attempt server logout to clear HttpOnly cookie
          await api.post('/auth/logout');
        } catch (e) {
          console.error('Logout failed on server', e);
        } finally {
          // Always clear local state
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Try to get profile using current token (or relying on refresh token interceptor if expired)
          const res = await api.get('/users/me');
          if (res.data.success) {
            set({ user: res.data.data, isAuthenticated: true });
          } else {
            set({ user: null, accessToken: null, isAuthenticated: false });
          }
        } catch (error) {
          // Token invalid and refresh failed, clear state
          set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'walletpay-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }), // Persist these fields
    }
  )
);
