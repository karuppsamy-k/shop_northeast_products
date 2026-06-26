export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  storeId: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}
