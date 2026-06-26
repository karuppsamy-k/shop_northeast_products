import { create } from 'zustand';
import type { User } from '../models/User';
import { AuthService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
  
  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.login(email, pass);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },
  
  register: async (email, pass, data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(email, pass, data);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },
  
  logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, isLoggedIn: false });
    } catch (err: any) {
      console.error('Logout error', err);
    }
  },
  
  updateProfile: async (data: Partial<User>) => {
    // We can just implement a simple local update for now, or call FirestoreService
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    }));
  },
  
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setError: (error) => set({ error })
}));
