import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthInput } from '@/components/ui/AuthInput';

export const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const redirectUrl = query.get('redirect') || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const ok = await signup(name, email, username, password, phone);
    setLoading(false);
    if (ok) {
      navigate(redirectUrl);
    } else {
      setError('Could not create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 md:pt-24 md:pb-12"
      style={{ background: 'var(--body-gradient)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <button onClick={() => navigate('/signin')} className="flex items-center gap-2 mb-8 text-sm font-semibold"
          style={{ color: 'var(--color-muted-fg)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: 'var(--color-primary-val)' }}>
              S
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-fg)' }}>Create Account</h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>Join us for the best experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput label="Full Name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aditya Sharma" />
            <AuthInput label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <AuthInput label="Username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@yourname" />
            <AuthInput label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
            <AuthInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-opacity hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'var(--color-primary-val)' }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted-fg)' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/signin')} className="font-bold hover:underline"
              style={{ color: 'var(--color-primary-val)' }}>
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
