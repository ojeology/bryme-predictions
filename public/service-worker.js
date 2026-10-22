// Self-unregistering service worker to clear legacy ad push notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister();
});
