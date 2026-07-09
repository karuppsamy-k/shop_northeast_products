export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showSystemNotification = async (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js');
        }
        if (registration) {
          registration.showNotification(title, {
            body,
            icon: '/vite.svg'
          } as any);
          return;
        }
      }
    } catch (e) {
      console.warn('SW notification failed, falling back to Notification API', e);
    }
    
    // Fallback for desktop/browsers that support it without SW
    new Notification(title, {
      body,
      icon: '/vite.svg'
    } as any);
  }
};
