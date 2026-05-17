"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FONT_SCALE_LABELS,
  TTS_RATE_BOUNDS,
  applyFontScale,
  getFontScale,
  getTtsRate,
  isZhuyinOn,
  setFontScale,
  setTtsRate,
  setZhuyinOn,
  type FontScale,
} from "@/lib/settings";
import { isTtsAvailable, isTtsOn, speak } from "@/lib/tts";
import { playSound } from "@/lib/sound";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * 浮動「⚙️ 設定」按鈕 — 點開抽屜含:
 *   - 字級縮放 (小 / 中 / 大 / 特大)
 *   - TTS 朗讀速度 slider
 *   - PWA 安裝到桌面 (若支援)
 *
 * 全站只有一個 instance，掛在 layout.tsx。
 */
export default function SettingsPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScaleState] = useState<FontScale>("md");
  const [ttsRate, setTtsRateState] = useState<number>(1.0);
  const [zhuyin, setZhuyinState] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 初始化 + 套用字級
    const fs = getFontScale();
    setFontScaleState(fs);
    applyFontScale(fs);
    setTtsRateState(getTtsRate());
    setZhuyinState(isZhuyinOn());

    // 偵測是否已安裝為 PWA
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(isStandalone);
    }

    // PWA install prompt event
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function pickFontScale(v: FontScale) {
    playSound("pop");
    setFontScale(v);
    setFontScaleState(v);
  }

  function toggleZhuyin() {
    const next = !zhuyin;
    playSound(next ? "toggleOn" : "toggleOff");
    setZhuyinState(next);
    setZhuyinOn(next);
  }

  function onRateChange(v: number) {
    setTtsRate(v);
    setTtsRateState(v);
  }

  function previewTts() {
    if (!isTtsAvailable()) return;
    if (!isTtsOn()) {
      // 暫時開個 utterance 預覽 (繞過 isTtsOn 檢查不寫 storage)
      try {
        const u = new SpeechSynthesisUtterance("這個速度聽起來怎麼樣？");
        u.lang = "zh-TW";
        u.rate = ttsRate;
        u.pitch = 1.08;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {}
    } else {
      speak("這個速度聽起來怎麼樣？");
    }
  }

  async function handleInstall() {
    if (!installEvent) return;
    playSound("coin");
    try {
      await installEvent.prompt();
      const result = await installEvent.userChoice;
      if (result.outcome === "accepted") {
        setInstallEvent(null);
      }
    } catch {}
  }

  function toggleOpen() {
    playSound(open ? "toggleOff" : "toggleOn");
    setOpen(!open);
  }

  if (!mounted) return null;

  const ttsAvail = isTtsAvailable();

  return (
    <>
      {/* 浮動按鈕 (在 SoundToggle 上方) */}
      <button
        onClick={toggleOpen}
        title="更多設定 (字級 / 朗讀速度 / 安裝 App)"
        aria-label="更多設定"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 w-11 h-11 rounded-full bg-white/90 backdrop-blur border-2 border-[var(--color-ink)]/15 shadow-md flex items-center justify-center text-lg hover:scale-110 transition print:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}
      >
        {open ? "✕" : "⚙️"}
      </button>

      {/* 抽屜 panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-20 right-3 sm:bottom-24 sm:right-4 z-40 w-[min(92vw,360px)] bg-white rounded-3xl border-2 border-[var(--color-ink)]/15 shadow-2xl p-5 print:hidden"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 116px)" }}
          >
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span>⚙️</span> 適性設定
            </h3>

            {/* 字級 */}
            <section className="mb-5">
              <label className="block text-sm font-bold mb-2">📏 文字大小</label>
              <div className="grid grid-cols-4 gap-1">
                {(Object.keys(FONT_SCALE_LABELS) as FontScale[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => pickFontScale(v)}
                    className={`py-2 rounded-xl text-sm font-bold transition ${
                      fontScale === v
                        ? "bg-[var(--color-coral)] text-white shadow-md"
                        : "bg-[var(--color-cream)] hover:bg-[var(--color-coral)]/20"
                    }`}
                  >
                    {FONT_SCALE_LABELS[v]}
                  </button>
                ))}
              </div>
            </section>

            {/* 注音 (給低年級) */}
            <section className="mb-5">
              <label className="block text-sm font-bold mb-2">📝 注音標示（低年級友善）</label>
              <button
                onClick={toggleZhuyin}
                className={`w-full py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${
                  zhuyin
                    ? "bg-amber-100 border-2 border-amber-400 text-amber-900 ring-2 ring-amber-300/40"
                    : "bg-[var(--color-cream)] border-2 border-transparent hover:bg-amber-50"
                }`}
              >
                <span className="text-xl">{zhuyin ? "🔠" : "🔡"}</span>
                <span>{zhuyin ? "注音已開（一二年級友善）" : "點此開啟注音"}</span>
              </button>
              {zhuyin && (
                <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                  ✨ 全站中文字會自動加上注音。例如：
                  <ruby className="mx-1">校<rt>ㄒㄧㄠˋ</rt></ruby>
                  <ruby className="mr-1">園<rt>ㄩㄢˊ</rt></ruby>
                </p>
              )}
            </section>

            {/* TTS 朗讀速度 */}
            {ttsAvail && (
              <section className="mb-5">
                <label className="block text-sm font-bold mb-2 flex items-center justify-between">
                  <span>🗣️ 朗讀速度</span>
                  <span className="text-xs font-mono text-[var(--color-ink)]/60">
                    {ttsRate.toFixed(2)}x
                  </span>
                </label>
                <input
                  type="range"
                  min={TTS_RATE_BOUNDS.min}
                  max={TTS_RATE_BOUNDS.max}
                  step={0.05}
                  value={ttsRate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full accent-[var(--color-coral)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-ink)]/50 mt-1">
                  <span>慢 (低年級)</span>
                  <span>標準</span>
                  <span>快</span>
                </div>
                <button
                  onClick={previewTts}
                  className="mt-2 w-full px-3 py-1.5 rounded-xl bg-amber-100 border-2 border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
                >
                  🔊 試聽
                </button>
              </section>
            )}

            {/* PWA install */}
            <section className="border-t-2 border-[var(--color-ink)]/10 pt-4">
              <label className="block text-sm font-bold mb-2">📱 安裝到桌面</label>
              {installed ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3">
                  ✅ 已安裝為 App，可從桌面打開
                </p>
              ) : installEvent ? (
                <button
                  onClick={handleInstall}
                  className="btn-3d w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black hover:opacity-95 transition"
                >
                  📲 安裝 MBTI 校園奇遇記
                </button>
              ) : (
                <details className="text-xs text-[var(--color-ink)]/60">
                  <summary className="cursor-pointer hover:text-[var(--color-coral)]">
                    這個瀏覽器暫時不支援自動安裝
                  </summary>
                  <div className="mt-2 leading-relaxed space-y-1">
                    <p>📱 <strong>iPhone Safari</strong>：點分享按鈕 → 加入主畫面</p>
                    <p>🤖 <strong>Android Chrome</strong>：選單三點 → 安裝應用程式</p>
                    <p>💻 <strong>桌面 Chrome</strong>：網址列右側點安裝圖示</p>
                  </div>
                </details>
              )}
            </section>

            <p className="text-xs text-[var(--color-ink)]/40 mt-4 text-center">
              所有設定都會記住，下次進來不用再設
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
