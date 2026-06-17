// Observer pattern for notifications

type Listener = (data: any) => void;

class NotificationService {
  private observers: { [event: string]: Listener[] } = {};

  subscribe(event: string, listener: Listener) {
    if (!this.observers[event]) {
      this.observers[event] = [];
    }
    this.observers[event].push(listener);
    return () => this.unsubscribe(event, listener);
  }

  unsubscribe(event: string, listener: Listener) {
    if (!this.observers[event]) return;
    this.observers[event] = this.observers[event].filter(l => l !== listener);
  }

  notify(event: string, data: any) {
    if (!this.observers[event]) return;
    this.observers[event].forEach(listener => listener(data));
  }
}

export const notificationService = new NotificationService();

// Mock initial subscriptions
notificationService.subscribe('ORDER_PLACED', (order) => {
  console.log(`[Notification] Order ${order.id} placed successfully!`);
  console.log(`[Email Service] Sending email to admin@Sathish.co for order ${order.id}`);
});
