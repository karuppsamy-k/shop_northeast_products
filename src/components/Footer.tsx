import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      className="border-t py-10 mt-16 md:py-16"
      style={{
        background: 'var(--color-card-bg)',
        borderColor: 'var(--color-border-val)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                style={{ background: 'var(--color-primary-val)' }}
              >
                H
              </div>
              <span className="text-xl font-bold">
                <span style={{ color: 'var(--color-fg)' }}>Sathish</span>
                <span style={{ color: 'var(--color-primary-val)' }}>S</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted-fg)' }}>
              Authentic flavors from Northeast India, delivered fresh to your doorstep.
            </p>
            <div className="flex gap-3">
              {['G', 'f', 'in'].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: 'rgba(232,85,62,0.12)', color: 'var(--color-primary-val)' }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--color-fg)' }}>About Us</h4>
            <ul className="space-y-2">
              {['Our Story', 'Our Mission', 'Careers', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--color-muted-fg)' }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--color-fg)' }}>Our Menu</h4>
            <ul className="space-y-2">
              {['Fresh Vegetables', 'Northeast Tea', 'Handmade Foods', 'Pickles', 'Organic Products'].map((item) => (
                <li key={item}>
                  <Link to="/categories" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--color-muted-fg)' }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--color-fg)' }}>Our Location</h4>
            <ul className="space-y-2">
              {['Guwahati', 'Shillong', 'Imphal', 'Agartala'].map((item) => (
                <li key={item}>
                  <span className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-2"
          style={{ borderColor: 'var(--color-border-val)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
            © 2025 Sathish. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
            Powered by Sathish
          </p>
        </div>
      </div>
    </footer>
  );
};
