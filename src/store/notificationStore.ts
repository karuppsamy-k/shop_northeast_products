import { create } from 'zustand';
import type { AppNotification } from '../models/Notification';
import { NotificationService } from '../services/notification.service';
import { useToastStore } from './toastStore';
import { showSystemNotification } from '../utils/pushNotifications';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  subscribeToNotifications: (userId: string) => () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  subscribeToNotifications: (userId: string) => {
    set({ isLoading: true });
    let isInitialLoad = true;

    const unsubscribe = NotificationService.subscribeToUserNotifications(userId, (fetched) => {
      // Sort descending by date
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const unreadCount = fetched.filter(n => !n.read).length;
      
      if (!isInitialLoad) {
        const currentNotifications = get().notifications;
        const currentIds = new Set(currentNotifications.map(n => n.id));
        const newNotifications = fetched.filter(n => !currentIds.has(n.id) && !n.read);
        
        if (newNotifications.length > 0) {
          const latest = newNotifications[0];
          useToastStore.getState().showToast(`${latest.title}: ${latest.message}`);
          showSystemNotification(latest.title, latest.message);
        }
      }
      
      isInitialLoad = false;
      
      set({ 
        notifications: fetched, 
        unreadCount,
        isLoading: false 
      });
    });
    return unsubscribe;
  },

  markAsRead: async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // State updates automatically via subscription
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await NotificationService.markAllAsRead(userId);
      // State updates automatically via subscription
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
