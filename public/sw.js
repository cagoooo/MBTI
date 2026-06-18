/**
 * MBTI 校園奇遇記 — Service Worker
 *
 * ⚠️ 重要：__BUILD_VERSION__ 是 build-time 注入的占位字串
 *    由 scripts/gen-version.mjs 在 prebuild 時替換成 e.g. "20260517-0530-abc1234"
 *    這是讓 SW 內容每次 build 都變 (byte-different) → 瀏覽器才會偵測到更新
 *
 * 策略 (依 skill pwa-cache-bust):
 *   - HTML / navigate / version.json → network-first (確保總是最新)
 *   - Next.js hashed assets (_next/static/*) → cache-first (檔名已含 hash 是 cache-bust)
 *   - 音檔 /audio/* → cache-first (預載入 + 之後 instant)
 *   - 其他 → network-first 預設安全
 *
 * 版本變動 → activate 時自動清掉所有 stale caches → 強迫拿新 chunks
 */

const BUILD_VERSION = "20260618-0309-97d7bc8";
const CACHE_VERSION = `mbti-${BUILD_VERSION}`;
const HTML_CACHE = `${CACHE_VERSION}-html`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

function shouldSkip(url) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  // 排除非本站 Origin 的請求（例如 Firebase、Google APIs 等第三方請求）
  if (url.origin !== self.location.origin) return true;
  return false;
}

self.addEventListener("install", (event) => {
  // 不等舊 SW 退場，立刻接管
  self.skipWaiting();
  // 預載 offline.html 確保斷網時隨時可用
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(HTML_CACHE);
        await cache.add(new Request("./offline.html", { cache: "reload" }));
      } catch (e) {
        // 預載失敗不影響 install
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 清掉所有非當前版本的 cache (BUILD_VERSION 不同就會被清)
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
      // 通知所有 clients 新 SW 已就緒 → SwRegister 收到後可決定要不要 reload
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: "SW_ACTIVATED", version: BUILD_VERSION });
      }
    })(),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200 && fresh.type !== "opaque") {
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // navigate request 沒快取也找不到 → 回 offline.html fallback
    if (request.mode === "navigate") {
      const offlineUrl = new URL("./offline.html", self.location.href).toString();
      const offline = await cache.match(offlineUrl) || await cache.match("./offline.html");
      if (offline) return offline;
    }
    return new Response("Network unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
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

  // version.json: 永遠 network-only 不 cache (給版本檢查用)
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

// 接收主執行緒指令
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
  if (event.data?.type === "GET_VERSION") {
    event.source?.postMessage({ type: "SW_VERSION", version: BUILD_VERSION });
  }
});
