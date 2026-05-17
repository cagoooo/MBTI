"use client";

import { useEffect, useRef, useState } from "react";
import SwUpdateBanner from "./SwUpdateBanner";

/**
 * Service Worker 註冊 + 版本檢查 (依 skill pwa-cache-bust)
 *
 * 兩條線並行偵測新版本, 任一條看到都會跳 banner:
 *
 *   線 A: SW lifecycle 事件 (最可靠)
 *     1. register() 加 updateViaCache: "none" → 繞過瀏覽器 HTTP cache
 *     2. 監聽 updatefound → 新 SW 在 installing
 *     3. installing 完成 (state === "installed") + 有舊 controller → 跳 banner
 *     4. 監聽 message: SW_ACTIVATED → 新 SW 已 claim, 跳 banner
 *     5. 定期 reg.update() (10 分鐘一次, 跟 GitHub Pages CDN cache 對齊)
 *
 *   線 B: fetch version.json polling (備胎)
 *     1. 首次 5 秒檢查 (不是 30 秒, 國小生很快就關頁面)
 *     2. visibilitychange / pageshow / focus / online 都 trigger 檢查
 *     3. 每 3 分鐘 polling
 *     4. APP_VERSION (build-time 烤進) !== version.json.version → 跳 banner
 *
 * Dev 環境跳過 SW 註冊 (避免 hot reload 衝突)。
 */

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 分鐘 polling version.json
const SW_UPDATE_CHECK_MS = 10 * 60 * 1000; // 10 分鐘主動 reg.update() (跟 CDN cache 對齊)

interface VersionPayload {
  version: string;
  buildTime?: string;
  commitMessage?: string;
}

export default function SwRegister() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const swUrl = `${BASE_PATH}/sw.js`;
    const scope = `${BASE_PATH}/`;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    // ── 線 A: SW lifecycle ──────────────────────────────
    function watchInstalling(worker: ServiceWorker | null) {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        // 新 SW 安裝完成且有舊 controller → 表示是「更新」而非「首次安裝」
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setLatestVersion((prev) => prev ?? "新版本就緒");
        }
      });
    }

    navigator.serviceWorker
      .register(swUrl, { scope, updateViaCache: "none" })
      .then((reg) => {
        if (cancelled) return;
        registration = reg;

        // 已經有 worker 在 installing → 馬上盯
        if (reg.installing) watchInstalling(reg.installing);
        if (reg.waiting && navigator.serviceWorker.controller) {
          // 有等待中的 SW 表示已經有新版本待激活
          setLatestVersion("新版本待更新");
        }

        // 監聽未來的 updatefound 事件
        reg.addEventListener("updatefound", () => {
          watchInstalling(reg.installing);
        });

        // 立刻檢查一次
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("[SW] 註冊失敗", err);
      });

    // SW activated 訊息 (從 sw.js postMessage 過來)
    function onSwMessage(event: MessageEvent) {
      const data = event.data as { type?: string; version?: string } | undefined;
      if (data?.type === "SW_ACTIVATED" && data.version && data.version !== APP_VERSION) {
        setLatestVersion(data.version);
      }
    }
    navigator.serviceWorker.addEventListener("message", onSwMessage);

    // ── 線 B: fetch version.json polling ─────────────────
    async function checkVersion() {
      if (cancelled) return;
      try {
        // ?t= 對 GitHub Pages CDN 沒用但對瀏覽器 cache 有用 (雙保險)
        const r = await fetch(`${BASE_PATH}/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = (await r.json()) as VersionPayload;
        if (data.version && data.version !== APP_VERSION) {
          setLatestVersion(data.version);
        }
        // 同時主動戳一下 SW 看有沒有新版本
        if (registration) {
          registration.update().catch(() => {});
        }
      } catch {
        // 網路失敗等: 靜靜略過
      }
    }

    // 首次 5 秒檢查 (避開頁面剛載入的密集網路活動但別等太久)
    const firstCheck = window.setTimeout(checkVersion, 5_000);
    // 定期 polling
    const periodic = window.setInterval(checkVersion, POLL_INTERVAL_MS);
    // 主動 SW update check (跟 CDN cache 對齊)
    const swUpdate = window.setInterval(() => {
      registration?.update().catch(() => {});
    }, SW_UPDATE_CHECK_MS);

    // 多種 trigger: focus / visibility / pageshow / online — 任一觸發就 check
    function triggerCheck() {
      checkVersion();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") triggerCheck();
    }
    function onPageShow(e: PageTransitionEvent) {
      // BFCache restore 時也 trigger
      if (e.persisted) triggerCheck();
    }

    window.addEventListener("focus", triggerCheck);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", triggerCheck);

    return () => {
      cancelled = true;
      window.clearTimeout(firstCheck);
      window.clearInterval(periodic);
      window.clearInterval(swUpdate);
      window.removeEventListener("focus", triggerCheck);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", triggerCheck);
      navigator.serviceWorker.removeEventListener("message", onSwMessage);
    };
  }, []);

  async function handleUpdate() {
    if (typeof window === "undefined") return;
    if (reloadingRef.current) return;
    reloadingRef.current = true;
    try {
      // 通知 SW 清 caches
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHES" });
      }
      // 也直接從主執行緒清 caches (雙保險)
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // 跟所有 SW registrations 說滾, 強迫拿新 sw.js
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => {})));
      }
    } catch {}
    // Hard reload — 加 query string 確保拿新 HTML
    const url = new URL(window.location.href);
    url.searchParams.set("v", Date.now().toString());
    window.location.replace(url.toString());
  }

  function handleDismiss() {
    setLatestVersion(null);
  }

  if (!latestVersion) return null;
  return (
    <SwUpdateBanner
      currentVersion={APP_VERSION}
      newVersion={latestVersion}
      onUpdate={handleUpdate}
      onDismiss={handleDismiss}
    />
  );
}
