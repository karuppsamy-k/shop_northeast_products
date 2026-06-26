import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './cartStore';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Processing' | 'Delivered' | 'Cancelled';
  customerName: string;
  address: string;
  location?: { lat: number; lng: number };
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          status: 'Processing',
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
      },
      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'order-storage' }
  )
);
