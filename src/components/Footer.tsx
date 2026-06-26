
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      className="mt-16 glass-shimmer"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(24px) saturate(1.7)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.7)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 32px rgba(80, 100, 200, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))',
                  boxShadow: '0 3px 12px var(--glow-primary)',
                }}
              >
                NF
              </div>
              <span className="text-xl font-bold">
                <span style={{ color: 'var(--color-fg)' }}>Northeast</span>
                <span style={{ color: 'var(--color-primary-val)' }}>FreshMart</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted-fg)' }}>
              Authentic flavors from Northeast India, delivered fresh to your doorstep.
            </p>

          </div>

          {/* About */}
          <div>
            <Link
              to="/about#about-us"
              className="font-bold text-sm mb-4 uppercase tracking-wide block hover:opacity-80 transition-opacity"
              style={{ color: 'var(--color-fg)' }}
            >
              About Us
            </Link>
            <ul className="space-y-2">
              {[
                { name: 'Our Story', hash: '#our-story' },
                { name: 'Our Mission', hash: '#our-mission' },
                { name: 'Careers', hash: '#careers' },
                { name: 'Contact Us', hash: '#contact-us' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={`/about${item.hash}`}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: 'var(--color-muted-fg)' }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--color-fg)' }}>
              Our Menu
            </h4>
            <ul className="space-y-2">
              {['Fresh Vegetables', 'Northeast Tea', 'Handmade Foods', 'Pickles', 'Organic Products'].map((item) => (
                <li key={item}>
                  <Link
                    to="/categories"
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: 'var(--color-muted-fg)' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--color-fg)' }}>
              Our Location
            </h4>
            <ul className="space-y-2">
              {['Guwahati', 'Shillong', 'Imphal', 'Agartala'].map((item) => (
                <li key={item}>
                  <span className="text-sm" style={{ color: 'var(--color-muted-fg)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-2"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-muted-fg)' }}>
            © 2026 Northeast FreshMart. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};
