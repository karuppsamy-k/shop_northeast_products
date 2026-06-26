import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Clock,
  LogOut, ChevronRight, Sun, Moon, Camera, Check, Eye, EyeOff,
  ArrowLeft, Settings, ShoppingBag, Package, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useOrderStore } from '@/store/orderStore';
import type { Order } from '@/models/Order';
import { Avatar } from '@/components/ui/Avatar';

/* ─── Shared Types ─── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCur = (n: number) => `₹${n.toFixed(0)}`;

/* ─── MenuItem ─── */
const MenuItem = ({
  icon: Icon, label, onClick, danger = false, rightEl,
}: {
  icon: any; label: string; onClick?: () => void; danger?: boolean; rightEl?: React.ReactNode;
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
    style={{ background: 'transparent' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)',
        color: danger ? 'rgb(239,68,68)' : 'var(--color-primary-val)',
      }}>
      <Icon className="w-4 h-4" />
    </div>
    <span className="flex-1 text-left text-sm font-semibold"
      style={{ color: danger ? 'rgb(239,68,68)' : 'var(--color-fg)' }}>
      {label}
    </span>
    {rightEl ?? <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />}
  </motion.button>
);

/* ─── Orders Panel ─── */
const OrdersPanel = ({ onClose }: { onClose: () => void }) => {
  const { orders } = useOrderStore();

  const statusColor = (s: Order['orderStatus']) =>
    s === 'Delivered' ? '#16a34a' : s === 'Cancelled' ? '#dc2626' : '#f97316';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--body-gradient)' }}
    >
      <div className="flex items-center justify-between px-4 py-4 mt-16 mb-2">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors"
          style={{ color: 'var(--color-fg)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-fg)' }}>Your Orders</h2>
        <div className="w-9" />
      </div>

      <div className="px-4 pb-24 max-w-lg mx-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(22,163,74,0.1)' }}>
              <Package className="w-9 h-9" style={{ color: 'var(--color-primary-val)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-fg)' }}>No orders yet</h3>
            <p className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="glass-card p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-muted-fg)' }}>
                      {fmtDate(order.createdAt)}
                    </p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
                      #{order.orderId.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${statusColor(order.orderStatus)}18`,
                      color: statusColor(order.orderStatus),
                    }}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2" style={{ color: 'var(--color-fg)' }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 font-semibold" style={{ color: 'var(--color-fg)' }}>
                        {fmtCur((item.discountPrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Address */}
                {order.deliveryAddress && (
                  <div className="flex items-start gap-1.5 text-xs mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-primary-val)' }} />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'var(--glass-border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-muted-fg)' }}>Total Paid</span>
                  <span className="text-base font-black" style={{ color: 'var(--color-primary-val)' }}>
                    {fmtCur(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Edit Profile Panel ─── */
const EditProfilePanel = ({ onClose }: { onClose: () => void }) => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email, username, phone, address });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.6)',
    border: '1.5px solid var(--glass-border)',
    color: 'var(--color-fg)',
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--body-gradient)' }}
    >
      <div className="flex items-center justify-between px-4 py-4 mt-16 mb-2">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors"
          style={{ color: 'var(--color-fg)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-fg)' }}>Edit Profile</h2>
        <button onClick={handleSave}
          className="p-2 rounded-full transition-colors font-bold text-sm flex items-center gap-1"
          style={{ color: saved ? 'rgb(34,197,94)' : 'var(--color-primary-val)' }}>
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      <div className="px-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Avatar name={user?.name || ''} size={96} className="shadow-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: 'var(--color-primary-val)' }}>
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {[
          { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your full name' },
          { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
          { label: 'Username', value: username, set: setUsername, type: 'text', placeholder: '@yourname' },
          { label: 'Phone', value: phone, set: setPhone, type: 'tel', placeholder: '+91 9876543210' },
          { label: 'Default Address', value: address, set: setAddress, type: 'text', placeholder: 'Your delivery address' },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} className="glass-card p-4">
            <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-muted-fg)' }}>{label}</label>
            <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle} />
          </div>
        ))}

        {/* Password */}
        <div className="glass-card p-4">
          <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-muted-fg)' }}>Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none"
              style={inputStyle} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: 'var(--color-muted-fg)' }}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
          style={{ background: 'var(--color-primary-val)' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Main Profile Page ─── */
export const ProfilePage = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { orders } = useOrderStore();
  const [editOpen, setEditOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleClearCache = () => showToast('Cache cleared successfully!');
  const handleClearHistory = () => showToast('History cleared successfully!');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-28 pt-20"
        style={{ background: 'var(--body-gradient)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="glass-card p-10 mb-4">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-white text-3xl font-bold"
              style={{ background: 'var(--color-primary-val)' }}>
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>My Profile</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-muted-fg)' }}>
              Sign in to manage your account, orders, and more.
            </p>
            <button onClick={() => navigate('/signin')}
              className="w-full py-3.5 rounded-xl text-white font-bold mb-3 shadow-md hover:opacity-90 transition-opacity"
              style={{ background: 'var(--color-primary-val)' }}>
              Sign In
            </button>
            <button onClick={() => navigate('/signup')}
              className="w-full py-3.5 rounded-xl font-bold border-2 transition-all hover:opacity-80"
              style={{ color: 'var(--color-primary-val)', borderColor: 'var(--color-primary-val)', background: 'transparent' }}>
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {editOpen && <EditProfilePanel onClose={() => setEditOpen(false)} />}
        {ordersOpen && <OrdersPanel onClose={() => setOrdersOpen(false)} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ background: 'var(--color-primary-val)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen pt-20 pb-28 px-4" style={{ background: 'var(--body-gradient)' }}>
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/10 transition-colors"
              style={{ color: 'var(--color-fg)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-fg)' }}>My Profile</h1>
            <button onClick={() => setEditOpen(true)} className="p-2 rounded-full hover:bg-black/10 transition-colors"
              style={{ color: 'var(--color-fg)' }}>
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar + Info Card */}
          <div className="glass-card p-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar name={user?.name || ''} size={80} className="shadow-md rounded-2xl" />
                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow"
                  style={{ background: 'var(--color-primary-val)' }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate" style={{ color: 'var(--color-fg)' }}>{user?.name}</h2>
                <p className="text-sm truncate" style={{ color: 'var(--color-muted-fg)' }}>@{user?.username}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{user?.email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center mt-5 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex-1 text-center">
                <p className="text-xl font-black" style={{ color: 'var(--color-primary-val)' }}>{orders.length}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>Orders</p>
              </div>
              <div className="w-px h-10" style={{ background: 'var(--glass-border)' }} />
              <div className="flex-1 text-center">
                <p className="text-xl font-black" style={{ color: 'var(--color-secondary-val)' }}>
                  {orders.reduce((a, o) => a + o.items.reduce((b, i) => b + i.quantity, 0), 0)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>Items</p>
              </div>
              <div className="w-px h-10" style={{ background: 'var(--glass-border)' }} />
              <div className="flex-1 text-center">
                <p className="text-base font-black" style={{ color: 'var(--color-fg)' }}>
                  ₹{orders.reduce((a, o) => a + o.total, 0).toFixed(0)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>Spent</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="glass-card p-2 space-y-1 mb-4">
            {/* Your Orders */}
            <MenuItem
              icon={Package}
              label="Your Orders"
              onClick={() => setOrdersOpen(true)}
              rightEl={
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <span className="w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center text-white"
                      style={{ background: 'var(--color-secondary-val)' }}>
                      {orders.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                </div>
              }
            />

            {/* Theme Toggle */}
            <MenuItem
              icon={theme === 'dark' ? Moon : Sun}
              label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              onClick={toggleTheme}
              rightEl={
                <div className="relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-1"
                  style={{ background: theme === 'dark' ? 'var(--color-primary-val)' : 'rgba(0,0,0,0.15)' }}>
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-4 h-4 rounded-full bg-white shadow"
                    style={{ marginLeft: theme === 'dark' ? 'auto' : '0' }}
                  />
                </div>
              }
            />

            <MenuItem icon={Trash2} label="Clear Cache" onClick={handleClearCache} />
            <MenuItem icon={Clock} label="Clear History" onClick={handleClearHistory} />
          </div>

          <div className="glass-card p-2">
            <MenuItem icon={LogOut} label="Log Out" onClick={handleLogout} danger />
          </div>

        </div>
      </div>
    </>
  );
};
