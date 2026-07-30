export interface Product {
  id: string;
  name: string;
  price: number;
  offer: number | null; // discount %
  finalPrice: number; // computed: price - (price * (offer / 100))
  category: string;
  subCategory?: string;
  imageUrl: string;
  isActive: boolean;
  stockQuantity?: number; // Added stock quantity
  unit?: string;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  variants?: ProductVariant[]; // Optional size/quantity variants
}

export interface ProductVariant {
  id: string;
  label: string; // e.g. "100gm", "Mashed 200gm"
  price: number;
  offer: number | null;
  finalPrice: number;
}
