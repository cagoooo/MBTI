"use client";

import { motion } from "framer-motion";
import type { SelStyle } from "@/lib/sel";

/**
 * 4 種 SEL 因應風格的專屬慶祝動畫
 * 跟 TypeCelebration 同模式 — 結果頁進場時播 2-3 秒
 *
 * 設計：每個風格的視覺隱喻
 *   🌸 表達型 — 花朵綻放 + 愛心擴散 (情緒像花一樣盛開)
 *   🧠 思考型 — 燈泡 + 齒輪轉 + 問號→答案 (思緒運轉)
 *   🧘 安撫型 — 月亮升起 + 雲朵飄 + 雪花 (平靜環繞)
 *   🫂 連結型 — 雙手相握 + 心線連結 + 微笑 (人與人之間)
 */

interface Props {
  style: SelStyle;
}

interface AnimEmoji {
  emoji: string;
  start: { x: number; y: number };
  animate: {
    x: number[];
    y: number[];
    rotate?: number[];
    scale?: number[];
  };
  delay?: number;
  duration?: number;
}

const ANIMATIONS: Record<SelStyle, AnimEmoji[]> = {
  express: [
    // 🌸 表達型 — 花朵綻放 + 愛心擴散
    { emoji: "🌸", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40, 50], scale: [0, 1.5, 1.2], rotate: [0, 180] }, duration: 2.5 },
    { emoji: "💖", start: { x: 25, y: 50 }, animate: { x: [25, 15], y: [50, 30], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.3 },
    { emoji: "💖", start: { x: 75, y: 50 }, animate: { x: [75, 85], y: [50, 30], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.3 },
    { emoji: "🌷", start: { x: 30, y: 80 }, animate: { x: [30, 30], y: [80, 20], rotate: [0, 360], scale: [0, 1.2, 0] }, duration: 3, delay: 0.6 },
    { emoji: "🌺", start: { x: 70, y: 80 }, animate: { x: [70, 70], y: [80, 20], rotate: [0, -360], scale: [0, 1.2, 0] }, duration: 3, delay: 0.9 },
    { emoji: "✨", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 10], scale: [0, 1.4, 0] }, duration: 3, delay: 1.2 },
  ],

  solve: [
    // 🧠 思考型 — 燈泡 + 齒輪轉 + 問號→答案
    { emoji: "🧠", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40, 50], rotate: [0, 15, -15, 0], scale: [0, 1.5, 1.2] }, duration: 2.5 },
    { emoji: "💡", start: { x: 50, y: 25 }, animate: { x: [50, 50], y: [25, 15], scale: [0, 1.8, 1.4] }, duration: 2, delay: 0.4 },
    { emoji: "⚙️", start: { x: 25, y: 50 }, animate: { x: [25, 20], y: [50, 50], rotate: [0, 720], scale: [0, 1.4, 0] }, duration: 3, delay: 0.6 },
    { emoji: "⚙️", start: { x: 75, y: 50 }, animate: { x: [75, 80], y: [50, 50], rotate: [0, -720], scale: [0, 1.4, 0] }, duration: 3, delay: 0.6 },
    { emoji: "❓", start: { x: 30, y: 80 }, animate: { x: [30, 30], y: [80, 60], scale: [0, 1.3, 0] }, duration: 1.5, delay: 0.8 },
    { emoji: "✓", start: { x: 70, y: 80 }, animate: { x: [70, 70], y: [80, 60], scale: [0, 1.6, 0] }, duration: 1.5, delay: 1.6 },
  ],

  calm: [
    // 🧘 安撫型 — 月亮升起 + 雲朵飄 + 雪花
    { emoji: "🌙", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 30], scale: [0, 1.4, 1.2] }, duration: 3 },
    { emoji: "☁️", start: { x: 20, y: 40 }, animate: { x: [20, 80], y: [40, 50], scale: [0, 1.3, 0] }, duration: 3.5, delay: 0.3 },
    { emoji: "☁️", start: { x: 80, y: 60 }, animate: { x: [80, 20], y: [60, 50], scale: [0, 1.2, 0] }, duration: 3.5, delay: 0.6 },
    { emoji: "🌬️", start: { x: 30, y: 50 }, animate: { x: [30, 70], y: [50, 50], scale: [0, 1.4, 0] }, duration: 2.5, delay: 0.9 },
    { emoji: "✨", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 10], scale: [0, 1, 0] }, duration: 3, delay: 1.2 },
    { emoji: "🌟", start: { x: 25, y: 20 }, animate: { x: [25, 25], y: [20, 25], scale: [0, 1, 0] }, duration: 2, delay: 1.5 },
    { emoji: "🌟", start: { x: 75, y: 20 }, animate: { x: [75, 75], y: [20, 25], scale: [0, 1, 0] }, duration: 2, delay: 1.7 },
  ],

  connect: [
    // 🫂 連結型 — 雙手相握 + 心線連結 + 微笑
    { emoji: "🫂", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40, 45], scale: [0, 1.5, 1.3] }, duration: 2.5 },
    { emoji: "💖", start: { x: 25, y: 50 }, animate: { x: [25, 50, 75], y: [50, 30, 50], scale: [0, 1.4, 0] }, duration: 2.5, delay: 0.3 },
    { emoji: "💖", start: { x: 75, y: 50 }, animate: { x: [75, 50, 25], y: [50, 30, 50], scale: [0, 1.4, 0] }, duration: 2.5, delay: 0.6 },
    { emoji: "🤝", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 60], scale: [0, 1.5, 0] }, duration: 2, delay: 0.9 },
    { emoji: "😊", start: { x: 30, y: 20 }, animate: { x: [30, 30], y: [20, 0], scale: [0, 1.3, 0] }, duration: 2, delay: 1.2 },
    { emoji: "😊", start: { x: 70, y: 20 }, animate: { x: [70, 70], y: [20, 0], scale: [0, 1.3, 0] }, duration: 2, delay: 1.4 },
    { emoji: "✨", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 10], rotate: [0, 360], scale: [0, 1.2, 0] }, duration: 3, delay: 0.8 },
  ],
};

export default function SelCelebration({ style }: Props) {
  const emojis = ANIMATIONS[style];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {emojis.map((e, i) => (
        <motion.div
          key={i}
          initial={{ x: `${e.start.x}%`, y: `${e.start.y}%`, opacity: 0, scale: 0 }}
          animate={{
            x: e.animate.x.map((v) => `${v}%`),
            y: e.animate.y.map((v) => `${v}%`),
            opacity: [0, 1, 1, 0],
            rotate: e.animate.rotate ?? [0, 0],
            scale: e.animate.scale ?? [1, 1.2, 1, 0],
          }}
          transition={{
            duration: e.duration ?? 2.5,
            delay: e.delay ?? 0,
            ease: "easeOut",
            times: e.animate.scale
              ? Array.from({ length: e.animate.scale.length }, (_, idx) => idx / (e.animate.scale!.length - 1))
              : undefined,
          }}
          className="absolute text-5xl sm:text-6xl select-none"
          style={{ left: 0, top: 0, transform: "translate(-50%, -50%)" }}
        >
          {e.emoji}
        </motion.div>
      ))}
    </div>
  );
}
