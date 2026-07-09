import { useState, useEffect } from 'react';
import { BellRing, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotificationEnforcer = ({ children }: { children: React.ReactNode }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  const checkPermission = () => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }
    setPermission(Notification.permission);
  };

  useEffect(() => {
    checkPermission();
    // Poll for permission changes in case user goes to browser settings
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (err) {
      console.error('Failed to request notification permission', err);
    }
  };

  if (!isSupported) {
    // If the browser (like an old iOS Safari) simply does not support Notification,
    // we should not block the app because they can never enable it.
    return <>{children}</>;
  }

  if (permission === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="glass-card max-w-sm w-full p-8 text-center"
        style={{ background: 'var(--glass-panel-bg)' }}
      >
        {permission === 'denied' ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
                 style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Notifications Blocked</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              You have blocked notifications for this site. This app requires notifications to be enabled to proceed. 
              <br/><br/>
              Please tap the lock icon in your browser's address bar, choose <b>Site Settings</b>, and switch Notifications to <b>Allow</b>.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
                 style={{ background: 'var(--glow-primary)', color: 'var(--color-primary-val)' }}>
              <BellRing className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Enable Notifications</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              We need to send you important updates about your orders. You must allow notifications to use Northeast FreshMart.
            </p>
            <button 
              onClick={requestPermission}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--color-primary-val)' }}
            >
              Allow Notifications
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
