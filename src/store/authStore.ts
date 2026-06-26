import { create } from 'zustand';
import type { User } from '../models/User';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { getAuthErrorMessage } from '../utils/authErrors';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitializing: boolean; // true while Firebase checks the session on startup
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setInitializing: (val: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.login(email, pass);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (email, pass, data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(email, pass, data);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, isLoggedIn: false, error: null });
    } catch (err) {
      console.error('Logout error', err);
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    // Persist to Firestore, but don't block UI
    FirestoreService.updateDocument('users', currentUser.uid, data).catch(console.error);
    set({ user: updated });
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setInitializing: (val) => set({ isInitializing: val }),
  setError: (error) => set({ error }),
}));
