export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  image?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveryPartner?: string;
  trackingStatus?: string;
}
