import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthInput } from '@/components/ui/AuthInput';

export const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const redirectUrl = query.get('redirect') || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
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
        {/* Back */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8 text-sm font-semibold"
          style={{ color: 'var(--color-muted-fg)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="glass-card p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                boxShadow: '0 6px 24px var(--glow-primary), 0 1px 0 rgba(255,255,255,0.2) inset',
                border: '2px solid rgba(255,255,255,0.18)',
              }}>
              S
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-fg)' }}>Welcome Back</h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <AuthInput
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            {/* Password */}
            <AuthInput
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                boxShadow: '0 4px 20px var(--glow-primary), 0 1px 0 rgba(255,255,255,0.18) inset',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted-fg)' }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="font-bold hover:underline"
              style={{ color: 'var(--color-primary-val)' }}>
              Sign Up
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
