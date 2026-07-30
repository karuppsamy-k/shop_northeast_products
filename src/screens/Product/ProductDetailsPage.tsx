import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Loader2, Tag, ShieldCheck, RefreshCw, Plus, Minus } from 'lucide-react';
import { FirestoreService } from '../../services/firestore.service';
import type { Product, ProductVariant } from '../../models/Product';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';

export const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const cartItemId = product ? (selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id) : undefined;
  const cartItem = cartItemId ? items.find(item => item.cartItemId === cartItemId) : undefined;
  
  const isOutOfStock = product ? (product.stockQuantity ?? 0) <= 0 : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await FirestoreService.getDocument<Product>('products', id);
        setProduct(data);
        if (data && data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--color-primary-val)' }} />
        <p className="font-medium" style={{ color: 'var(--color-muted-fg)' }}>Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <p className="font-medium mb-4" style={{ color: 'var(--color-muted-fg)' }}>Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-full text-white font-bold"
          style={{ background: 'var(--color-primary-val)' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const getProductImageUrl = (imageUrl?: string, category?: string) => {
    if (imageUrl && imageUrl.trim() !== '') return imageUrl;
    const cat = category?.toLowerCase() || '';
    const defaults: Record<string, string> = {
      "handicrafts": "/defaults/handicrafts.webp",
      "textiles": "/defaults/textiles.webp",
      "food": "/defaults/food.webp",
      "tea": "/defaults/tea.webp",
      "spices": "/defaults/spices.webp",
      "default": "/defaults/generic-product.webp"
    };
    return defaults[cat] || defaults['default'];
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, selectedVariant || undefined);
      showToast(`${selectedVariant ? selectedVariant.label + ' ' : ''}${product.name} added to cart`);
    }
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(cartItem.cartItemId);
      } else {
        updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
      }
    }
  };

  const currentFinalPrice = selectedVariant ? selectedVariant.finalPrice : product?.finalPrice;
  const currentOriginalPrice = selectedVariant ? selectedVariant.price : product?.price;
  const currentOffer = selectedVariant ? selectedVariant.offer : product?.offer;

  return (
    <div className="pb-6 pt-2 md:pt-8" style={{ background: 'var(--body-gradient, var(--color-background))' }}>
      <div className="max-w-6xl mx-auto px-3 md:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold mb-4 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-fg)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Section */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-auto flex items-center justify-center p-0 md:p-6" style={{ background: 'var(--color-surface)' }}>
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={getProductImageUrl(product.imageUrl, product.category)}
                alt={product.name}
                className="w-full h-full object-cover md:object-contain md:max-h-[500px]"
              />
              {currentOffer && currentOffer > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> {currentOffer}% OFF
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-4 md:p-10 flex flex-col">
              
              <div className="mb-2">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: 'var(--color-surface)', color: 'var(--color-primary-val)', border: '1px solid var(--color-border)' }}>
                  {product.category}
                </span>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-fg)' }}
              >
                {product.name}
              </motion.h1>

              {product.unit && (
                <p className="text-xs md:text-sm font-medium mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                  Unit: {product.unit}
                </p>
              )}

              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-fg)' }}>Size: <span style={{ color: 'var(--color-muted-fg)' }}>{selectedVariant?.label}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          selectedVariant?.id === v.id
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted-fg)] hover:border-[var(--color-fg)] hover:text-[var(--color-fg)]'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary-val)' }}>
                  ₹{currentFinalPrice}
                </span>
                {currentOffer && currentOffer > 0 && (
                  <span className="text-base md:text-lg line-through" style={{ color: 'var(--color-muted-fg)' }}>
                    ₹{currentOriginalPrice}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mb-5">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>Description</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-fg)' }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary-val)' }} />
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: 'var(--color-fg)' }}>100% Authentic</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-fg)' }}>Quality Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <RefreshCw className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary-val)' }} />
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: 'var(--color-fg)' }}>Fresh Produce</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-fg)' }}>Direct from source</p>
                  </div>
                </div>
              </div>

              {/* Add to cart action */}
              <div className="mt-auto pt-3">
                {isOutOfStock ? (
                  <div className="w-full py-3.5 md:py-4 rounded-2xl text-white font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2 opacity-60 cursor-not-allowed" style={{ background: 'var(--color-muted-fg)' }}>
                    Out of Stock
                  </div>
                ) : cartItem ? (
                  <div className="w-full py-2 px-4 rounded-2xl flex items-center justify-between shadow-lg" style={{ border: '2px solid var(--color-primary-val)', background: 'var(--color-surface)' }}>
                    <button onClick={handleDecrease} className="p-2 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--color-primary-val)' }}>
                      <Minus className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <span className="font-bold text-lg md:text-xl" style={{ color: 'var(--color-fg)' }}>{cartItem.quantity}</span>
                    <button onClick={handleIncrease} className="p-2 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--color-primary-val)' }}>
                      <Plus className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-3.5 md:py-4 rounded-2xl text-white font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))' }}
                  >
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                    Add to Cart
                  </motion.button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
