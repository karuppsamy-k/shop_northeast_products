import React from 'react';
import { motion } from 'framer-motion';
import type { Category } from '@/services/api';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

const circleGradients = [
  'linear-gradient(135deg, hsl(340,75%,75%), hsl(300,70%,78%))',
  'linear-gradient(135deg, hsl(25,88%,72%), hsl(40,88%,74%))',
  'linear-gradient(135deg, hsl(163,65%,68%), hsl(200,70%,72%))',
  'linear-gradient(135deg, hsl(270,70%,74%), hsl(300,65%,76%))',
  'linear-gradient(135deg, hsl(45,88%,72%), hsl(20,82%,72%))',
  'linear-gradient(135deg, hsl(200,78%,72%), hsl(230,72%,74%))',
  'linear-gradient(135deg, hsl(320,68%,74%), hsl(270,68%,74%))',
  'linear-gradient(135deg, hsl(163,65%,70%), hsl(40,78%,72%))',
  'linear-gradient(135deg, hsl(230,72%,74%), hsl(270,68%,74%))',
  'linear-gradient(135deg, hsl(340,70%,74%), hsl(310,65%,74%))',
];

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const colorIndex = category.id.charCodeAt(category.id.length - 1) % circleGradients.length;
  const gradient = circleGradients[colorIndex];

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]"
    >
      {/* Liquid glass circle */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative"
        style={{
          background: gradient,
          boxShadow: '0 4px 16px rgba(80,80,200,0.18), 0 1px 0 rgba(255,255,255,0.5) inset',
          border: '1.5px solid rgba(255,255,255,0.65)',
        }}
      >
        {/* Inner glass sheen */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.02) 60%)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          decoding="async"
          className="w-12 h-12 object-cover rounded-full relative z-10"
        />
      </div>
      <span
        className="text-[10px] font-semibold text-center leading-tight line-clamp-2 max-w-[72px]"
        style={{ color: 'var(--color-fg)' }}
      >
        {category.name}
      </span>
    </motion.div>
  );
};
