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
    <div className="sticky top-24 rounded-3xl border overflow-hidden"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--glass-card-shadow)',
      }}>
      <div className="p-5 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-val), var(--color-secondary-val))' }}>
        <h2 className="text-base font-bold">Order Summary</h2>
        <p className="text-xs opacity-75 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="p-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,hsl(38,95%,88%),hsl(14,78%,85%))' }}>
              <img src={item?.images?.[0] || ''} alt={item.name}
                loading="lazy" decoding="async"
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
