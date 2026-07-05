import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/models/Product';
import { useToastStore } from '@/store/toastStore';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { showToast } = useToastStore();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
    showToast(`🛒 ${product.name} added to cart!`);
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
      className="bg-white rounded-lg overflow-hidden cursor-pointer flex flex-col"
      style={{
        border: '1px solid #eaeaea',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      }}
    >
      {/* Image Area */}
      <div className="relative flex justify-center items-center pt-3 pb-2" style={{ background: 'var(--color-surface, #f8f9fa)' }}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
        <img
          src={getProductImageUrl(product?.imageUrl, product?.category)}
          alt={product?.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="h-20 w-20 md:h-24 md:w-24 object-contain transition-transform hover:scale-105"
        />
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
        <button
          onClick={handleAdd}
          className="w-full py-1.5 md:py-2 rounded text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 mt-1"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))' }}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </motion.div>
  );
};
