import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Clock,
  LogOut, ChevronRight, Sun, Moon, Camera, Check, Eye, EyeOff,
  ArrowLeft, Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
  rightEl,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  rightEl?: React.ReactNode;
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group"
    style={{ background: 'transparent' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.35)',
        color: danger ? 'rgb(239,68,68)' : 'var(--color-fg)',
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

/* ─── Edit Profile Panel ─── */
const EditProfilePanel = ({ onClose }: { onClose: () => void }) => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email, username, phone });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.45)',
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
      {/* Header */}
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

      <div className="px-4 pb-24 space-y-5 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            <img src={user?.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: 'var(--color-primary-val)' }}>
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {[
          { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your full name' },
          { label: 'E mail address', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
          { label: 'User name', value: username, set: setUsername, type: 'text', placeholder: '@yourname' },
          { label: 'Phone number', value: phone, set: setPhone, type: 'tel', placeholder: '+91 9876543210' },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} className="glass-card p-5">
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-fg)' }}>{label}</label>
            <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle} />
          </div>
        ))}

        {/* Password */}
        <div className="glass-card p-5">
          <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-fg)' }}>Password</label>
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
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

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
              S
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>My Profile</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-muted-fg)' }}>Sign in to manage your account, favourites, and more.</p>
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

          {/* Avatar + Info */}
          <div className="glass-card p-6 flex items-center gap-5 mb-4">
            <div className="relative shrink-0">
              <img src={user?.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow" />
              <button
                onClick={() => setEditOpen(true)}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow"
                style={{ background: 'var(--color-primary-val)' }}>
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate" style={{ color: 'var(--color-fg)' }}>{user?.name}</h2>
              <p className="text-sm truncate mb-3" style={{ color: 'var(--color-muted-fg)' }}>@{user?.username}</p>
              <button
                onClick={() => setEditOpen(true)}
                className="px-5 py-2 rounded-full text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
                style={{ background: 'var(--color-primary-val)' }}>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="glass-card p-2 space-y-1">
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

            <div className="my-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />

            <MenuItem icon={LogOut} label="Log Out" onClick={handleLogout} danger />
          </div>

        </div>
      </div>
    </>
  );
};
