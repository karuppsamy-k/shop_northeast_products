import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/models/Product';

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for cart operations (e.g., productId + variantId)
  quantity: number;
  selectedVariant?: ProductVariant;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; tax: number; total: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant) => {
        set((state) => {
          const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
          const existingItem = state.items.find(item => item.cartItemId === cartItemId);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }
          return { items: [...state.items, { ...product, cartItemId, quantity: 1, selectedVariant: variant }] };
        });
      },
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter(item => item.cartItemId !== cartItemId)
        }));
      },
      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter(item => item.quantity > 0)
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((acc, item) => {
          const priceToUse = item.selectedVariant ? item.selectedVariant.finalPrice : (item.finalPrice || item.price);
          return acc + (priceToUse * item.quantity);
        }, 0);
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
