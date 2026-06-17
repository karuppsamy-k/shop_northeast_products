// Repository pattern for Mock APIs
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import featuredData from '@/data/featuredProducts.json';
import cartData from '@/data/cart.json';
import ordersData from '@/data/orders.json';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage: string;
  productCount: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice: number;
  unit: string;
  weight: number;
  images: string[];
  origin: string;
  farmerOrSource: string;
  ingredients: string[];
  nutritionalInfo: any;
  stock: number;
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export interface FeaturedProduct {
  productId: string;
  priority: number;
  bannerText: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  cartId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED';
  createdAt: string;
}

class ApiRepository {
  async getProducts(): Promise<Product[]> {
    return new Promise(resolve => setTimeout(() => resolve(productsData as Product[]), 500));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const featuredProducts = featuredData.map(fp => {
          const product = (productsData as Product[]).find(p => p.id === fp.productId);
          return product;
        }).filter(p => p !== undefined) as Product[];
        resolve(featuredProducts);
      }, 500);
    });
  }

  async getCategories(): Promise<Category[]> {
    return new Promise(resolve => setTimeout(() => resolve(categoriesData as Category[]), 500));
  }

  async getCart(): Promise<Cart> {
    return new Promise(resolve => setTimeout(() => resolve(cartData as Cart), 500));
  }

  async getOrders(): Promise<Order[]> {
    return new Promise(resolve => setTimeout(() => resolve(ordersData as Order[]), 500));
  }

  async placeOrder(orderData: any): Promise<Order> {
    return new Promise(resolve => {
      setTimeout(() => {
        const order: Order = { 
          orderId: `ord_${Math.floor(1000 + Math.random() * 9000)}`, 
          userId: 'user_001',
          ...orderData, 
          status: 'PLACED', 
          createdAt: new Date().toISOString() 
        };
        resolve(order);
      }, 1000);
    });
  }
}

export const api = new ApiRepository();
