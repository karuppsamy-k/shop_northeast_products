import { FirestoreService } from './firestore.service';
import type { AppNotification } from '../models/Notification';
import { where, onSnapshot, collection, query, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const NotificationService = {
  async createNotification(notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fullData: AppNotification = {
      ...notificationData,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await FirestoreService.setDocument('notifications', id, fullData);
  },

  subscribeToUserNotifications(userId: string, callback: (notifications: AppNotification[]) => void): () => void {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => doc.data() as AppNotification);
      callback(fetched);
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    await FirestoreService.updateDocument('notifications', notificationId, { read: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.update(document.ref, { read: true });
      });
      
      await batch.commit();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }
};
