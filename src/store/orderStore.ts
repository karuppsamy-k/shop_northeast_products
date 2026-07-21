import { create } from 'zustand';
import type { Order } from '../models/Order';
import { OrderService } from '../services/order.service';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Order) => Promise<void>;
  fetchOrders: (userId: string) => Promise<void>;
  subscribeToOrders: (userId: string) => () => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  (set) => ({
    orders: [],
    isLoading: false,
    addOrder: async (orderData) => {
      set({ isLoading: true });
      try {
        await OrderService.createOrder(orderData);
        // Don't add locally — the real-time subscription will pick it up
      } catch (err) {
        console.error("Failed to add order", err);
      } finally {
        set({ isLoading: false });
      }
    },
    fetchOrders: async (userId: string) => {
      set({ isLoading: true });
      try {
        const fetchedOrders = await OrderService.getUserOrders(userId);
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        set({ orders: fetchedOrders });
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        set({ isLoading: false });
      }
    },
    subscribeToOrders: (userId: string) => {
      set({ isLoading: true });
      const unsubscribe = OrderService.subscribeToUserOrders(userId, (fetchedOrders) => {
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        set({ orders: fetchedOrders, isLoading: false });
      });
      return unsubscribe;
    },
    clearOrders: () => set({ orders: [] }),
  })
);
