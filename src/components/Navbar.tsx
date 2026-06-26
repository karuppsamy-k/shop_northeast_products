import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export const Navbar = () => {
  const { items } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

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
            <Link to="/about" className="text-sm font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }}>About</Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-3">
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

            {/* Sign in — desktop (only when not logged in) */}
            {!isLoggedIn && (
              <Link
                to="/signin"
                className="hidden md:flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full text-white shadow transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary-val)' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
