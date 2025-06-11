import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/service-worker.js');
  wb.register();
  
  // Cache course content for offline access
  const cacheCourses = async () => {
    const cache = await caches.open('courses-v1');
    const response = await fetch('/api/courses');
    cache.put('/api/courses', response);
  };
  
  // Refresh cache when online
  window.addEventListener('online', cacheCourses);
}