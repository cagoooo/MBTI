"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "mbti-pwa-install-banner";
const VISIT_KEY = "mbti-visit-count";

/**
 * PWA 安裝主動邀請 Banner
 *
 * 顯示時機: 第 2 次造訪後 + 上次拒絕後 ≥ 7 天 + 瀏覽器確認可安裝
 * 顯示位置: 底部置中 toast 風 banner, 不擋內容
 * 互動: 「安裝」「之後再說 (7 天不再問)」
 *
 * 已掛在 SettingsPanel 內的 install button 是被動入口,
 * 這個 banner 是主動推薦, 兩者並存
 */
export default function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 已安裝就不顯示
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // 累計造訪次數
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    // 上次拒絕的時間, 距今 < 7 天就不再顯示
    const lastDismissed = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const dismissedRecently = lastDismissed && Date.now() - lastDismissed < sevenDaysMs;
    if (dismissedRecently) return;

    // 至少造訪 2 次才推薦 (第一次不打擾)
    if (visits < 2) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setInstallEvent(evt);
      // 稍等 3 秒讓使用者先看到內容
      setTimeout(() => setShow(true), 3000);
    }

    function onInstalled() {
      setInstalled(true);
      setShow(false);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      } else {
        // 使用者按 dismissed, 記時間
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    } catch {
      // popup 被擋等
    }
    setShow(false);
    setInstallEvent(null);
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  }

  if (installed) return null;

  return (
    <AnimatePresence>
      {show && installEvent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed left-1/2 -translate-x-1/2 z-40 w-[min(94vw,440px)] print:hidden"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
          }}
          role="dialog"
          aria-label="安裝 App 邀請"
        >
          <div
            style={{
              background: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "6px 6px 0 var(--ink)",
              padding: "14px 16px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -12,
                left: 16,
                background: "var(--coral)",
                color: "#fff",
                padding: "3px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: 3,
                fontWeight: 800,
              }}
            >
              📱 PWA · INSTALL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>🏫</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="f-serif" style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
                  把校園奇遇記裝到桌面?
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.5 }}>
                  一鍵打開, 不用每次找書籤, 離線也能玩 ✨
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleInstall}
                className="btn-start"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "12px 14px",
                  fontSize: 14,
                  minHeight: 44,
                }}
              >
                <span>📲</span>
                <span>立刻安裝</span>
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: "2px solid var(--ink)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  minHeight: 44,
                  color: "var(--ink)",
                }}
              >
                之後再說
              </button>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              點「之後再說」7 天內不會再問
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
