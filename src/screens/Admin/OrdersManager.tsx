import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { X } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { NotificationService } from '@/services/notification.service';
import type { Order, OrderStatus } from '@/models/Order';
import TopBar from './components/TopBar';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion } from 'framer-motion';

export const OrdersManager = () => {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>();
  const sidebarOpen = context?.sidebarOpen || false;
  const setSidebarOpen = context?.setSidebarOpen || (() => {});

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Delivery' | 'Rejected'>('All');

  const [users, setUsers] = useState<Record<string, any>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch orders realtime:", error);
      setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userMap: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        userMap[doc.id] = doc.data();
      });
      setUsers(userMap);
    });

    return () => {
      unsubscribe();
      unsubUsers();
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await FirestoreService.updateDocument('orders', orderId, { status: newStatus });
      
      const order = orders.find(o => o.orderId === orderId);
      if (order) {
        await NotificationService.createNotification({
          userId: order.userId,
          orderId: order.orderId,
          status: newStatus as OrderStatus,
          type: 'order_status',
          title: `Order ${newStatus}`,
          message: `Your order #${orderId} is now ${newStatus}.`
        });
      }
      // The onSnapshot listener will automatically update the local state
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return order.status === 'Pending';
    if (activeTab === 'Delivery') return order.status === 'Delivered' || order.status === 'Shipped';
    if (activeTab === 'Rejected') return order.status === 'Cancelled' || order.status === 'Rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title="Orders"
        subtitle="Admin Portal"
        onMenuClick={() => setSidebarOpen(true)}
        isSidebarOpen={sidebarOpen}
      />
    <Card className="border-[var(--color-border)] overflow-hidden" style={{ background: 'var(--color-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-surface)]">
        <h3 className="text-xl font-bold text-[var(--color-fg)]">Recent Orders</h3>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-black/10 dark:bg-black/30 rounded-xl border border-[var(--color-border)]">
          {['All', 'Pending', 'Delivery', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/5 dark:bg-black/20 border-b border-[var(--color-border)]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Order ID</TableHead>
              <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Customer</TableHead>
              <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Location</TableHead>
              <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Date</TableHead>
              <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Status</TableHead>
              <TableHead className="text-right text-[var(--color-muted-fg)] font-medium py-4">Total</TableHead>
              <TableHead className="text-right text-[var(--color-muted-fg)] font-medium py-4 pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-[var(--color-muted-fg)]">
                  No {activeTab.toLowerCase()} orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.status === 'Pending';
                const isDelivered = order.status === 'Delivered';
                const isRejected = order.status === 'Cancelled' || order.status === 'Rejected';
                
                return (
                  <TableRow key={order.orderId} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== 'SELECT') {
                      setSelectedOrder(order);
                    }
                  }}>
                    <TableCell className="font-medium text-[var(--color-fg)] py-4">{order.orderId}</TableCell>
                    <TableCell className="text-[var(--color-fg)]">
                      <div className="truncate max-w-[150px] font-medium text-sm text-[var(--color-fg)]" title={users[order.userId]?.name || order.userId}>
                        {users[order.userId]?.name || order.userId}
                      </div>
                      <div className="truncate max-w-[150px] text-xs text-[var(--color-muted-fg)]" title={users[order.userId]?.phone || users[order.userId]?.email || ''}>
                        {users[order.userId]?.phone || users[order.userId]?.email || ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-fg)]">
                      <div className="truncate max-w-[150px] text-xs" title={order.deliveryAddress}>
                        {order.deliveryAddress || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-muted-fg)] text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDelivered ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        isRejected ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        isPending ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[var(--color-fg)]">
                      ₹{order.totalAmount}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.orderId, e.target.value)}
                        className="bg-black/5 dark:bg-black/30 text-[var(--color-fg)] rounded-lg py-1.5 px-3 text-sm outline-none border border-[var(--color-border)] hover:border-[var(--color-muted)] transition-colors cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.7rem top 50%',
                          backgroundSize: '0.65rem auto',
                          paddingRight: '2rem'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-4 p-4 min-h-[400px]">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-muted-fg)]">
            No {activeTab.toLowerCase()} orders found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPending = order.status === 'Pending';
            const isDelivered = order.status === 'Delivered';
            const isRejected = order.status === 'Cancelled' || order.status === 'Rejected';
            
            return (
              <div 
                key={order.orderId} 
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col shadow-sm relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[var(--color-fg)] text-sm">{order.orderId}</h3>
                    <p className="text-xs text-[var(--color-muted-fg)] mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    isDelivered ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                    isRejected ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    isPending ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 mb-4">
                  <p className="font-medium text-[var(--color-fg)] text-sm">{users[order.userId]?.name || order.userId}</p>
                  <p className="text-xs text-[var(--color-muted-fg)] truncate max-w-full">{order.deliveryAddress || 'N/A'}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
                  <p className="font-bold text-[var(--color-fg)] text-lg">₹{order.totalAmount}</p>
                  <select 
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); updateStatus(order.orderId, e.target.value); }}
                    className="bg-black/5 dark:bg-black/30 text-[var(--color-fg)] rounded-lg py-1.5 px-3 text-xs outline-none border border-[var(--color-border)] hover:border-[var(--color-muted)] transition-colors cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem top 50%',
                      backgroundSize: '0.65rem auto',
                      paddingRight: '1.5rem'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-fg)]">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-fg)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex flex-col gap-4 mb-6">
              <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <h3 className="text-sm text-[var(--color-muted-fg)] mb-2 uppercase tracking-wider font-semibold">Customer Info</h3>
                <p className="font-medium text-[var(--color-fg)]">{users[selectedOrder.userId]?.name || 'Unknown User'}</p>
                <p className="text-sm text-[var(--color-muted-fg)] mt-1">{users[selectedOrder.userId]?.email || 'No email'}</p>
                <p className="text-sm text-[var(--color-muted-fg)]">{users[selectedOrder.userId]?.phone || 'No phone'}</p>
              </div>
              <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <h3 className="text-sm text-[var(--color-muted-fg)] mb-2 uppercase tracking-wider font-semibold">Delivery Info</h3>
                <p className="text-sm text-[var(--color-fg)] break-words mb-3">{selectedOrder.deliveryAddress || 'No address provided'}</p>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedOrder.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                  selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  selectedOrder.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-sm text-[var(--color-muted-fg)] mb-4 uppercase tracking-wider font-semibold">Items ({selectedOrder.items?.length || 0})</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-black/5 dark:bg-black/20 p-3 rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="text-sm font-medium text-[var(--color-fg)]">{item.name}</p>
                        <p className="text-xs text-[var(--color-muted-fg)]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-fg)]">₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                <span className="text-[var(--color-muted-fg)] font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary">₹{selectedOrder.totalAmount ? selectedOrder.totalAmount.toFixed(0) : '0'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Card>
    </>
  );
};
