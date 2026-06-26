import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Navigation } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthInput } from '@/components/ui/AuthInput';
import { getCurrentLocation, reverseGeocode } from '@/helpers/location';

export const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{latitude: number; longitude: number} | undefined>();
  const [gettingLocation, setGettingLocation] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const redirectUrl = query.get('redirect') || '/profile';

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError('');
    try {
      const pos = await getCurrentLocation();
      setCoords({ latitude: pos.latitude, longitude: pos.longitude });
      const addr = await reverseGeocode(pos.latitude, pos.longitude);
      setAddress(addr);
    } catch (err) {
      setError('Could not get GPS location. Please enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!address.trim()) {
      setError('Please enter your location or use GPS.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    
    try {
      await register(email, password, {
        name,
        phone,
        address,
        currentLocation: coords ? { ...coords, address } : undefined
      });
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Could not create account. Please try again.');
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
        <button onClick={() => navigate('/signin')} className="flex items-center gap-2 mb-8 text-sm font-semibold"
          style={{ color: 'var(--color-muted-fg)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                boxShadow: '0 6px 24px var(--glow-primary), 0 1px 0 rgba(255,255,255,0.2) inset',
                border: '2px solid rgba(255,255,255,0.18)',
              }}>
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
            
            <div className="space-y-2">
              <AuthInput label="Delivery Location" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House No, Street, City" />
              <button type="button" onClick={handleGetLocation} disabled={gettingLocation} className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: 'var(--color-primary-val)' }}>
                {gettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                {gettingLocation ? 'Getting location...' : 'Use Current GPS Location'}
              </button>
            </div>
            
            <AuthInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                boxShadow: '0 4px 20px var(--glow-primary), 0 1px 0 rgba(255,255,255,0.18) inset',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
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
