"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sound";

/** 結果頁進入時播放煙火音效 */
export default function ResultRevealMount() {
  useEffect(() => {
    // 等一下，讓 hero 動畫先進來
    const t = setTimeout(() => playSound("reveal"), 350);
    return () => clearTimeout(t);
  }, []);
  return null;
}
