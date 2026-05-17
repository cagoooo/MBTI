"use client";

import { useEffect, useState } from "react";
import {
  isBgmOn,
  isMuted,
  playBgm,
  playSound,
  setBgmOn,
  setMuted,
  stopBgm,
  unlock,
} from "@/lib/sound";

/**
 * 浮動音效控制按鈕（靜音 / BGM 開關）。
 *
 * 全站只需一個 instance（建議放在 layout.tsx）。
 * 各頁面用 <BgmController track="..."/> 指定要播哪首 BGM。
 *
 * 第一次使用者互動時自動 unlock + 呼叫 playBgm() 觸發當前 track（用於繞過 autoplay policy）。
 */
export default function SoundToggle() {
  const [muted, setMutedState] = useState(false);
  const [bgm, setBgmState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMutedState(isMuted());
    setBgmState(isBgmOn());

    // 第一次互動：unlock SFX + 觸發當前 track 的 BGM
    const onFirstInteract = () => {
      unlock();
      if (isBgmOn() && !isMuted()) {
        // BgmController 在 page mount 時就呼叫了 playBgm，但因 autoplay 被擋
        // 這裡再觸發一次（同 trackId 會 no-op，但若 autoplay 失敗則會重啟）
        // 預設 home，BgmController 會立刻覆蓋成正確的 track
        playBgm("home");
      }
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
    window.addEventListener("pointerdown", onFirstInteract, { once: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, []);

  // 注意：故意不在 unmount 時 stopBgm — 浮動按鈕應該全站存在
  // 若使用者關閉頁面 / 跳到外部，瀏覽器會自動處理

  function toggleMute() {
    const next = !muted;
    if (!next) playSound("toggleOn");
    else playSound("toggleOff");
    setMutedState(next);
    setMuted(next);
    if (next) stopBgm();
    else if (isBgmOn()) playBgm("home"); // 解除靜音後重啟（BgmController 會切到正確 track）
  }

  function toggleBgm() {
    const next = !bgm;
    playSound(next ? "toggleOn" : "toggleOff");
    setBgmState(next);
    setBgmOn(next);
    if (!next) stopBgm();
    else if (!muted) playBgm("home"); // 開啟 BGM 後重啟（BgmController 會切到正確 track）
  }

  if (!mounted) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 flex gap-2 print:hidden">
      <button
        onClick={toggleMute}
        title={muted ? "開啟音效" : "靜音"}
        aria-label={muted ? "開啟音效" : "靜音"}
        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur border-2 border-[var(--color-ink)]/15 shadow-md flex items-center justify-center text-lg hover:scale-110 transition"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <button
        onClick={toggleBgm}
        title={bgm ? "關閉背景音樂" : "開啟背景音樂"}
        aria-label={bgm ? "關閉背景音樂" : "開啟背景音樂"}
        disabled={muted}
        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur border-2 border-[var(--color-ink)]/15 shadow-md flex items-center justify-center text-lg hover:scale-110 transition disabled:opacity-40"
      >
        {bgm ? "🎵" : "🎶"}
      </button>
    </div>
  );
}
