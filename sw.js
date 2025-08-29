// 缓存名称和版本
const CACHE_NAME = 'jiangnan-travel-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/jiangnan_website.html',
  '/pricing.html',
  '/language.html',
  '/search.html',
  '/admin.html',
  '/admin-dashboard.html',
  '/articles/wuzhen-tour.html',
  '/articles/hangzhou-food.html',
  '/articles/suzhou-gardens.html'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除不在白名单中的缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求并使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 克隆请求，因为请求是一个流，只能使用一次
        const fetchRequest = event.request.clone();
        
        // 如果没有缓存，则发起网络请求
        return fetch(fetchRequest).then(
          response => {
            // 检查响应是否有效
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是一个流，只能使用一次
            const responseToCache = response.clone();
            
            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                // 只缓存GET请求
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          }
        );
      })
  );
});

// 图片特殊处理 - 使用网络优先策略
self.addEventListener('fetch', event => {
  // 只处理图片请求
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)) {
    event.respondWith(
      // 先尝试网络请求
      fetch(event.request)
        .then(response => {
          // 克隆响应
          const responseToCache = response.clone();
          
          // 将响应添加到缓存
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // 如果网络请求失败，则尝试从缓存获取
          return caches.match(event.request);
        })
    );
  }
});