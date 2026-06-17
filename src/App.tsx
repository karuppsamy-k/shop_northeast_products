import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './features/user/HomePage';
import { CategoryPage } from './features/products/CategoryPage';
import { CartPage } from './features/cart/CartPage';
import { ProfilePage } from './features/user/ProfilePage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { useThemeStore } from './store/themeStore';

const MainLayout = () => {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
