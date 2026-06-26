import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, style, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none disabled:opacity-50 cursor-pointer select-none active:scale-95";

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-13 px-8 text-base",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))',
        color: '#fff',
        boxShadow: '0 4px 20px var(--glow-primary), 0 1px 0 rgba(255,255,255,0.18) inset',
        border: '1px solid rgba(255,255,255,0.12)',
      },
      secondary: {
        background: 'linear-gradient(135deg, var(--color-secondary-val), hsl(25, 95%, 42%))',
        color: '#fff',
        boxShadow: '0 4px 18px var(--glow-warm), 0 1px 0 rgba(255,255,255,0.18) inset',
        border: '1px solid rgba(255,255,255,0.12)',
      },
      outline: {
        background: 'var(--glass-card-bg)',
        backdropFilter: 'blur(14px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
        color: 'var(--color-primary-val)',
        border: '1.5px solid var(--glass-inner-border)',
        boxShadow: 'var(--glass-shadow)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-fg)',
      },
      glass: {
        background: 'var(--glass-card-bg)',
        backdropFilter: 'blur(14px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
        color: 'var(--color-fg)',
        border: '1px solid var(--glass-inner-border)',
        boxShadow: 'var(--glass-shadow)',
      },
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
