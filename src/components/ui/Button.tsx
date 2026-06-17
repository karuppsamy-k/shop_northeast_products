import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, style, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none disabled:opacity-50 cursor-pointer select-none";

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-13 px-8 text-base",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--color-primary-val)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(232,85,62,0.35)',
      },
      secondary: {
        background: 'var(--color-secondary-val)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(245,166,35,0.3)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--color-primary-val)',
        border: '2px solid var(--color-primary-val)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-fg)',
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
