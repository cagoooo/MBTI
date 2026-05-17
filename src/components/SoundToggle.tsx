"use client";

import { useEffect, useState } from "react";
import { isBgmOn, isMuted, setBgmOn, setMuted, startBgm, stopBgm, unlock } from "@/lib/sound";

interface Props {
  /** 是否在這個頁面啟動 BGM */
  withBgm?: boolean;
}

export default function SoundToggle({ withBgm = false }: Props) {
  const [muted, setMutedState] = useState(false);
  const [bgm, setBgmState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMutedState(isMuted());
    setBgmState(isBgmOn());

    // 在使用者首次互動時 unlock + 啟動 BGM
    const onFirstInteract = () => {
      unlock();
      if (withBgm && isBgmOn() && !isMuted()) startBgm();
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
    window.addEventListener("pointerdown", onFirstInteract, { once: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withBgm]);

  // 離開頁面 / 卸載時停掉 BGM (避免在 result/types 等頁面繼續響)
  useEffect(() => {
    if (!withBgm) return;
    return () => {
      stopBgm();
    };
  }, [withBgm]);

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    if (next) stopBgm();
    else if (withBgm && isBgmOn()) startBgm();
  }

  function toggleBgm() {
    const next = !bgm;
    setBgmState(next);
    setBgmOn(next);
    if (!next) stopBgm();
    else if (!muted && withBgm) startBgm();
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
      {withBgm && (
        <button
          onClick={toggleBgm}
          title={bgm ? "關閉背景音樂" : "開啟背景音樂"}
          aria-label={bgm ? "關閉背景音樂" : "開啟背景音樂"}
          disabled={muted}
          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur border-2 border-[var(--color-ink)]/15 shadow-md flex items-center justify-center text-lg hover:scale-110 transition disabled:opacity-40"
        >
          {bgm ? "🎵" : "🎶"}
        </button>
      )}
    </div>
  );
}
