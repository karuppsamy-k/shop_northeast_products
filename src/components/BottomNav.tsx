
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Info, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid, label: 'Stores', path: '/categories' },
    { icon: Info, label: 'About', path: '/about' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[999]"
      style={{
        background: 'var(--glass-panel-bg)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 24px rgba(80, 100, 200, 0.10)',
        /* Shimmer strip inline — avoids overflow:hidden breaking fixed */
        borderImage: 'linear-gradient(90deg, transparent, var(--shimmer-2), var(--shimmer-3), transparent) 1 0 0 0',
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all"
            >
              <div
                className="w-10 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                        boxShadow: '0 3px 12px var(--glow-primary)',
                      }
                    : { background: 'transparent' }
                }
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? '#fff' : 'var(--color-muted-fg)' }}
                />
              </div>
              <span
                className="text-[9px] font-semibold tracking-wide"
                style={{ color: isActive ? 'var(--color-primary-val)' : 'var(--color-muted-fg)' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
