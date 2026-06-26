import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { api } from '@/services/api';
import { notificationService } from '@/services/notification';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/ui/AuthInput';
import { useAuthStore } from '@/store/authStore';
import { OrderSummary } from '@/components/OrderSummary';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ─── EmailJS Config ──────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_gcyueqa';
const EMAILJS_TEMPLATE_ID = 'template_vhwyla5';
const EMAILJS_PUBLIC_KEY = 'YA_DIO51YaQbc-JAR';
// ─────────────────────────────────────────────────────────────────────────────

// ─── Guest checkout form fields ───────────────────────────────────────────────
interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

// ─── Reusable field row with icon ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px 10px 42px',
  borderRadius: '12px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255,255,255,0.6)',
  color: 'var(--color-fg)',
  fontSize: '14px',
  outline: 'none',
};

// ─── Location helper ─────────────────────────────────────────────────────────
const requestLocation = (): Promise<{ lat: number; lng: number } | undefined> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(undefined),
      { timeout: 8000 }
    );
  });

// ─── Main Component ───────────────────────────────────────────────────────────
export const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotals, clearCart } = useCartStore();
  const { subtotal, tax, total } = getTotals();
  const { isLoggedIn, user } = useAuthStore();
  const { addOrder } = useOrderStore();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  // Navigate to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin?redirect=/cart');
    }
  }, [isLoggedIn, navigate]);

  // Guest details state (now just acting as a local state for editing address)

  // Guest-only form state
  const [guest, setGuest] = useState<GuestDetails>({
    name: '', phone: '', email: '', address: '', password: '',
  });
  const [errors, setErrors] = useState<Partial<GuestDetails>>({});

  // Auto-fill guest form from profile when logged in (shouldn't be shown, but safety)
  useEffect(() => {
    if (isLoggedIn && user) {
      setGuest((g) => ({
        ...g,
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        address: user.address || '',
      }));
    }
  }, [isLoggedIn, user]);

  const setField = (field: keyof GuestDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setGuest((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<GuestDetails> = {};
    if (!guest.name.trim()) e.name = 'Name is required';
    if (!guest.phone.trim() || !/^\d{10}$/.test(guest.phone.trim()))
      e.phone = 'Enter a valid 10-digit phone number';
    if (!guest.address.trim()) e.address = 'Delivery address is required';
    if (!isLoggedIn) {
      if (!guest.email.trim()) e.email = 'Email is required';
      if (guest.password.length < 6) e.password = 'Password must be at least 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToCheckout = () => {
    if (isLoggedIn) {
      // Already have profile - go straight to checkout, pre-filled
      setShowCheckout(true);
    } else {
      // Guest flow - show the guest details form
      setShowCheckout(true);
    }
  };

  const handlePlaceOrder = async () => {
    // For logged-in users, use the profile data; for guests validate form
    if (!isLoggedIn && !validate()) return;

    setIsProcessing(true);
    setLocationStatus('requesting');

    try {
      // 1. Request location
      const location = await requestLocation();
      setLocationStatus(location ? 'granted' : 'denied');

      if (!user) throw new Error("No valid user found.");
      
      const customerName = user.name;
      const customerPhone = user.phone || guest.phone;
      const customerEmail = user.email;
      const customerAddress = guest.address || user.address || '';

      // 3. Send email notification
      const orderLines = items.map(item =>
        `  • ${item.name} (x${item.quantity}) = ₹${((item.discountPrice || item.price) * item.quantity).toFixed(0)}`
      ).join('\n');

      const templateParams = {
        to_email: 'karupu.buttr@gmail.com',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || 'Not provided',
        customer_address: customerAddress,
        order_details: orderLines,
        subtotal: `₹${subtotal.toFixed(0)}`,
        tax: `₹${tax.toFixed(0)}`,
        total_amount: `₹${total.toFixed(0)}`,
        order_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ...(location ? { customer_location: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` } : {}),
      };

      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      } catch (emailErr) {
        console.warn('EmailJS error:', emailErr);
      }

      // 4. Place order and save to store
      const order = await api.placeOrder({ items, total });
      notificationService.notify('ORDER_PLACED', order);

      await addOrder({
        orderId: Math.random().toString(36).substring(2, 11),
        userId: user.uid,
        items,
        total,
        deliveryAddress: customerAddress,
        paymentMethod: 'Cash on Delivery',
        orderStatus: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Order Success Screen ───────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-16"
        style={{ background: 'var(--body-gradient)' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-sm"
        >
          {/* Icon */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#16a34a' }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>Order Placed! 🎉</h1>
          <p className="text-sm mb-1" style={{ color: 'var(--color-muted-fg)' }}>
            Thank you, <strong>{user?.name}</strong>! Your order has been received.
          </p>
          <p className="text-xs mb-2" style={{ color: 'var(--color-muted-fg)' }}>
            A confirmation has been sent to the store.
          </p>

          {locationStatus === 'granted' && (
            <div className="flex items-center justify-center gap-1.5 text-xs mb-6 font-medium"
              style={{ color: 'var(--color-primary-val)' }}>
              <Navigation className="w-3.5 h-3.5" />
              Location shared for delivery
            </div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => navigate('/profile')} className="w-full">View Your Orders</Button>
            <Button onClick={() => navigate('/')} className="w-full" style={{ background: 'transparent', color: 'var(--color-primary-val)', border: '1.5px solid var(--color-primary-val)' }}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Empty Cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20"
        style={{ background: 'var(--body-gradient)' }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(22,163,74,0.1)' }}>
          <ShoppingBag className="w-10 h-10" style={{ color: 'var(--color-primary-val)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-fg)' }}>Your Cart is Empty</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted-fg)' }}>
          Discover authentic flavors from Northeast India.
        </p>
        <Button onClick={() => navigate('/categories')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-28" style={{ background: 'var(--body-gradient)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 py-6 mb-2">
          <button
            onClick={() => showCheckout ? setShowCheckout(false) : navigate(-1)}
            className="p-2 rounded-full transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-fg)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>
              {showCheckout ? (isLoggedIn ? 'Confirm & Place Order' : 'Your Details') : 'Your Cart'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
              {showCheckout
                ? isLoggedIn
                  ? 'Review your info and confirm delivery address'
                  : 'Quick sign up to complete your order'
                : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showCheckout ? (
            /* ── Cart View ────────────────────────────────────────────── */
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                  <AnimatePresence>
                    {items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, scale: 0.96 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative overflow-hidden rounded-3xl border"
                        style={{
                          background: 'var(--glass-card-bg)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          borderColor: 'var(--glass-border)',
                          boxShadow: 'var(--glass-card-shadow)',
                        }}
                      >
                        <div className="flex items-stretch">
                          <div className="relative flex-shrink-0 flex items-center justify-center rounded-l-3xl overflow-hidden"
                            style={{
                              width: 'clamp(110px, 25%, 160px)',
                              minHeight: '140px',
                              background: `linear-gradient(135deg, hsl(${(i * 47) % 360},60%,85%), hsl(${(i * 47 + 40) % 360},55%,80%))`,
                            }}>
                            <img src={item?.images?.[0] || ''} alt={item?.name || 'Item'}
                              loading="lazy" decoding="async"
                              className="object-contain w-full h-full drop-shadow-lg" style={{ padding: '12px' }} />
                            {item.price > item.discountPrice && (
                              <div className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ color: 'var(--color-secondary-val)' }}>
                                {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                              </div>
                            )}
                          </div>

                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                                style={{ color: 'var(--color-primary-val)' }}>{item.categoryId || item.unit}</p>
                              <h3 className="font-bold text-sm md:text-base leading-snug mb-1"
                                style={{ color: 'var(--color-fg)' }}>{item?.name || 'Unknown Item'}</h3>
                              <p className="text-xs mb-3" style={{ color: 'var(--color-muted-fg)' }}>{item.unit}</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black" style={{ color: 'var(--color-fg)' }}>
                                  ₹{((item?.discountPrice) || (item?.price) || 0).toFixed(0)}
                                </span>
                                {item.price > item.discountPrice && (
                                  <span className="text-xs line-through" style={{ color: 'var(--color-muted-fg)' }}>
                                    ₹{item.price.toFixed(0)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 rounded-full p-1 border"
                                style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'var(--glass-border)' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ background: 'var(--color-primary-val)' }}>
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-bold" style={{ color: 'var(--color-fg)' }}>
                                  {item.quantity}
                                </span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ background: 'var(--color-primary-val)' }}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-sm font-bold mr-2" style={{ color: 'var(--color-primary-val)' }}>
                                ₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}
                              </span>
                              <button onClick={() => removeItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-full"
                                style={{ color: 'var(--color-destructive-val)' }}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    subtitle="Secure checkout • Free delivery on orders ₹499+"
                    renderButton={() => (
                      <Button className="w-full mt-2" size="lg" onClick={handleProceedToCheckout}>
                        {isLoggedIn ? 'Confirm Order →' : 'Proceed to Checkout →'}
                      </Button>
                    )}
                  />
                </div>

              </div>
            </motion.div>

          ) : (
            /* ── Checkout / Details Form ──────────────────────────────── */
            <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Form / Info Panel */}
                <div className="flex-1">
                  <div className="rounded-3xl border overflow-hidden"
                    style={{
                      background: 'var(--glass-card-bg)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderColor: 'var(--glass-border)',
                      boxShadow: 'var(--glass-card-shadow)',
                    }}>

                    {/* Card Header */}
                    <div className="p-5"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))' }}>
                      <h2 className="text-base font-bold text-white">
                        {isLoggedIn ? '📋 Your Details (Auto-filled)' : '📝 Quick Sign Up & Order'}
                      </h2>
                      <p className="text-xs text-white/70 mt-0.5">
                        {isLoggedIn
                          ? 'Your profile info will be used for this order'
                          : 'Enter your details to create an account and place your order in one step'}
                      </p>
                    </div>

                    <div className="p-6 space-y-5">
                      {isLoggedIn ? (
                        /* ── Logged-in: show read-only profile + editable address ── */
                        <>
                          <ProfileInfoRow label="Name" value={user?.name || ''} />
                          <ProfileInfoRow label="Phone" value={user?.phone || ''} />
                          <ProfileInfoRow label="Email" value={user?.email || ''} />

                          {/* Delivery address - always editable */}
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                              Delivery Address *
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                              <textarea
                                rows={3}
                                placeholder="House no., street, city, state, pincode"
                                value={guest.address}
                                onChange={setField('address')}
                                style={{ ...inputStyle, paddingTop: '10px', paddingBottom: '10px', paddingLeft: '42px', resize: 'none' }}
                              />
                            </div>
                            {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.address}</p>}
                          </div>
                        </>
                      ) : (
                        /* ── Guest: full form with password for auto-signup ── */
                        <>
                          <AuthInput
                            label="Full Name *"
                            type="text"
                            value={guest.name}
                            onChange={setField('name')}
                            placeholder="Ramesh Kumar"
                            error={errors.name}
                          />
                          <AuthInput
                            label="Phone Number *"
                            type="tel"
                            value={guest.phone}
                            onChange={(e) => setGuest(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            placeholder="10-digit mobile number"
                            error={errors.phone}
                          />
                          <AuthInput
                            label="Email *"
                            type="email"
                            value={guest.email}
                            onChange={setField('email')}
                            placeholder="you@example.com"
                            error={errors.email}
                          />
                          <AuthInput
                            label="Password * (creates your account)"
                            type="password"
                            value={guest.password}
                            onChange={setField('password')}
                            placeholder="Min. 6 characters"
                            error={errors.password}
                          />

                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                              Delivery Address *
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                              <textarea
                                rows={3}
                                placeholder="House no., street, city, state, pincode"
                                value={guest.address}
                                onChange={setField('address')}
                                style={{ ...inputStyle, paddingTop: '10px', paddingBottom: '10px', paddingLeft: '42px', resize: 'none' }}
                              />
                            </div>
                            {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.address}</p>}
                          </div>
                        </>
                      )}

                      {/* Location notice */}
                      <div className="flex items-start gap-2 text-xs p-3 rounded-xl"
                        style={{ background: 'rgba(22,163,74,0.08)', color: 'var(--color-primary-val)' }}>
                        <Navigation className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>We'll request your location when you place the order to assist with delivery.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary + Place Order */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    subtitle="Order details will be sent to the store"
                    renderButton={() => (
                      <Button
                        id="place-order-btn"
                        className="w-full mt-2"
                        size="lg"
                        onClick={() => {
                          if (isLoggedIn && !guest.address.trim()) {
                            setErrors({ address: 'Delivery address is required' });
                            return;
                          }
                          handlePlaceOrder();
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? locationStatus === 'requesting'
                            ? 'Getting Location...'
                            : 'Placing Order...'
                          : isLoggedIn
                            ? 'Place Order →'
                            : 'Sign Up & Place Order →'}
                      </Button>
                    )}
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// ─── Helper: read-only profile row ────────────────────────────────────────────
const ProfileInfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-muted-fg)' }}>{label}</label>
    <div className="px-4 py-3 rounded-xl text-sm font-medium"
      style={{
        background: 'rgba(22,163,74,0.06)',
        border: '1.5px solid rgba(22,163,74,0.15)',
        color: 'var(--color-fg)',
      }}>
      {value || '—'}
    </div>
  </div>
);
