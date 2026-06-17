import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/services/api';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; tax: number; total: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter(item => item.quantity > 0)
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((acc, item) => acc + (item.discountPrice * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax mock
        return {
          subtotal,
          tax,
          total: subtotal + tax
        };
      }
    }),
    {
      name: 'heritage-cart-storage',
    }
  )
);
