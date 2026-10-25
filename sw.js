// 두발로 PWA 서비스워커 — 최소 오프라인 캐시 (v4.2: 앱 기능 포팅판)
const CACHE = "dobalro-v4-5";
const CORE_ASSETS = [
  "./index.html",
  "./config.js",
  "./manifest.json",
  "./places.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패 시 캐시 (Supabase·지도·날씨 등 외부 요청은 그대로 통과)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
