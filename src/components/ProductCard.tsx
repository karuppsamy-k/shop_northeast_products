import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import type { Product } from '@/models/Product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const cartItem = items.find(item => item.id === product.id);
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem(product);
    }
    showToast(`${product.name} added to cart`);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(product.id);
      } else {
        updateQuantity(product.id, cartItem.quantity - 1);
      }
    }
  };

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

  // Removed rating and reviews as requested

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-surface)] rounded-xl overflow-hidden cursor-pointer flex flex-col border border-[var(--color-border)] shadow-sm"
      style={{
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Area */}
      <div className="relative w-full overflow-hidden" style={{ height: '140px', background: 'var(--color-surface, #f8f9fa)' }}>

        <img
          src={getProductImageUrl(product?.imageUrl, product?.category)}
          alt={product?.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-2.5 md:p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-xs md:text-sm line-clamp-2 mb-1" style={{ color: 'var(--color-fg, #111)' }}>
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-1.5 mb-2 mt-auto">
          <span className="text-sm md:text-base font-bold" style={{ color: 'var(--color-primary-val, #7a9d54)' }}>
            ₹{product.finalPrice}
          </span>
          {product.offer && product.offer > 0 && (
            <span className="text-[10px] md:text-xs line-through" style={{ color: 'var(--color-muted-fg, #999)' }}>
              ₹{product.price}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-1">
          {isOutOfStock ? (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full py-1.5 md:py-2 rounded text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
              style={{ background: 'var(--color-muted-fg)' }}
            >
              Out of Stock
            </button>
          ) : cartItem ? (
            <div className="w-full py-1 md:py-1.5 flex items-center justify-between border rounded px-2" style={{ borderColor: 'var(--color-primary-val)' }}>
              <button onClick={handleDecrease} className="p-0.5 hover:bg-gray-100 rounded transition-colors" style={{ color: 'var(--color-primary-val)' }}>
                <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <span className="font-bold text-xs md:text-sm" style={{ color: 'var(--color-fg)' }}>{cartItem.quantity}</span>
              <button onClick={handleIncrease} className="p-0.5 hover:bg-gray-100 rounded transition-colors" style={{ color: 'var(--color-primary-val)' }}>
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-1.5 md:py-2 rounded text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))' }}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
