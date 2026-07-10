export interface Product {
  id: string;
  name: string;
  price: number;
  offer: number | null; // discount %
  finalPrice: number; // computed: price - (price * (offer / 100))
  category: string;
  imageUrl: string;
  isActive: boolean;
  unit?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
