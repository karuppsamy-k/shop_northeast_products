import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/services/api';
import { notificationService } from '@/services/notification';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { OrderSummary } from '@/components/OrderSummary';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, User, Phone, MapPin, Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ─── EmailJS Config ─────────────────────────────────────────────────────────
// Replace these 3 values with your actual EmailJS credentials.
// 1. Go to https://www.emailjs.com → Sign up free
// 2. Add Gmail service → copy Service ID
// 3. Create template with {{customer_name}}, {{customer_phone}}, {{customer_email}},
//    {{customer_address}}, {{order_details}}, {{subtotal}}, {{tax}}, {{total_amount}}
// 4. Copy Template ID and Public Key from Account → General
const EMAILJS_SERVICE_ID = 'service_gcyueqa';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_vhwyla5';  // e.g. 'template_xyz456'
const EMAILJS_PUBLIC_KEY = 'YA_DIO51YaQbc-JAR';   // from EmailJS Account → General
// ────────────────────────────────────────────────────────────────────────────

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px 10px 40px',
  borderRadius: '12px',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  color: 'var(--color-fg)',
  fontSize: '14px',
  outline: 'none',
};

export const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotals, clearCart } = useCartStore();
  const { subtotal, tax, total } = getTotals();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const validate = () => {
    const e: Partial<CustomerDetails> = {};
    if (!customer.name.trim()) e.name = 'Name is required';
    if (!customer.phone.trim() || !/^\d{10}$/.test(customer.phone.trim()))
      e.phone = 'Enter a valid 10-digit phone number';
    if (!customer.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setIsProcessing(true);
    try {
      const orderLines = items.map(item =>
        `  • ${item.name} (x${item.quantity}) = ₹${((item.discountPrice || item.price) * item.quantity).toFixed(0)}`
      ).join('\n');

      const templateParams = {
        // Destination (your inbox)
        to_email: 'karupu.buttr@gmail.com',

        // Customer info sent from the form
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim() || 'Not provided',
        customer_address: customer.address.trim(),

        // Order breakdown
        order_details: orderLines,
        subtotal: `₹${subtotal.toFixed(0)}`,
        tax: `₹${tax.toFixed(0)}`,
        total_amount: `₹${total.toFixed(0)}`,
        order_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
        console.log('✅ Order notification sent to karupu.buttr@gmail.com');
      } catch (emailError) {
        console.warn('⚠️ EmailJS not configured yet — replace the 3 constants at the top of CartPage.tsx', emailError);
      }

      const order = await api.placeOrder({ items, total });
      notificationService.notify('ORDER_PLACED', order);
      clearCart();
      setOrderPlaced(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Order Placed Success Screen ──────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#22c55e' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>Order Placed! 🎉</h1>
          <p className="text-sm mb-1" style={{ color: 'var(--color-muted-fg)' }}>
            Thank you, <strong>{customer.name}</strong>! Your order has been received.
          </p>
          <p className="text-xs mb-8" style={{ color: 'var(--color-muted-fg)' }}>
            A notification has been sent to the store.
          </p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </motion.div>
      </div>
    );
  }

  // ── Empty Cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(232,85,62,0.12)' }}>
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
    <div className="min-h-screen pt-20 pb-24" style={{ background: 'var(--body-gradient)' }}>
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
              {showCheckout ? 'Your Details' : 'Your Cart'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
              {showCheckout ? 'We need your info to process the order' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showCheckout ? (
            /* ── Cart View ──────────────────────────────────────────── */
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
                              background: `linear-gradient(135deg, hsl(${(i * 47) % 360},70%,80%), hsl(${(i * 47 + 40) % 360},65%,70%))`,
                            }}>
                            <img src={item?.images?.[0] || ''} alt={item?.name || 'Item'}
                              loading="lazy" decoding="async"
                              className="object-contain w-full h-full drop-shadow-lg" style={{ padding: '12px' }} />
                            {item.price > item.discountPrice && (
                              <div className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ color: 'var(--color-primary-val)' }}>
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
                                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-opacity hover:opacity-80"
                                  style={{ background: 'var(--color-primary-val)' }}>
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-bold" style={{ color: 'var(--color-fg)' }}>
                                  {item.quantity}
                                </span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-opacity hover:opacity-80"
                                  style={{ background: 'var(--color-primary-val)' }}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-sm font-bold mr-2" style={{ color: 'var(--color-primary-val)' }}>
                                ₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}
                              </span>
                              <button onClick={() => removeItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
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
                      <Button className="w-full mt-2" size="lg" onClick={() => {
                        if (!isLoggedIn) {
                          navigate('/signin?redirect=/cart');
                        } else {
                          setShowCheckout(true);
                        }
                      }}>
                        Proceed to Checkout →
                      </Button>
                    )}
                  />
                </div>

              </div>
            </motion.div>

          ) : (
            /* ── Checkout / Customer Details Form ───────────────────── */
            <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Form */}
                <div className="flex-1">
                  <div className="rounded-3xl border overflow-hidden"
                    style={{
                      background: 'var(--glass-card-bg)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderColor: 'var(--glass-border)',
                      boxShadow: 'var(--glass-card-shadow)',
                    }}>
                    <div className="p-5 text-white"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary-val), var(--color-secondary-val))' }}>
                      <h2 className="text-base font-bold">Customer Details</h2>
                      <p className="text-xs opacity-75 mt-0.5">Your info will be sent with the order notification</p>
                    </div>

                    <div className="p-6 space-y-5">

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                          <input
                            id="customer-name"
                            type="text"
                            placeholder="e.g. Ramesh Kumar"
                            value={customer.name}
                            onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                        {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.name}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                          <input
                            id="customer-phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            value={customer.phone}
                            onChange={e => setCustomer(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                            style={inputStyle}
                          />
                        </div>
                        {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.phone}</p>}
                      </div>

                      {/* Email (optional) */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                          Email <span className="font-normal opacity-60">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                          <input
                            id="customer-email"
                            type="email"
                            placeholder="customer@email.com"
                            value={customer.email}
                            onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>
                          Delivery Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                          <textarea
                            id="customer-address"
                            rows={3}
                            placeholder="House no., street, city, state, pincode"
                            value={customer.address}
                            onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                            style={{ ...inputStyle, paddingTop: '10px', paddingBottom: '10px', resize: 'none' }}
                          />
                        </div>
                        {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.address}</p>}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right: mini summary + place order */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    subtitle="Order details will be sent to store via email"
                    renderButton={() => (
                      <Button
                        id="place-order-btn"
                        className="w-full mt-2"
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Placing Order...' : 'Place Order →'}
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
