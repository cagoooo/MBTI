"use client";

import SoundToggle from "./SoundToggle";

/** 首頁專用：背景音樂控制 (掛在 layout 之外，避免 SSR 不一致) */
export default function BgMusicMount() {
  return <SoundToggle withBgm />;
}
