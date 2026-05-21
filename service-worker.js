const CACHE_NAME = "onulanbu-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 설치 시 핵심 파일 캐시
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 오래된 캐시 정리
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener("fetch", e => {
  // API 요청은 캐시 사용 안 함
  if (e.request.url.includes("supabase") || e.request.url.includes("functions")) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
