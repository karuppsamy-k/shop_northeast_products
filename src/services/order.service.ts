import { FirestoreService } from './firestore.service';
import type { Order } from '../models/Order';
import { where, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../firebase/config';

export const OrderService = {
  async createOrder(orderData: Order): Promise<void> {
    await FirestoreService.setDocument('orders', orderData.orderId, orderData);
  },
  
  async getUserOrders(userId: string): Promise<Order[]> {
    return await FirestoreService.queryDocuments<Order>('orders', [
      where('userId', '==', userId),
      // To use orderBy you might need a composite index in Firestore, 
      // so we'll just sort them client-side to avoid index errors for the user immediately.
    ]);
  },

  subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => doc.data() as Order);
      callback(fetchedOrders);
    }, (error) => {
      console.error("Error listening to user orders:", error);
    });
  }
};
