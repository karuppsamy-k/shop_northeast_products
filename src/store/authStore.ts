import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  avatar: string;
  address?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, username: string, password: string, phone: string, address?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,

      login: async (email, password) => {
        // Simulate async auth
        await new Promise((r) => setTimeout(r, 600));
        if (email && password.length >= 6) {
          set({
            isLoggedIn: true,
            user: {
              name: 'Aditya Sharma',
              email,
              username: email.split('@')[0],
              phone: '+91 9876543210',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            },
          });
          return true;
        }
        return false;
      },

      signup: async (name, email, username, password, phone, address) => {
        await new Promise((r) => setTimeout(r, 600));
        if (name && email && password.length >= 6) {
          set({
            isLoggedIn: true,
            user: {
              name,
              email,
              username,
              phone,
              address,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            },
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isLoggedIn: false, user: null });
      },

      updateProfile: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
