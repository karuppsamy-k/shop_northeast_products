import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2, X, Check, Filter } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { NotificationService } from '@/services/notification.service';
import type { Product } from '@/models/Product';
import type { Order, OrderStatus } from '@/models/Order';
import { compressToBase64, getProductImageUrl } from '@/utils/imageHandling';
import TopBar from './components/TopBar';

type Tab = 'dashboard' | 'orders' | 'products' | 'users';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">Sathish</h1>
          <p className="text-xs text-foreground/50">Admin Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-white/5'}`}
          >
            <TrendingUp className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-white/5'}`}
          >
            <ShoppingBag className="w-5 h-5" /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-white/5'}`}
          >
            <Package className="w-5 h-5" /> Products
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-sm text-primary tracking-wider uppercase font-semibold mb-1">Administrative Overview</h2>
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
          </div>
        </div>

        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'products' && <ProductsManager />}
      </main>
    </div>
  );
};

// --- Sub Components ---

const DashboardOverview = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      { label: 'Total Revenue', value: '₹--', trend: '...' },
      { label: 'Total Orders', value: '--', trend: '...' },
      { label: 'Active Users', value: '--', trend: '...' },
      { label: 'Products', value: '--', trend: '...' },
    ].map((stat, i) => (
      <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-foreground/60 mb-2">{stat.label}</p>
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            <p className="text-xs mt-2 text-foreground/50">{stat.trend}</p>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';

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
    <Card className="border border-white/5 overflow-hidden" style={{ background: '#121420', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
        <h3 className="text-xl font-bold text-white">Recent Orders</h3>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-black/30 rounded-xl border border-white/5">
          {['All', 'Pending', 'Delivery', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/20 border-b border-white/10">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium py-4">Order ID</TableHead>
              <TableHead className="text-gray-400 font-medium py-4">Customer</TableHead>
              <TableHead className="text-gray-400 font-medium py-4">Location</TableHead>
              <TableHead className="text-gray-400 font-medium py-4">Date</TableHead>
              <TableHead className="text-gray-400 font-medium py-4">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-medium py-4">Total</TableHead>
              <TableHead className="text-right text-gray-400 font-medium py-4 pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No {activeTab.toLowerCase()} orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.status === 'Pending';
                const isDelivered = order.status === 'Delivered';
                const isRejected = order.status === 'Cancelled' || order.status === 'Rejected';
                
                return (
                  <TableRow key={order.orderId} className="border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== 'SELECT') {
                      setSelectedOrder(order);
                    }
                  }}>
                    <TableCell className="font-medium text-gray-300 py-4">{order.orderId}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="truncate max-w-[150px] font-medium text-sm text-white" title={users[order.userId]?.name || order.userId}>
                        {users[order.userId]?.name || order.userId}
                      </div>
                      <div className="truncate max-w-[150px] text-xs text-gray-500" title={users[order.userId]?.phone || users[order.userId]?.email || ''}>
                        {users[order.userId]?.phone || users[order.userId]?.email || ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      <div className="truncate max-w-[150px] text-xs" title={order.deliveryAddress}>
                        {order.deliveryAddress || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDelivered ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        isRejected ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        isPending ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-200">
                      ₹{order.totalAmount}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.orderId, e.target.value)}
                        className="bg-black/30 text-gray-300 rounded-lg py-1.5 px-3 text-sm outline-none border border-white/10 hover:border-white/20 transition-colors cursor-pointer appearance-none"
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

      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderId}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Customer Info</h3>
                <p className="font-medium text-white">{users[selectedOrder.userId]?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-400 mt-1">{users[selectedOrder.userId]?.email || 'No email'}</p>
                <p className="text-sm text-gray-400">{users[selectedOrder.userId]?.phone || 'No phone'}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">{selectedOrder.userId}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Delivery Info</h3>
                <p className="text-sm text-white break-words">{selectedOrder.deliveryAddress || 'No address provided'}</p>
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedOrder.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    selectedOrder.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider font-semibold">Items ({selectedOrder.items?.length || 0})</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-400 font-medium">Total Amount</span>
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

export const ProductsManager = () => {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>();
  const sidebarOpen = context?.sidebarOpen || false;
  const setSidebarOpen = context?.setSidebarOpen || (() => {});

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);
      const res = await FirestoreService.queryDocumentsWithCursor<Product>('products', [], 20, reset ? undefined : (lastDocId || undefined));
      
      if (reset) {
        setProducts(res.data);
      } else {
        setProducts(prev => [...prev, ...res.data]);
      }
      setLastDocId(res.lastDocId);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const handleSoftDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to ${product.isActive ? 'deactivate' : 'activate'} this product?`)) return;
    try {
      await FirestoreService.updateDocument('products', product.id, { isActive: !product.isActive });
      setProducts(products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleHardDelete = async (product: Product) => {
    if (!confirm(`WARNING: This will permanently delete "${product.name}" from the database. This action cannot be undone. Are you sure?`)) return;
    try {
      await FirestoreService.deleteDocument('products', product.id);
      setProducts(products.filter(p => p.id !== product.id));
    } catch (err) {
      console.error(err);
      alert('Failed to permanently delete product');
    }
  };

  return (
    <>
      <TopBar
        title="Products"
        subtitle="Admin Portal"
        onMenuClick={() => setSidebarOpen(true)}
        isSidebarOpen={sidebarOpen}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 absolute left-3 text-foreground/50 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-foreground appearance-none cursor-pointer hover:bg-white/10 transition-colors min-w-[160px]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="all">All Categories</option>
                {[...new Set(products.map(p => p.category))].sort().map(cat => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        }
      />

      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Offer %</TableHead>
              <TableHead>Final Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <img src={getProductImageUrl(p.imageUrl, p.category)} alt={p.name} className="w-10 h-10 object-cover rounded" loading="lazy" />
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="capitalize">{p.category}</TableCell>
                <TableCell>₹{p.price}</TableCell>
                <TableCell>{p.offer ? `${p.offer}%` : '-'}</TableCell>
                <TableCell className="font-bold">₹{p.finalPrice}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-2 bg-white/10 rounded hover:bg-white/20 transition" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSoftDelete(p)} className={`p-2 rounded transition ${p.isActive ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`} title={p.isActive ? 'Deactivate' : 'Activate'}>
                      {p.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleHardDelete(p)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition" title="Delete Permanently">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {lastDocId && (
          <div className="p-4 flex justify-center border-t border-white/10">
            <button onClick={() => fetchProducts(false)} disabled={loading} className="px-4 py-2 bg-white/5 rounded-xl text-sm font-medium hover:bg-white/10 transition">
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </Card>

      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchProducts(true); }}
        />
      )}
    </>
  );
};

const ProductModal = ({ product, onClose, onSave }: { product: Product | null, onClose: () => void, onSave: () => void }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'handicrafts',
    price: product?.price || 0,
    offer: product?.offer || 0,
    isActive: product?.isActive ?? true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    try {
      let imageUrl = product?.imageUrl || '';
      const docId = product?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (imageFile) {
        setStatusMsg('Compressing image...');
        // Compress to base64 and store directly in Firestore — no upload step needed
        imageUrl = await compressToBase64(imageFile);
      }

      setStatusMsg('Saving...');
      const offerVal = formData.offer || null;
      const finalPrice = offerVal ? formData.price - (formData.price * (offerVal / 100)) : formData.price;

      const productData: Product = {
        id: docId,
        name: formData.name,
        price: Number(formData.price),
        offer: offerVal ? Number(offerVal) : null,
        finalPrice: Math.round(Number(finalPrice)),
        category: formData.category,
        imageUrl,
        isActive: formData.isActive,
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await FirestoreService.setDocument('products', docId, productData);
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setUploading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1">Price (₹)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1">Offer (%)</label>
              <input type="number" value={formData.offer} onChange={e => setFormData({...formData, offer: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">Category</label>
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary capitalize">
              <option value="handicrafts">Handicrafts</option>
              <option value="textiles">Textiles</option>
              <option value="food">Food</option>
              <option value="tea">Tea</option>
              <option value="spices">Spices</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80" />
            {previewUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                <span className="text-xs text-gray-400">{imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB → will be compressed` : 'Current image'}</span>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{statusMsg}</span>
                {uploadProgress > 0 && <span>{uploadProgress}%</span>}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                  style={{ width: statusMsg === 'Compressing image...' ? '20%' : `${Math.max(uploadProgress, 5)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-primary" />
            <label htmlFor="isActive" className="text-sm">Active (Visible to users)</label>
          </div>

          <button disabled={uploading} type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold mt-6 disabled:opacity-50 transition-opacity">
            {uploading ? statusMsg || 'Processing...' : 'Save Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
