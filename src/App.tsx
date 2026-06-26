import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './features/user/HomePage';
import { CategoryPage } from './features/products/CategoryPage';
import { CartPage } from './features/cart/CartPage';
import { ProfilePage } from './features/user/ProfilePage';
import { AboutPage } from './features/user/AboutPage';
import { SignInPage } from './features/user/SignInPage';
import { SignUpPage } from './features/user/SignUpPage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { useThemeStore } from './store/themeStore';
import { useToastStore } from './store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const MainLayout = () => {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toast = useToastStore();

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />

      {/* Global Cart Toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl flex items-center gap-2 whitespace-nowrap"
            style={{ background: 'var(--color-primary-val)' }}
          >
            <ShoppingCart className="w-4 h-4" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>
        
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
