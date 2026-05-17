"use client";

import { useEffect } from "react";
import { playBgm, type BgmTrackId } from "@/lib/sound";

interface Props {
  track: BgmTrackId;
}

/**
 * 控制當前頁面要播哪首 BGM。
 *
 * - mount 時呼叫 playBgm(track) — 自動 cross-fade 從上一首切到當前 track
 * - unmount 時不 stopBgm（讓下一頁 BgmController 接手切換）
 * - autoplay 第一次未必能 play，由 SoundToggle 的 onFirstInteract 補觸發
 *
 * 用法：
 *   首頁：    <BgmController track="home" />
 *   遊戲頁：  <BgmController track="game" />
 *   結果頁：  <BgmController track="result" />
 */
export default function BgmController({ track }: Props) {
  useEffect(() => {
    playBgm(track);
    // 故意不在 unmount 時 stopBgm — 因為下一頁的 BgmController 會接手 cross-fade 切換
    // 若使用者離開到沒有 BgmController 的頁面（理論上不會），可呼叫 stopBgm
  }, [track]);
  return null;
}
