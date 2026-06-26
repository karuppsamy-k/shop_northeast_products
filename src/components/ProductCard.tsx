import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: any) => void;
}

const cardColors = [
  'from-red-400 to-red-500',
  'from-orange-400 to-orange-500',
  'from-green-400 to-green-500',
  'from-purple-400 to-purple-500',
  'from-yellow-400 to-yellow-500',
  'from-blue-400 to-blue-500',
  'from-pink-400 to-pink-500',
  'from-teal-400 to-teal-500',
];

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const colorIndex = product.id.charCodeAt(product.id.length - 1) % cardColors.length;
  const cardColor = cardColors[colorIndex];
  const discount = product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const { showToast } = useToastStore();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
    showToast(`🛒 ${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-card-bg)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-[var(--color-border-val)]"
    >
      {/* Colored image area */}
      <div className={`relative bg-gradient-to-br ${cardColor} p-3 pt-4 flex justify-center items-center`} style={{ minHeight: '140px' }}>
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-white text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {discount}% OFF
          </div>
        )}
        <img
          src={product?.images?.[0] || ''}
          alt={product?.name || 'Product'}
          className="h-24 w-24 object-contain drop-shadow-lg"
        />
      </div>

      {/* Info area */}
      <div className="p-3">
        <p className="text-[10px] text-[var(--color-muted-fg)] mb-0.5 uppercase tracking-wide font-medium">{product.unit}</p>
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug mb-2" style={{ color: 'var(--color-fg)', minHeight: '2.5rem' }}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-base font-bold" style={{ color: 'var(--color-primary-val)' }}>
              ₹{product.discountPrice.toFixed(0)}
            </span>
            {discount > 0 && (
              <span className="text-[10px] line-through ml-1" style={{ color: 'var(--color-muted-fg)' }}>
                ₹{product.price.toFixed(0)}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform"
            style={{ background: 'var(--color-primary-val)' }}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
