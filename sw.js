// 每次修改代碼後，請務必更換這個版本號（例如改日期）
const CACHE_NAME = 'hugbear-20260204-v4'; 
const ASSETS = [
    './',
    './index.html',
    './logo.png',
    './line.png',
    './linepay.png',
    './manifest.json'
];

// 監聽來自頁面的強制更新指令
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            // 移除這裡的 skipWaiting，改由 index.html 的按鈕控制
    );
});

// 激活 Service Worker 並清理舊緩存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 如果不是當前的版本，就刪除它
                    if (cacheName !== CACHE_NAME) {
                        console.log('清理舊緩存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即取得頁面控制權
    );
});
// 攔截請求並從緩存中提供
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果緩存中有請求的資源，則返回緩存的資源
                if (response) {
                    return response;
                }
                // 否則，從網絡獲取資源
                return fetch(event.request).then(
                    (response) => {
                        // 檢查是否為有效響應
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // 克隆響應，因為響應是流，只能使用一次
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
