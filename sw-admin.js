const CACHE_NAME = 'hugbear-admin-v1';
const ASSETS_TO_CACHE = [
  './admin.html',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 快取已安裝');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] 移除舊快取', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
  // 對於 Supabase API 請求，不進行快取，直接發送請求
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果有快取就回傳快取，沒有就去網路上抓
        return response || fetch(event.request);
      })
  );
});
