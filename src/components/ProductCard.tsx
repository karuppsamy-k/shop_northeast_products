import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/services/api';
import { useToastStore } from '@/store/toastStore';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: any) => void;
}

const cardGradients = [
  'linear-gradient(135deg, hsl(270,70%,82%), hsl(200,80%,82%))',
  'linear-gradient(135deg, hsl(25,90%,82%), hsl(45,90%,82%))',
  'linear-gradient(135deg, hsl(163,65%,78%), hsl(200,70%,80%))',
  'linear-gradient(135deg, hsl(300,65%,82%), hsl(270,75%,82%))',
  'linear-gradient(135deg, hsl(40,90%,80%), hsl(20,85%,80%))',
  'linear-gradient(135deg, hsl(200,80%,80%), hsl(240,75%,82%))',
  'linear-gradient(135deg, hsl(340,70%,82%), hsl(300,68%,82%))',
  'linear-gradient(135deg, hsl(163,65%,78%), hsl(40,80%,80%))',
];

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const colorIndex = product.id.charCodeAt(product.id.length - 1) % cardGradients.length;
  const cardGradient = cardGradients[colorIndex];
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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="glass-card overflow-hidden cursor-pointer"
      style={{
        background: 'var(--glass-card-bg)',
        backdropFilter: 'blur(20px) saturate(1.7)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.7)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-card-shadow)',
      }}
    >
      {/* Iridescent image area */}
      <div
        className="relative flex justify-center items-center overflow-hidden"
        style={{ minHeight: '140px', background: cardGradient }}
      >
        {/* Top shimmer highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          }}
        />
        {/* Glassy sheen overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.12) 100%)',
          }}
        />

        {discount > 0 && (
          <div
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
            style={{
              background: 'rgba(0,0,0,0.28)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            {discount}% OFF
          </div>
        )}
        <img
          src={product?.images?.[0] || ''}
          alt={product?.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="h-24 w-24 object-contain drop-shadow-lg relative z-10"
        />
      </div>

      {/* Info area */}
      <div className="p-3">
        <p className="text-[10px] mb-0.5 uppercase tracking-wide font-semibold" style={{ color: 'var(--color-muted-fg)' }}>
          {product.unit}
        </p>
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug mb-2.5" style={{ color: 'var(--color-fg)', minHeight: '2.5rem' }}>
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
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.08 }}
            onClick={handleAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))',
              boxShadow: '0 3px 12px var(--glow-primary)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
