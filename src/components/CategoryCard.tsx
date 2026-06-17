import React from 'react';
import { motion } from 'framer-motion';
import type { Category } from '@/services/api';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

const circleColors = [
  'from-red-400 to-red-500',
  'from-orange-400 to-orange-500',
  'from-green-400 to-green-500',
  'from-purple-400 to-purple-500',
  'from-yellow-400 to-yellow-500',
  'from-blue-400 to-blue-500',
  'from-pink-400 to-pink-500',
  'from-teal-400 to-teal-500',
  'from-indigo-400 to-indigo-500',
  'from-rose-400 to-rose-500',
];

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const colorIndex = category.id.charCodeAt(category.id.length - 1) % circleColors.length;
  const color = circleColors[colorIndex];

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} overflow-hidden flex items-center justify-center shadow-md border-2 border-white`}>
        <img
          src={category.image}
          alt={category.name}
          className="w-12 h-12 object-cover rounded-full"
        />
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2 max-w-[72px]" style={{ color: 'var(--color-fg)' }}>
        {category.name}
      </span>
    </motion.div>
  );
};
