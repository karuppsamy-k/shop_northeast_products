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
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 0.8, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-shimmer"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 4px 32px rgba(80, 100, 200, 0.08), 0 1px 0 var(--glass-inner-border) inset',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))',
                boxShadow: '0 3px 12px var(--glow-primary)',
              }}
            >
              NF
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span style={{ color: 'var(--color-fg)' }}>Northeast</span>
              <span style={{ color: 'var(--color-primary-val)' }}>FreshMart</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', path: '/' },
              { label: 'Explore', path: '/categories' },
              { label: 'About', path: '/about' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/25 dark:hover:bg-white/10"
                style={{ color: 'var(--color-muted-fg)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Profile (desktop only) */}
            <Link
              to="/profile"
              className="hidden md:flex p-2.5 rounded-full transition-all hover:bg-white/25"
              style={{ color: 'var(--color-fg)' }}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full transition-all hover:bg-white/25"
              style={{ color: 'var(--color-fg)' }}
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                    boxShadow: '0 2px 8px var(--glow-primary)',
                  }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Sign in — desktop */}
            {!isLoggedIn && (
              <Link
                to="/signin"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full text-white shadow transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))',
                  boxShadow: '0 4px 16px var(--glow-primary)',
                }}
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
