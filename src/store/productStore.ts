import { create } from 'zustand';
import type { Product } from '@/models/Product';
import { FirestoreService } from '@/services/firestore.service';

interface ProductState {
  products: Product[];
  lastDocId: string | null;
  hasMore: boolean;
  loading: boolean;
  initialized: boolean;
  fetchInitialProducts: () => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  lastDocId: null,
  hasMore: true,
  loading: false,
  initialized: false,

  fetchInitialProducts: async () => {
    if (get().initialized) return; // Cache hit, avoid re-fetch

    set({ loading: true });
    try {
      // Fetch all products — no complex query = no index needed
      const { data, lastDocId } = await FirestoreService.queryDocumentsWithCursor<Product>(
        'products',
        [],   // no Firestore-side filters; avoids index requirement
        400
      );

      // Filter active products client-side
      const active = data.filter((p: Product) => p.isActive !== false);

      set({
        products: active,
        lastDocId,
        hasMore: data.length === 400,
        initialized: true,
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({ loading: false });
    }
  },

  fetchMoreProducts: async () => {
    const { lastDocId, hasMore, loading, products } = get();
    if (!hasMore || loading) return;

    set({ loading: true });
    try {
      const res = await FirestoreService.queryDocumentsWithCursor<Product>(
        'products',
        [],
        400,
        lastDocId || undefined
      );

      const active = res.data.filter((p: Product) => p.isActive !== false);

      set({
        products: [...products, ...active],
        lastDocId: res.lastDocId,
        hasMore: res.data.length === 400,
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch more products:", error);
      set({ loading: false });
    }
  }
}));
