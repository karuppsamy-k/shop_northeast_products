import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/services/api';
import { notificationService } from '@/services/notification';
import { Button } from '@/components/ui/Button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotals, clearCart } = useCartStore();
  const { subtotal, tax, total } = getTotals();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const order = await api.placeOrder({ items, total });
      notificationService.notify('ORDER_PLACED', order);
      clearCart();
      navigate('/profile');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

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
          <Link to="/" className="p-2 rounded-full transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-fg)' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>Your Cart</h1>
            <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Cart Items ── */}
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
                  {/* Coloured image panel on left */}
                  <div className="flex items-stretch">
                    <div className="relative flex-shrink-0 flex items-center justify-center rounded-l-3xl overflow-hidden"
                      style={{
                        width: 'clamp(110px, 25%, 160px)',
                        minHeight: '140px',
                        background: `linear-gradient(135deg, hsl(${(i * 47) % 360},70%,80%), hsl(${(i * 47 + 40) % 360},65%,70%))`,
                      }}>
                      <img
                        src={item?.images?.[0] || item?.image || ''}
                        alt={item?.name || 'Item'}
                        className="object-contain w-full h-full drop-shadow-lg"
                        style={{ padding: '12px' }}
                      />
                      {/* Discount badge */}
                      {item.price > item.discountPrice && (
                        <div className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ color: 'var(--color-primary-val)' }}>
                          {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                          style={{ color: 'var(--color-primary-val)' }}>
                          {item.category || item.unit}
                        </p>
                        <h3 className="font-bold text-sm md:text-base leading-snug mb-1"
                          style={{ color: 'var(--color-fg)' }}>
                          {item?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-xs mb-3" style={{ color: 'var(--color-muted-fg)' }}>
                          {item.unit}
                        </p>
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

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty stepper */}
                        <div className="flex items-center gap-1 rounded-full p-1 border"
                          style={{
                            background: 'var(--glass-bg)',
                            borderColor: 'var(--glass-border)',
                          }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-opacity hover:opacity-80"
                            style={{ background: 'var(--color-primary-val)' }}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold"
                            style={{ color: 'var(--color-fg)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-opacity hover:opacity-80"
                            style={{ background: 'var(--color-primary-val)' }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Total for this item */}
                        <span className="text-sm font-bold mr-2" style={{ color: 'var(--color-primary-val)' }}>
                          ₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
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

          {/* ── Order Summary ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 rounded-3xl border overflow-hidden"
              style={{
                background: 'var(--glass-panel-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderColor: 'var(--glass-border)',
                boxShadow: 'var(--glass-card-shadow)',
              }}>
              {/* Coloured header strip */}
              <div className="p-5 text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-val), var(--color-secondary-val))' }}>
                <h2 className="text-base font-bold">Order Summary</h2>
                <p className="text-xs opacity-75 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
              </div>

              <div className="p-5 space-y-3">
                {/* Item rows */}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,hsl(38,95%,88%),hsl(14,78%,85%))' }}>
                      <img src={item?.images?.[0] || ''} alt={item.name}
                        className="w-full h-full object-contain p-1" />
                    </div>
                    <span className="flex-1 text-xs truncate" style={{ color: 'var(--color-fg)' }}>
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--color-fg)' }}>
                      ₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted-fg)' }}>
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted-fg)' }}>
                    <span>Tax (8%)</span><span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-2 border-t"
                    style={{ borderColor: 'var(--glass-border)', color: 'var(--color-fg)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--color-primary-val)' }}>₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-2"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order →'}
                </Button>
                <p className="text-[10px] text-center" style={{ color: 'var(--color-muted-fg)' }}>
                  Secure checkout • Free delivery on orders ₹499+
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
