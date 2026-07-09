import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setPanelOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all"
        >
          <div className="w-10 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 bg-transparent">
            <Bell className="w-5 h-5 text-[var(--color-muted-fg)]" strokeWidth={2} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-2 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
                  boxShadow: '0 2px 8px var(--glow-primary)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </div>
          <span className="text-[9px] font-semibold tracking-wide text-[var(--color-muted-fg)]">
            Alerts
          </span>
        </button>

        <AnimatePresence>
          {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="relative p-2.5 rounded-full transition-all hover:bg-white/25"
        style={{ color: 'var(--color-fg)' }}
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163,94%,18%))',
              boxShadow: '0 2px 8px var(--glow-primary)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
