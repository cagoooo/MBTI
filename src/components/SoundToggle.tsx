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
import { initTts, isTtsAvailable, isTtsOn, setTtsOn, speak, stop as stopTts } from "@/lib/tts";

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
  const [tts, setTtsState] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMutedState(isMuted());
    setBgmState(isBgmOn());
    setTtsState(isTtsOn());
    setTtsSupported(isTtsAvailable());
    // 預載 TTS 中文 voice
    if (isTtsAvailable()) void initTts();

    // 第一次互動：unlock SFX + 觸發當前 track 的 BGM
    const onFirstInteract = () => {
      unlock();
      void initTts();
      if (isBgmOn() && !isMuted()) {
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

  function toggleTts() {
    const next = !tts;
    playSound(next ? "toggleOn" : "toggleOff");
    setTtsState(next);
    setTtsOn(next);
    if (!next) {
      stopTts();
    } else {
      // 開啟時唸一句問候，順便驗證聲音可用
      void initTts().then(() => {
        speak("語音導讀已開啟，跟著故事一起進入校園奇遇吧！");
      });
    }
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
      {ttsSupported && (
        <button
          onClick={toggleTts}
          title={tts ? "關閉語音導讀" : "開啟語音導讀（自動朗讀故事）"}
          aria-label={tts ? "關閉語音導讀" : "開啟語音導讀"}
          className={`w-11 h-11 rounded-full backdrop-blur border-2 shadow-md flex items-center justify-center text-lg hover:scale-110 transition ${
            tts
              ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300/40"
              : "bg-white/90 border-[var(--color-ink)]/15"
          }`}
        >
          {tts ? "🗣️" : "🤐"}
        </button>
      )}
    </div>
  );
}
