"use client";

import { useEffect, useState } from "react";
import SwUpdateBanner from "./SwUpdateBanner";

/**
 * Service Worker 註冊 + 版本檢查（依 skill pwa-cache-bust）
 *
 * 流程：
 *   1. 註冊 /sw.js（含 basePath）
 *   2. 第一次載入時記錄當前 version（從 NEXT_PUBLIC_APP_VERSION env inline）
 *   3. 每 5 分鐘 fetch version.json 比對
 *   4. 若版本變動 → 跳 SwUpdateBanner
 *   5. 使用者點 banner「立刻更新」→ 清 caches + reload
 *
 * Dev 環境跳過 SW 註冊（避免 hot reload 衝突）。
 */

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 分鐘

interface VersionPayload {
  version: string;
  buildTime?: string;
  commitMessage?: string;
}

export default function SwRegister() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // 1. 註冊 SW
    const swUrl = `${BASE_PATH}/sw.js`;
    const scope = `${BASE_PATH}/`;
    navigator.serviceWorker
      .register(swUrl, { scope })
      .then((reg) => {
        // 主動觸發更新檢查
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("[SW] 註冊失敗", err);
      });

    // 2. 定期 fetch version.json 比對
    let cancelled = false;
    async function checkVersion() {
      if (cancelled) return;
      try {
        const r = await fetch(`${BASE_PATH}/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = (await r.json()) as VersionPayload;
        if (data.version && data.version !== APP_VERSION) {
          setLatestVersion(data.version);
          // 通知 SW 更新檢查（之後 fetch new chunks 會走 network-first 拿到新版）
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
              regs.forEach((reg) => reg.update().catch(() => {}));
            });
          }
        }
      } catch {
        // 網路失敗等：靜靜略過
      }
    }

    // 首次延遲 30s 檢查（避開頁面剛載入的密集網路活動）
    const firstCheck = window.setTimeout(checkVersion, 30_000);
    const periodic = window.setInterval(checkVersion, CHECK_INTERVAL_MS);

    // 視窗 focus 時也檢查（從別 tab 切回來）
    const onFocus = () => checkVersion();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearTimeout(firstCheck);
      window.clearInterval(periodic);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function handleUpdate() {
    if (typeof window === "undefined") return;
    try {
      // 通知 SW 清 caches
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHES" });
      }
      // 清 Cache Storage（雙保險）
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
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
