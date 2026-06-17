
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid, label: 'Stores', path: '/categories' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'var(--color-card-bg)',
        borderColor: 'var(--color-border-val)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
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
              className="flex flex-col items-center justify-center gap-1 w-full h-full transition-all"
              style={{ color: isActive ? 'var(--color-primary-val)' : 'var(--color-muted-fg)' }}
            >
              {isActive ? (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(232,85,62,0.12)' }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
              ) : (
                <Icon className="w-5 h-5" strokeWidth={2} />
              )}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
