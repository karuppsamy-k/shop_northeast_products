import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { items } = useCartStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
              style={{ background: 'var(--color-primary-val)' }}>
              H
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span style={{ color: 'var(--color-fg)' }}>Sathish</span>
              <span style={{ color: 'var(--color-primary-val)' }}>S</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold transition-colors hover:text-primary" style={{ color: 'var(--color-fg)' }}>Home</Link>
            <Link to="/categories" className="text-sm font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }}>Explore</Link>
            <Link to="/cart" className="text-sm font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }}>Offers</Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-3">
            <ThemeToggle />

            {/* Search icon — expands on click (mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-fg)' }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile (desktop only) */}
            <Link to="/profile" className="hidden md:flex p-2 rounded-full transition-colors hover:bg-black/5" style={{ color: 'var(--color-fg)' }}>
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-full transition-colors hover:bg-black/5" style={{ color: 'var(--color-fg)' }}>
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-primary-val)' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Sign in — desktop */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full text-white shadow transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary-val)' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width animated search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-50 flex items-center px-4"
            style={{
              height: '64px',
              background: 'var(--glass-panel-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <Search className="w-5 h-5 shrink-0 mr-3" style={{ color: 'var(--color-muted-fg)' }} />
            <input
              autoFocus
              type="text"
              placeholder="Search products, categories..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--color-fg)' }}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 ml-2 rounded-full hover:bg-black/10 transition-colors"
              style={{ color: 'var(--color-muted-fg)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
