import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { api } from '@/services/api';
import { notificationService } from '@/services/notification';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/ui/AuthInput';
import { useAuthStore } from '@/store/authStore';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, CheckCircle2, Navigation, Ticket, Truck, ChevronRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { getCurrentLocation, reverseGeocode } from '@/helpers/location';
import { Loader2 } from 'lucide-react';

// ─── EmailJS Config ──────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_gcyueqa';
const EMAILJS_TEMPLATE_ID = 'template_vhwyla5';
const EMAILJS_PUBLIC_KEY = 'YA_DIO51YaQbc-JAR';
// ─────────────────────────────────────────────────────────────────────────────

interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

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

export const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotals, clearCart } = useCartStore();
  const { subtotal, tax, total } = getTotals();
  const { isLoggedIn, user, updateProfile } = useAuthStore();
  const { addOrder } = useOrderStore();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addressMode, setAddressMode] = useState<'view' | 'options' | 'manual'>('view');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin?redirect=/cart');
    }
  }, [isLoggedIn, navigate]);

  const [guest, setGuest] = useState<GuestDetails>({
    name: '', phone: '', email: '', address: '', password: '',
  });
  const [errors, setErrors] = useState<Partial<GuestDetails>>({});

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

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      const addr = await reverseGeocode(coords.latitude, coords.longitude);
      await updateProfile({ 
        address: addr, 
        currentLocation: { latitude: coords.latitude, longitude: coords.longitude, address: addr } 
      });
      setGuest(g => ({ ...g, address: addr }));
      setAddressMode('view');
    } catch (err) {
      console.error(err);
      setAddressMode('manual');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleManualSave = async () => {
    if (guest.address.trim()) {
      await updateProfile({ address: guest.address });
      setAddressMode('view');
    }
  };

  const handleProceedToCheckout = () => {
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn && !validate()) return;
    if (isLoggedIn && !guest.address.trim()) {
      setErrors({ address: 'Delivery address is required' });
      return;
    }

    setIsProcessing(true);

    try {
      if (!user) throw new Error("No valid user found.");
      
      const customerName = user.name;
      const customerPhone = user.phone || guest.phone;
      const customerEmail = user.email;
      const customerAddress = guest.address || user.address || '';

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
        ...(user?.currentLocation ? { customer_location: `${user.currentLocation.latitude.toFixed(5)}, ${user.currentLocation.longitude.toFixed(5)}` } : {}),
      };

      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      } catch (emailErr) {
        console.warn('EmailJS error:', emailErr);
      }

      const order = await api.placeOrder({ items, total });
      notificationService.notify('ORDER_PLACED', order);

      await addOrder({
        orderId: Math.random().toString(36).substring(2, 11),
        userId: user.uid,
        items,
        totalAmount: total,
        deliveryAddress: customerAddress,
        paymentMethod: 'WhatsApp QR',
        status: 'Pending',
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
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#16a34a' }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>Order Placed! 🎉</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted-fg)' }}>
            Thank you, <strong>{user?.name}</strong>! Your order has been received.
          </p>
          
          <div className="p-4 rounded-xl mb-6 flex flex-col items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <MessageCircle className="w-8 h-8 text-green-500" />
            <p className="text-sm font-semibold text-green-600">
              We will connect via WhatsApp to confirm your order and provide the payment QR code.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/profile')} className="w-full">View Your Orders</Button>
            <Button onClick={() => navigate('/')} className="w-full" style={{ background: 'transparent', color: 'var(--color-primary-val)', border: '1.5px solid var(--color-primary-val)' }}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
      <div className="max-w-xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-4 py-4 mb-2">
          <button
            onClick={() => showCheckout ? setShowCheckout(false) : navigate(-1)}
            className="p-2 rounded-full transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-fg)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center pr-9">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>
              {showCheckout ? 'Checkout' : 'My Cart'}
            </h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showCheckout ? (
            /* ── Cart View ────────────────────────────────────────────── */
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              
              {/* Items List */}
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, scale: 0.96 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative overflow-hidden rounded-2xl border flex items-center p-3 gap-4"
                      style={{
                        background: 'var(--glass-card-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderColor: 'var(--glass-border)',
                      }}
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-black/5"
                        style={{ border: '1px solid var(--glass-border)' }}>
                        <img src={item?.images?.[0] || ''} alt={item?.name || 'Item'}
                          className="object-contain w-full h-full p-2 drop-shadow-md" />
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm leading-tight text-gray-800"
                            style={{ color: 'var(--color-fg)' }}>{item?.name || 'Unknown Item'}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 -mr-2 -mt-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">Volume : {item.unit}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-gray-800" style={{ color: 'var(--color-fg)' }}>
                              ₹{((item?.discountPrice) || (item?.price) || 0).toFixed(0)}
                            </span>
                            {item.price > item.discountPrice && (
                              <span className="text-xs line-through text-gray-400">
                                ₹{item.price.toFixed(0)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 rounded-full border px-2 py-1"
                            style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'var(--glass-border)' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                              style={{ background: 'var(--color-primary-val)' }}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold" style={{ color: 'var(--color-fg)' }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                              style={{ background: 'var(--color-primary-val)' }}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Vouchers Section */}
              <div className="rounded-2xl border p-4 mb-6 flex justify-between items-center cursor-pointer"
                style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5" style={{ color: 'var(--color-primary-val)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-fg)' }}>See All Vouchers</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Summary Section */}
              <div className="rounded-2xl border p-5 mb-8"
                style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                  <span>Product</span>
                  <span>{items.reduce((acc, item) => acc + item.quantity, 0)} items</span>
                </div>
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t" style={{ borderColor: 'var(--glass-border)', color: 'var(--color-fg)' }}>
                  <span>TOTAL</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full py-6 text-lg rounded-2xl shadow-lg" onClick={handleProceedToCheckout} style={{ background: 'var(--color-primary-val)' }}>
                Checkout
              </Button>

            </motion.div>

          ) : (
            /* ── Checkout Flow ────────────────────────────────────────── */
            <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              {/* Address Section */}
              <div className="rounded-2xl border p-5 mb-4"
                style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  {addressMode === 'view' && (
                    <button onClick={() => setAddressMode('options')} className="text-xs font-semibold" style={{ color: 'var(--color-primary-val)' }}>
                      ✎ Edit
                    </button>
                  )}
                </div>

                {isLoggedIn ? (
                  <>
                    {addressMode === 'view' && (
                      <div className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                        <p className="font-semibold text-gray-800" style={{ color: 'var(--color-fg)' }}>{user?.name}</p>
                        <p className="mt-1">{guest.address || 'No address saved.'}</p>
                        <p className="mt-1">{user?.phone}</p>
                      </div>
                    )}
                    {addressMode === 'options' && (
                      <div className="space-y-2 mt-2">
                        <button onClick={handleUseCurrentLocation} disabled={gettingLocation} className="w-full p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-black/5" style={{ borderColor: 'var(--color-primary-val)', color: 'var(--color-primary-val)' }}>
                          {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                          Use Current Location
                        </button>
                        <button onClick={() => setAddressMode('manual')} className="w-full p-3 rounded-xl border text-sm font-semibold transition-all hover:bg-black/5" style={{ borderColor: 'var(--glass-border)', color: 'var(--color-fg)' }}>
                          Enter Address Manually
                        </button>
                        <button onClick={() => setAddressMode('view')} className="w-full p-2 text-xs font-semibold mt-1" style={{ color: 'var(--color-muted-fg)' }}>Cancel</button>
                      </div>
                    )}
                    {addressMode === 'manual' && (
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'var(--color-muted-fg)' }} />
                        <textarea
                          rows={3}
                          placeholder="House no., street, city, state, pincode"
                          value={guest.address}
                          onChange={setField('address')}
                          style={{ ...inputStyle, paddingTop: '10px', paddingBottom: '10px', paddingLeft: '42px', resize: 'none' }}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={handleManualSave} className="flex-1" size="sm">Save</Button>
                          <Button onClick={() => setAddressMode('view')} className="flex-1" size="sm" style={{ background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--glass-border)' }}>Cancel</Button>
                        </div>
                      </div>
                    )}
                    {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.address}</p>}
                  </>
                ) : (
                  <div className="space-y-4">
                    <AuthInput label="Full Name *" type="text" value={guest.name} onChange={setField('name')} error={errors.name} />
                    <AuthInput label="Phone Number *" type="tel" value={guest.phone} onChange={(e) => setGuest(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} error={errors.phone} />
                    <AuthInput label="Email *" type="email" value={guest.email} onChange={setField('email')} error={errors.email} />
                    <AuthInput label="Password *" type="password" value={guest.password} onChange={setField('password')} error={errors.password} />
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-muted-fg)' }}>Delivery Address *</label>
                      <textarea rows={3} placeholder="Full address" value={guest.address} onChange={setField('address')} style={{ ...inputStyle, resize: 'none', paddingLeft: '14px' }} />
                      {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--color-destructive-val)' }}>{errors.address}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Vouchers Options */}
              <div className="rounded-2xl border mb-4 divide-y" style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/5 transition">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-fg)' }}>Shipping Options</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/5 transition">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-fg)' }}>Free Shipping up to ₹50</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* WhatsApp Payment Info */}
              <div className="rounded-2xl border p-4 mb-4 flex items-start gap-3 bg-green-50/50" style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
                <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-green-800 mb-1">Payment & Confirmation</h4>
                  <p className="text-xs text-green-700 leading-relaxed">
                    We will connect with you via <strong>WhatsApp</strong> after you place the order to confirm details and provide the QR code for payment.
                  </p>
                </div>
              </div>

              {/* Summary Section */}
              <div className="rounded-2xl border p-5 mb-8"
                style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--color-primary-val)' }}>
                  <span>Voucher Applied</span>
                  <span>-₹0</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t" style={{ borderColor: 'var(--glass-border)', color: 'var(--color-fg)' }}>
                  <span>TOTAL PAYMENT</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                id="place-order-btn"
                className="w-full py-6 text-lg rounded-2xl shadow-lg"
                onClick={() => {
                  if (isLoggedIn && !guest.address.trim()) {
                    setErrors({ address: 'Delivery address is required' });
                    setAddressMode('manual');
                    return;
                  }
                  handlePlaceOrder();
                }}
                disabled={isProcessing}
                style={{ background: 'var(--color-primary-val)' }}
              >
                {isProcessing ? 'Placing Order...' : 'Place Order'}
              </Button>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
