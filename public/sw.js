/**
 * MBTI 校園奇遇記 — Service Worker
 *
 * 策略（依 skill pwa-cache-bust）:
 *   - HTML / navigate / version.json → network-first (確保總是最新)
 *   - Next.js hashed assets (_next/static/*) → cache-first (檔名已含 hash 是 cache-bust)
 *   - 音檔 /audio/* → cache-first (預載入 + 之後 instant)
 *   - 其他 → network-first 預設安全
 *
 * 版本變動：CACHE_VERSION 改了之後，舊 caches 在 activate 時自動清除。
 * 由 SwRegister 透過 fetch version.json 偵測，跳 Banner 提示使用者重整。
 */

const CACHE_VERSION = "mbti-v1";
const HTML_CACHE = `${CACHE_VERSION}-html`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

// 不能 cache 的條件
function shouldSkip(url) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  // chrome-extension / data / blob 等跳過
  return false;
}

self.addEventListener("install", (event) => {
  // 不等舊 SW 退場，立刻 install
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 清掉所有非當前版本的 cache
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      // 立刻接管所有頁面（不等使用者 reload）
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    // 只 cache 同源、200 OK 的回應
    if (fresh && fresh.status === 200 && fresh.type !== "opaque") {
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.status === 200 && fresh.type !== "opaque") {
    cache.put(request, fresh.clone()).catch(() => {});
  }
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (shouldSkip(url)) return;

  // version.json: 永遠 network-first 不 cache (給版本檢查用)
  if (url.pathname.endsWith("/version.json")) {
    event.respondWith(
      fetch(req, { cache: "no-store" }).catch(async () => {
        const cache = await caches.open(HTML_CACHE);
        return cache.match(req);
      }),
    );
    return;
  }

  // HTML 頁面 / navigate request: network-first
  if (
    req.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/")
  ) {
    event.respondWith(networkFirst(req, HTML_CACHE));
    return;
  }

  // Next.js hashed asset: cache-first (檔名含 hash 永遠 immutable)
  if (
    url.pathname.includes("/_next/static/") ||
    /\.(woff2?|ttf|otf|eot)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 音檔: cache-first (預載入 + reuse)
  if (url.pathname.includes("/audio/")) {
    event.respondWith(cacheFirst(req, AUDIO_CACHE));
    return;
  }

  // 其他: network-first
  event.respondWith(networkFirst(req, STATIC_CACHE));
});

// 接收主執行緒指令（強制清 cache）
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHES") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      })(),
    );
  }
});
