import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Plus, Edit, Trash2, X, Check, Filter, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import type { Product } from '@/models/Product';
import { compressToBase64, getProductImageUrl } from '@/utils/imageHandling';
import TopBar from './components/TopBar';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase/config';
import { collection, getDocs, where, query, limit, startAfter, getDoc, doc } from 'firebase/firestore';

// ─── ProductsManager ──────────────────────────────────────────────────────────
export const ProductsManager = () => {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>();
  const sidebarOpen = context?.sidebarOpen || false;
  const setSidebarOpen = context?.setSidebarOpen || (() => {});

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ── All categories (fetched once) ──
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Filters ──
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ── Pagination ──
  const PAGE_SIZE = 10;
  // Stack of cursor doc-IDs; index 0 = null (first page), index N = cursor for page N
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // ─── Step 1: fetch all unique categories once on mount ────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const snap = await getDocs(collection(db, 'products'));
        const catSet = new Set<string>();
        snap.forEach(d => {
          const cat = d.data().category;
          if (cat) catSet.add(cat);
        });
        setAllCategories(Array.from(catSet).sort());
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ─── Step 2: fetch products page ─────────────────────────────────────────
  const fetchPage = useCallback(async (cursorDocId: string | null, categoryFilter: string) => {
    setLoading(true);
    try {
      const colRef = collection(db, 'products');
      let constraints: any[] = [];

      if (categoryFilter !== 'all') {
        constraints.push(where('category', '==', categoryFilter));
      }

      let q;
      if (cursorDocId) {
        const cursorSnap = await getDoc(doc(db, 'products', cursorDocId));
        if (cursorSnap.exists()) {
          q = query(colRef, ...constraints, startAfter(cursorSnap), limit(PAGE_SIZE));
        } else {
          q = query(colRef, ...constraints, limit(PAGE_SIZE));
        }
      } else {
        q = query(colRef, ...constraints, limit(PAGE_SIZE));
      }

      const snap = await getDocs(q);
      const data: Product[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

      setProducts(data);
      setHasMore(data.length === PAGE_SIZE);

      return snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : null;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to page 0 whenever category changes
  useEffect(() => {
    setCursors([null]);
    setCurrentPage(0);
    fetchPage(null, selectedCategory).then(lastId => {
      setCursors([null, lastId]);
    });
  }, [selectedCategory, fetchPage]);

  // ─── Pagination handlers ──────────────────────────────────────────────────
  const handleNextPage = async () => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    const cursor = cursors[nextPage] ?? null;
    const lastId = await fetchPage(cursor, selectedCategory);
    setCurrentPage(nextPage);
    // Append cursor for page after next if not already stored
    setCursors(prev => {
      const updated = [...prev];
      if (!updated[nextPage + 1]) updated[nextPage + 1] = lastId;
      return updated;
    });
  };

  const handlePrevPage = async () => {
    if (currentPage === 0 || loading) return;
    const prevPage = currentPage - 1;
    const cursor = cursors[prevPage] ?? null;
    await fetchPage(cursor, selectedCategory);
    setCurrentPage(prevPage);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────
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
    if (!confirm(`WARNING: This will permanently delete "${product.name}". Are you sure?`)) return;
    try {
      await FirestoreService.deleteDocument('products', product.id);
      setProducts(products.filter(p => p.id !== product.id));
      // Refresh categories after delete
      const snap = await getDocs(collection(db, 'products'));
      const catSet = new Set<string>();
      snap.forEach(d => { const cat = d.data().category; if (cat) catSet.add(cat); });
      setAllCategories(Array.from(catSet).sort());
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <TopBar
        title="Products"
        subtitle="Admin Portal"
        onMenuClick={() => setSidebarOpen(true)}
        isSidebarOpen={sidebarOpen}
        actions={
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        }
      />

      {/* ── Category Chips ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <Filter className="w-5 h-5 text-[var(--color-muted-fg)] ml-2 shrink-0" />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 pr-2 w-full">
            {/* All chip */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
              }`}
            >
              All
            </button>

            {/* Loading skeleton chips */}
            {categoriesLoading && (
              [1,2,3,4,5].map(i => (
                <div key={i} className="px-10 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] animate-pulse shrink-0 h-8 w-24" />
              ))
            )}

            {/* Real category chips */}
            {!categoriesLoading && allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 capitalize ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {cat.split('-').join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products List ── */}
      <Card className="border-[var(--color-border)] overflow-hidden" style={{ background: 'var(--color-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        {/* ── Desktop View (Table) ── */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-black/5 dark:bg-black/20 border-b border-[var(--color-border)]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Image</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Name</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Category</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Price</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Offer %</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Final Price</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Stock</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium">Status</TableHead>
                <TableHead className="text-right text-[var(--color-muted-fg)] font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center text-[var(--color-muted-fg)]">
                    No products found{selectedCategory !== 'all' ? ` in "${selectedCategory.split('-').join(' ')}"` : ''}.
                  </TableCell>
                </TableRow>
              ) : (
                products.map(p => (
                  <TableRow key={p.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors">
                    <TableCell>
                      <img src={getProductImageUrl(p.imageUrl, p.category)} alt={p.name} className="w-10 h-10 object-cover rounded bg-[var(--color-surface)]" loading="lazy" />
                    </TableCell>
                    <TableCell className="font-medium text-[var(--color-fg)]">{p.name}</TableCell>
                    <TableCell className="capitalize text-[var(--color-muted-fg)]">{p.category.split('-').join(' ')}</TableCell>
                    <TableCell className="text-[var(--color-fg)]">₹{p.price}</TableCell>
                    <TableCell className="text-[var(--color-muted-fg)]">{p.offer ? `${p.offer}%` : '-'}</TableCell>
                    <TableCell className="font-bold text-[var(--color-fg)]">₹{p.finalPrice}</TableCell>
                    <TableCell className="text-[var(--color-fg)]">{p.stockQuantity ?? 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-2 text-[var(--color-muted-fg)] hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleSoftDelete(p)} className={`p-2 rounded transition ${p.isActive ? 'text-yellow-600 hover:bg-yellow-500/10' : 'text-green-600 hover:bg-green-500/10'}`} title={p.isActive ? 'Deactivate' : 'Activate'}>
                          {p.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleHardDelete(p)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition" title="Delete Permanently">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile View (Cards) ── */}
        <div className="md:hidden flex flex-col gap-4 p-4 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-muted-fg)]">
              No products found{selectedCategory !== 'all' ? ` in "${selectedCategory.split('-').join(' ')}"` : ''}.
            </div>
          ) : (
            products.map(p => (
              <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-black/5 flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                    <img src={getProductImageUrl(p.imageUrl, p.category)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[var(--color-fg)] text-base leading-tight truncate">{p.name}</h3>
                      <span className="shrink-0 text-blue-500 mt-0.5" title="Verified Product">
                        <BadgeCheck className="w-4 h-4" />
                      </span>
                    </div>
                    
                    <p className="text-sm text-[var(--color-muted-fg)] mt-1 capitalize">
                      {p.category.split('-').join(' ')} • ₹{p.price}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-semibold text-[var(--color-fg)]">₹{p.finalPrice}</span>
                      {p.offer ? <span className="text-xs text-[var(--color-muted-fg)] line-through">₹{p.price}</span> : null}
                      <span className="ml-2 text-xs text-[var(--color-muted-fg)]">Stock: {p.stockQuantity ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5 w-full">
                  <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-fg)] py-2.5 rounded-xl text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                    Edit
                  </button>
                  <button onClick={() => handleSoftDelete(p)} className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-fg)] py-2.5 rounded-xl text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                    {p.isActive ? 'Block' : 'Activate'}
                  </button>
                  <button onClick={() => handleHardDelete(p)} className="w-11 shrink-0 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-red-500 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination Controls ── */}
        <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
          <span className="text-sm text-[var(--color-muted-fg)]">
            Page {currentPage + 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0 || loading}
              className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-fg)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || loading}
              className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-fg)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              setShowModal(false);
              // Re-fetch categories in case a new one was added
              const snap = await getDocs(collection(db, 'products'));
              const catSet = new Set<string>();
              snap.forEach(d => { const cat = d.data().category; if (cat) catSet.add(cat); });
              setAllCategories(Array.from(catSet).sort());
              // Reload current page
              await fetchPage(cursors[currentPage] ?? null, selectedCategory);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── ProductModal ─────────────────────────────────────────────────────────────
const KNOWN_CATEGORIES = [
  'beverages', 'candy', 'food', 'handicrafts', 'noodles', 'rice', 'sauces', 'snacks', 'spices', 'tea', 'textiles'
];

const ProductModal = ({ product, onClose, onSave }: { product: Product | null, onClose: () => void, onSave: () => void }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || KNOWN_CATEGORIES[0],
    price: product?.price || 0,
    offer: product?.offer || 0,
    stockQuantity: product?.stockQuantity ?? 0,
    description: product?.description || '',
    isActive: product?.isActive ?? true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = product?.imageUrl || '';
      const docId = product?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (imageFile) {
        setStatusMsg('Compressing image...');
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
        stockQuantity: Number(formData.stockQuantity),
        category: formData.category,
        description: formData.description,
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
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--color-fg)]">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[var(--color-fg)] transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary resize-y" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Price (₹)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Offer (%)</label>
              <input type="number" value={formData.offer} onChange={e => setFormData({...formData, offer: Number(e.target.value)})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Stock</label>
              <input required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Category</label>
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary capitalize appearance-none">
              {KNOWN_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.split('-').join(' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-fg)] mb-1">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-xl p-3 outline-none focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 transition-opacity" />
            {previewUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)] bg-black/10" />
                <span className="text-xs text-[var(--color-muted-fg)]">{imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB → will be compressed` : 'Current image'}</span>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="text-xs text-[var(--color-muted-fg)]">{statusMsg}</div>
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-primary animate-pulse w-1/2" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-primary" />
            <label htmlFor="isActive" className="text-sm text-[var(--color-fg)]">Active (Visible to users)</label>
          </div>

          <button disabled={uploading} type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold mt-6 disabled:opacity-50 transition-opacity">
            {uploading ? statusMsg || 'Processing...' : 'Save Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
