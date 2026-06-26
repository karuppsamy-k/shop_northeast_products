import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BottomNav } from '../components/BottomNav';
import { useThemeStore } from '../store/themeStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FirestoreService } from '../services/firestore.service';
import type { User } from '../models/User';

import { HomePage } from '../screens/Home/HomePage';
import { CategoryPage } from '../screens/Category/CategoryPage';
import { CartPage } from '../screens/Cart/CartPage';
import { ProfilePage } from '../screens/Profile/ProfilePage';
import { AboutPage } from '../screens/Home/AboutPage';
import { SignInPage } from '../screens/Auth/SignInPage';
import { SignUpPage } from '../screens/Auth/SignUpPage';
import { AdminDashboard } from '../screens/Admin/AdminDashboard';

// ─── Session Initializer — runs once at app root ──────────────────────────────
const SessionManager = () => {
  const { setUser, setInitializing } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch the latest user document from Firestore
          const userData = await FirestoreService.getDocument<User>('users', firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // Minimal user if doc not found
            setUser({ uid: firebaseUser.uid, name: firebaseUser.displayName || '', email: firebaseUser.email || '' });
          }
        } catch {
          setUser({ uid: firebaseUser.uid, name: firebaseUser.displayName || '', email: firebaseUser.email || '' });
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [setUser, setInitializing]);

  return null;
};

// ─── Global Loading Screen ─────────────────────────────────────────────────────
const AppLoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center"
    style={{ background: 'var(--body-gradient)' }}>
    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 animate-pulse"
      style={{ background: 'var(--color-primary-val)' }}>
      <ShoppingCart className="w-7 h-7 text-white" />
    </div>
    <p className="text-sm font-semibold" style={{ color: 'var(--color-muted-fg)' }}>Loading...</p>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────
const MainLayout = () => {
  const { theme } = useThemeStore();
  const toast = useToastStore();
  const { user, isInitializing } = useAuthStore();
  const { fetchOrders, clearOrders } = useOrderStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.uid) {
      fetchOrders(user.uid);
    } else {
      clearOrders();
    }
  }, [user?.uid, fetchOrders, clearOrders]);

  if (isInitializing) return <AppLoadingScreen />;

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

// ─── Router ──────────────────────────────────────────────────────────────────
export const AppNavigator = () => {
  return (
    <Router>
      {/* SessionManager listens to Firebase auth state before any route renders */}
      <SessionManager />
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
};
