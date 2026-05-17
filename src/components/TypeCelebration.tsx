"use client";

import { motion } from "framer-motion";
import type { MBTIType } from "@/lib/types";

/**
 * 16 型結局慶祝動畫 — 結果頁 hero 上方播 3-5 秒
 *
 * 每個型別有專屬「招牌動作」用 emoji + framer-motion 組合:
 *   - 浮動 emoji (3-5 個)
 *   - 軌跡用 type 個性決定 (E 系跳/橫向 / I 系上飄;
 *     T 系幾何 / F 系愛心擴散; S 系穩定 / N 系飄渺;
 *     J 系規律 / P 系隨機)
 *
 * 全部 pointer-events: none, 不影響閱讀
 * 動畫一次性 (重複會煩)
 */

interface Props {
  type: MBTIType;
}

interface AnimEmoji {
  emoji: string;
  /** 起始位置 (% 相對於容器) */
  start: { x: number; y: number };
  /** 動畫 sequence */
  animate: {
    x: number[];
    y: number[];
    rotate?: number[];
    scale?: number[];
  };
  delay?: number;
  duration?: number;
}

/** 每型專屬動畫 sequence */
const ANIMATIONS: Record<MBTIType, AnimEmoji[]> = {
  // 分析師組 NT
  INTJ: [
    { emoji: "♟️", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 50], rotate: [0, 360], scale: [1, 1.4, 1] }, duration: 2.5 },
    { emoji: "✨", start: { x: 20, y: 40 }, animate: { x: [20, 30, 25], y: [40, 20, 60], scale: [0, 1, 0] }, duration: 2.5, delay: 0.3 },
    { emoji: "✨", start: { x: 80, y: 60 }, animate: { x: [80, 70, 75], y: [60, 80, 30], scale: [0, 1, 0] }, duration: 2.5, delay: 0.6 },
    { emoji: "🧠", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 50], scale: [0, 1, 0] }, duration: 2 },
  ],
  INTP: [
    { emoji: "🔬", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40], rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }, duration: 3 },
    { emoji: "💡", start: { x: 30, y: 30 }, animate: { x: [30, 30], y: [30, 10], scale: [0, 1.5, 0] }, duration: 2, delay: 0.5 },
    { emoji: "❓", start: { x: 70, y: 30 }, animate: { x: [70, 70], y: [30, 10], scale: [0, 1.2, 0] }, duration: 2, delay: 0.8 },
    { emoji: "❗", start: { x: 50, y: 10 }, animate: { x: [50, 50], y: [10, -10], scale: [0, 1.5, 0] }, duration: 1.5, delay: 1.4 },
  ],
  ENTJ: [
    { emoji: "👑", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 20, 30], scale: [1, 1.5, 1.2], rotate: [0, 0] }, duration: 2.5 },
    { emoji: "⚡", start: { x: 20, y: 50 }, animate: { x: [20, 10], y: [50, 30, 70], scale: [0, 1.3, 0] }, duration: 2, delay: 0.3 },
    { emoji: "⚡", start: { x: 80, y: 50 }, animate: { x: [80, 90], y: [50, 30, 70], scale: [0, 1.3, 0] }, duration: 2, delay: 0.3 },
    { emoji: "🏆", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 70], scale: [0, 1.2, 0] }, duration: 2, delay: 1 },
  ],
  ENTP: [
    { emoji: "💡", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 50], rotate: [0, -20, 20, -20, 0], scale: [1, 1.4, 1] }, duration: 2.5 },
    { emoji: "💥", start: { x: 20, y: 30 }, animate: { x: [20, 10], y: [30, 10], scale: [0, 1.4, 0] }, duration: 2, delay: 0.2 },
    { emoji: "💭", start: { x: 80, y: 30 }, animate: { x: [80, 90], y: [30, 10], scale: [0, 1.2, 0] }, duration: 2, delay: 0.5 },
    { emoji: "🚀", start: { x: 50, y: 80 }, animate: { x: [50, 70], y: [80, 0], scale: [0, 1.5, 0], rotate: [0, 45] }, duration: 2.5, delay: 0.8 },
  ],

  // 外交家組 NF
  INFJ: [
    { emoji: "🌙", start: { x: 50, y: 30 }, animate: { x: [50, 50], y: [30, 20, 30], scale: [1, 1.3, 1.1] }, duration: 3 },
    { emoji: "✨", start: { x: 30, y: 60 }, animate: { x: [30, 30], y: [60, 30], scale: [0, 1, 0] }, duration: 2.5, delay: 0.4 },
    { emoji: "✨", start: { x: 70, y: 60 }, animate: { x: [70, 70], y: [60, 30], scale: [0, 1, 0] }, duration: 2.5, delay: 0.8 },
    { emoji: "💫", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 50], scale: [0, 1.2, 0], rotate: [0, 180] }, duration: 2.5, delay: 0.6 },
  ],
  INFP: [
    { emoji: "🦋", start: { x: 20, y: 50 }, animate: { x: [20, 50, 80, 50], y: [50, 30, 50, 70], rotate: [0, 10, -10, 0] }, duration: 3 },
    { emoji: "🌸", start: { x: 30, y: 20 }, animate: { x: [30, 30], y: [20, 80], rotate: [0, 360], scale: [0, 1, 0] }, duration: 3, delay: 0.3 },
    { emoji: "🌸", start: { x: 70, y: 20 }, animate: { x: [70, 70], y: [20, 80], rotate: [0, -360], scale: [0, 1, 0] }, duration: 3, delay: 0.6 },
    { emoji: "💖", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 30], scale: [0, 1.3, 0] }, duration: 2.5, delay: 1 },
  ],
  ENFJ: [
    { emoji: "🌟", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 50], scale: [1, 1.5, 1.2], rotate: [0, 360] }, duration: 2.5 },
    { emoji: "💝", start: { x: 30, y: 60 }, animate: { x: [30, 20], y: [60, 30], scale: [0, 1.2, 0] }, duration: 2, delay: 0.3 },
    { emoji: "💝", start: { x: 70, y: 60 }, animate: { x: [70, 80], y: [60, 30], scale: [0, 1.2, 0] }, duration: 2, delay: 0.3 },
    { emoji: "👥", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 70], scale: [0, 1.3, 0] }, duration: 2, delay: 0.7 },
    { emoji: "✨", start: { x: 10, y: 20 }, animate: { x: [10, 10], y: [20, 0], scale: [0, 1, 0] }, duration: 1.5, delay: 1 },
    { emoji: "✨", start: { x: 90, y: 20 }, animate: { x: [90, 90], y: [20, 0], scale: [0, 1, 0] }, duration: 1.5, delay: 1.2 },
  ],
  ENFP: [
    // 跳起來歡呼 + 灑紙花
    { emoji: "🌈", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 20, 30], scale: [1, 1.4, 1.2] }, duration: 2 },
    { emoji: "🎉", start: { x: 25, y: 40 }, animate: { x: [25, 15], y: [40, 80], rotate: [0, 360], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.2 },
    { emoji: "🎊", start: { x: 75, y: 40 }, animate: { x: [75, 85], y: [40, 80], rotate: [0, -360], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.4 },
    { emoji: "💖", start: { x: 30, y: 80 }, animate: { x: [30, 30], y: [80, 20], scale: [0, 1.2, 0] }, duration: 2.5, delay: 0.6 },
    { emoji: "✨", start: { x: 70, y: 80 }, animate: { x: [70, 70], y: [80, 20], scale: [0, 1.2, 0] }, duration: 2.5, delay: 0.8 },
    { emoji: "⭐", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 10], rotate: [0, 720], scale: [0, 1.4, 0] }, duration: 3, delay: 1 },
  ],

  // 守護者組 SJ
  ISTJ: [
    { emoji: "📊", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40], scale: [1, 1.3, 1] }, duration: 2.5 },
    { emoji: "✓", start: { x: 25, y: 50 }, animate: { x: [25, 25], y: [50, 50], scale: [0, 1.5, 0] }, duration: 1.5, delay: 0.4 },
    { emoji: "✓", start: { x: 75, y: 50 }, animate: { x: [75, 75], y: [50, 50], scale: [0, 1.5, 0] }, duration: 1.5, delay: 0.7 },
    { emoji: "🏅", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 60], scale: [0, 1.2, 0] }, duration: 2, delay: 1 },
  ],
  ISFJ: [
    { emoji: "🌷", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40, 50], scale: [1, 1.3, 1] }, duration: 3 },
    { emoji: "💝", start: { x: 30, y: 40 }, animate: { x: [30, 30], y: [40, 20], scale: [0, 1.2, 0] }, duration: 2, delay: 0.3 },
    { emoji: "💝", start: { x: 70, y: 40 }, animate: { x: [70, 70], y: [40, 20], scale: [0, 1.2, 0] }, duration: 2, delay: 0.6 },
    { emoji: "✨", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 60], scale: [0, 1, 0] }, duration: 1.5, delay: 1 },
  ],
  ESTJ: [
    { emoji: "🏆", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 40], scale: [1, 1.5, 1.3] }, duration: 2.5 },
    { emoji: "📋", start: { x: 25, y: 60 }, animate: { x: [25, 25], y: [60, 60], rotate: [0, 5, -5, 0], scale: [0, 1.2, 0] }, duration: 2.5, delay: 0.3 },
    { emoji: "✓", start: { x: 75, y: 60 }, animate: { x: [75, 75], y: [60, 60], scale: [0, 1.4, 0] }, duration: 1.5, delay: 0.5 },
    { emoji: "💪", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 70], scale: [0, 1.3, 0] }, duration: 2, delay: 0.8 },
  ],
  ESFJ: [
    { emoji: "🎂", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 40], scale: [1, 1.4, 1.2] }, duration: 2.5 },
    { emoji: "🤗", start: { x: 25, y: 50 }, animate: { x: [25, 35], y: [50, 50], scale: [0, 1.3, 0] }, duration: 2, delay: 0.3 },
    { emoji: "🤗", start: { x: 75, y: 50 }, animate: { x: [75, 65], y: [50, 50], scale: [0, 1.3, 0] }, duration: 2, delay: 0.3 },
    { emoji: "🎈", start: { x: 30, y: 90 }, animate: { x: [30, 30], y: [90, -10], scale: [0, 1.2, 0] }, duration: 3, delay: 0.6 },
    { emoji: "🎈", start: { x: 70, y: 90 }, animate: { x: [70, 70], y: [90, -10], scale: [0, 1.2, 0] }, duration: 3, delay: 0.9 },
  ],

  // 探險家組 SP
  ISTP: [
    { emoji: "🛠️", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30], rotate: [0, -20, 20, 0], scale: [1, 1.4, 1.1] }, duration: 2.5 },
    { emoji: "⚙️", start: { x: 25, y: 50 }, animate: { x: [25, 25], y: [50, 30], rotate: [0, 360], scale: [0, 1.2, 0] }, duration: 3, delay: 0.3 },
    { emoji: "⚙️", start: { x: 75, y: 50 }, animate: { x: [75, 75], y: [50, 70], rotate: [0, -360], scale: [0, 1.2, 0] }, duration: 3, delay: 0.5 },
    { emoji: "✨", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 50], scale: [0, 1.3, 0] }, duration: 2, delay: 1 },
  ],
  ISFP: [
    { emoji: "🎨", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 40], rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }, duration: 3 },
    { emoji: "🌸", start: { x: 25, y: 30 }, animate: { x: [25, 25], y: [30, 80], rotate: [0, 360], scale: [0, 1.2, 0] }, duration: 3.5, delay: 0.3 },
    { emoji: "🌿", start: { x: 75, y: 30 }, animate: { x: [75, 75], y: [30, 80], rotate: [0, -180], scale: [0, 1.2, 0] }, duration: 3.5, delay: 0.6 },
    { emoji: "🎵", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 20], rotate: [0, 30, -30, 0], scale: [0, 1.2, 0] }, duration: 3, delay: 0.9 },
  ],
  ESTP: [
    // 大手揮拳 + 閃電
    { emoji: "⚡", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 50], rotate: [0, 15, -15, 0], scale: [1, 1.6, 1.2] }, duration: 1.8 },
    { emoji: "🔥", start: { x: 25, y: 50 }, animate: { x: [25, 15], y: [50, 30], scale: [0, 1.4, 0] }, duration: 1.8, delay: 0.2 },
    { emoji: "🔥", start: { x: 75, y: 50 }, animate: { x: [75, 85], y: [50, 30], scale: [0, 1.4, 0] }, duration: 1.8, delay: 0.2 },
    { emoji: "💥", start: { x: 50, y: 80 }, animate: { x: [50, 50], y: [80, 60], scale: [0, 1.6, 0] }, duration: 1.5, delay: 0.5 },
    { emoji: "💪", start: { x: 30, y: 90 }, animate: { x: [30, 30], y: [90, 70], scale: [0, 1.4, 0] }, duration: 2, delay: 0.8 },
    { emoji: "💪", start: { x: 70, y: 90 }, animate: { x: [70, 70], y: [90, 70], scale: [0, 1.4, 0] }, duration: 2, delay: 1 },
  ],
  ESFP: [
    { emoji: "🎤", start: { x: 50, y: 50 }, animate: { x: [50, 50], y: [50, 30, 50], rotate: [0, 10, -10, 0], scale: [1, 1.5, 1.2] }, duration: 2.5 },
    { emoji: "💃", start: { x: 25, y: 50 }, animate: { x: [25, 15], y: [50, 40, 60, 50], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.2 },
    { emoji: "🕺", start: { x: 75, y: 50 }, animate: { x: [75, 85], y: [50, 60, 40, 50], scale: [0, 1.3, 0] }, duration: 2.5, delay: 0.4 },
    { emoji: "✨", start: { x: 30, y: 20 }, animate: { x: [30, 30], y: [20, 100], scale: [0, 1, 0] }, duration: 2.5, delay: 0.6 },
    { emoji: "✨", start: { x: 70, y: 20 }, animate: { x: [70, 70], y: [20, 100], scale: [0, 1, 0] }, duration: 2.5, delay: 0.9 },
    { emoji: "🎉", start: { x: 50, y: 90 }, animate: { x: [50, 50], y: [90, 10], rotate: [0, 720], scale: [0, 1.4, 0] }, duration: 3, delay: 1 },
  ],
};

export default function TypeCelebration({ type }: Props) {
  const emojis = ANIMATIONS[type] ?? ANIMATIONS.ENFP;

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
