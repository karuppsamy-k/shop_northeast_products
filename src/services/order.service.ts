import { FirestoreService } from './firestore.service';
import type { Order } from '../models/Order';
import { where } from 'firebase/firestore';

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
  }
};
