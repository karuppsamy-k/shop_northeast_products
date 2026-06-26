import { create } from 'zustand';
import type { Order } from '../models/Order';
import { OrderService } from '../services/order.service';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Order) => Promise<void>;
  fetchOrders: (userId: string) => Promise<void>;
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
        set((state) => ({ 
          orders: [orderData, ...state.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
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
        // Sort descending by date
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        set({ orders: fetchedOrders });
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        set({ isLoading: false });
      }
    },
    clearOrders: () => set({ orders: [] }),
  })
);
