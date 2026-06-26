import React from 'react';
import type { CartItem } from '@/store/cartStore';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  renderButton?: () => React.ReactNode;
  subtitle?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  tax,
  total,
  renderButton,
  subtitle,
}) => {
  return (
    <div
      className="sticky top-24 rounded-3xl overflow-hidden glass-shimmer"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-panel-shadow)',
      }}
    >
      {/* Iridescent Header */}
      <div
        className="p-5 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-val) 0%, hsl(163,80%,22%) 50%, hsl(220,70%,35%) 100%)',
        }}
      >
        {/* Sheen overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        <h2 className="text-base font-bold relative z-10">Order Summary</h2>
        <p className="text-xs opacity-75 mt-0.5 relative z-10">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="p-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(38,90%,85%), hsl(14,75%,82%))',
                border: '1px solid var(--glass-border)',
              }}
            >
              <img
                src={item?.images?.[0] || ''}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="flex-1 text-xs truncate" style={{ color: 'var(--color-fg)' }}>
              {item.name} ×{item.quantity}
            </span>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--color-fg)' }}>
              ₹{((item.discountPrice || item.price) * item.quantity).toFixed(0)}
            </span>
          </div>
        ))}

        <div className="border-t pt-3 space-y-2.5" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted-fg)' }}>
            <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted-fg)' }}>
            <span>Tax (8%)</span><span>₹{tax.toFixed(0)}</span>
          </div>
          <div
            className="flex justify-between font-black text-base pt-2.5 border-t"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--color-fg)' }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--color-primary-val)' }}>₹{total.toFixed(0)}</span>
          </div>
        </div>

        {renderButton && renderButton()}

        {subtitle && (
          <p className="text-[10px] text-center" style={{ color: 'var(--color-muted-fg)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
