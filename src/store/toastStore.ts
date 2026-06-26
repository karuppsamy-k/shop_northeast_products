import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  showToast: (msg: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  showToast: (msg) => {
    set({ message: msg, visible: true });
    setTimeout(() => set({ visible: false, message: '' }), 2500);
  },
}));
