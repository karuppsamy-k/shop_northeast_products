// @ts-nocheck
import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import { LayoutDashboard, Users, Package, ShoppingBag, BarChart3, Settings } from 'lucide-react'
import './admin.css'

const navItems = [
  { label: 'Dash Board', id: 'dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Products', id: 'products', icon: <Package size={18} /> },
  { label: 'Orders', id: 'orders', icon: <ShoppingBag size={18} /> },
  { label: 'Users', id: 'users', icon: <Users size={18} /> },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const activeId = location.pathname.split('/').pop() || 'dashboard'

  const handleNavClick = (id: string) => {
    setSidebarOpen(false)
    if (id === 'dashboard') {
      navigate(`/admin`)
    } else {
      navigate(`/admin/${id}`)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setUser(null);
      navigate('/signin');
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar 
        brandSub="Admin Portal"
        user={user}
        navItems={navItems}
        onNavClick={handleNavClick}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId={activeId}
      />
      
      <main className="dashboard-main">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />
      </main>
    </div>
  )
}
