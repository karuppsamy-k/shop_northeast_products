import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Check, Package, XCircle, Clock, Truck, CheckCircle } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import type { OrderStatus } from '../models/Order';

const fmtDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'Pending': return Clock;
    case 'Processing': return Package;
    case 'Shipped': return Truck;
    case 'Delivered': return CheckCircle;
    case 'Cancelled':
    case 'Rejected': return XCircle;
    default: return Bell;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'Delivered': return '#16a34a';
    case 'Cancelled':
    case 'Rejected': return '#dc2626';
    case 'Pending': return '#eab308';
    case 'Shipped': return '#3b82f6';
    default: return '#f97316'; // Processing
  }
};

export const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.uid);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: 'var(--body-gradient)' }}
    >
      <div className="flex items-center justify-between px-4 py-4 mt-16 mb-2">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors"
          style={{ color: 'var(--color-fg)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-fg)' }}>Notifications</h2>
        {unreadCount > 0 ? (
          <button onClick={handleMarkAllRead} className="p-2 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: 'var(--color-primary-val)' }} title="Mark all as read">
            <Check className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      <div className="px-4 pb-24 max-w-lg mx-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(22,163,74,0.1)' }}>
              <Bell className="w-9 h-9" style={{ color: 'var(--color-primary-val)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-fg)' }}>No notifications yet</h3>
            <p className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>
              We'll let you know when your order status changes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = getStatusIcon(notif.status);
              const iconColor = getStatusColor(notif.status);

              return (
                <div 
                  key={notif.id} 
                  className={`glass-card p-4 transition-all ${!notif.read ? 'border-l-4' : 'opacity-75'}`}
                  style={{ 
                    borderLeftColor: !notif.read ? 'var(--color-primary-val)' : 'transparent',
                    background: !notif.read ? 'rgba(255,255,255,0.65)' : 'var(--glass-card-bg)'
                  }}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      style={{ background: `${iconColor}15`, color: iconColor }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold truncate" style={{ color: 'var(--color-fg)' }}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--color-muted-fg)' }}>
                          {fmtDate(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
