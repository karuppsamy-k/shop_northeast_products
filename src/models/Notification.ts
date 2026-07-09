import type { OrderStatus } from './Order';

export interface AppNotification {
  id: string;
  userId: string;
  orderId: string;
  type: 'order_status';
  title: string;
  message: string;
  status: OrderStatus;
  read: boolean;
  createdAt: string;
}
