import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2, X } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import type { Product } from '@/models/Product';
import type { Order } from '@/models/Order';
import { compressToWebP, uploadProductImage, getProductImageUrl } from '@/utils/imageHandling';

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

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await FirestoreService.queryDocumentsWithCursor<Order>('orders', [], 50);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await FirestoreService.updateDocument('orders', orderId, { status: newStatus });
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <Card className="glass-card">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-bold">Recent Orders</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell>{order.userId}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="text-right font-bold">₹{order.totalAmount}</TableCell>
              <TableCell className="text-right">
                 <select 
                   value={order.status}
                   onChange={(e) => updateStatus(order.orderId, e.target.value)}
                   className="bg-black/20 text-white rounded p-1 text-sm outline-none border border-white/10"
                 >
                   <option value="Pending">Pending</option>
                   <option value="Processing">Processing</option>
                   <option value="Shipped">Shipped</option>
                   <option value="Delivered">Delivered</option>
                   <option value="Cancelled">Cancelled</option>
                 </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Manage Products</h3>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

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
            {products.map((p) => (
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
                    <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-2 bg-white/10 rounded hover:bg-white/20 transition">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSoftDelete(p)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition">
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
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = product?.imageUrl || '';
      const docId = product?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (imageFile) {
        const webpBlob = await compressToWebP(imageFile);
        imageUrl = await uploadProductImage(webpBlob, formData.category, docId);
      }

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
            <label className="block text-xs font-medium text-foreground/60 mb-1">Image (Auto WebP)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80" />
            {product?.imageUrl && !imageFile && (
              <p className="text-xs text-green-400 mt-2">Current image saved.</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-primary" />
            <label htmlFor="isActive" className="text-sm">Active (Visible to users)</label>
          </div>

          <button disabled={uploading} type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold mt-6 disabled:opacity-50">
            {uploading ? 'Saving & Uploading...' : 'Save Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
