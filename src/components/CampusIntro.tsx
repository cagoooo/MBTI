"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playSound } from "@/lib/sound";

interface Student {
  name: string;
  emoji: string;
  type: string;
  badge: string; // 角色配色
  line: string;  // 對白
}

const STUDENTS: Student[] = [
  { name: "小芸",   emoji: "🌸", type: "ENFP", badge: "bg-yellow-300",   line: "嗨嗨！我是小芸～新學期一起玩好不好？✨" },
  { name: "阿哲",   emoji: "🤓", type: "INTJ", badge: "bg-purple-300",   line: "我已經把這學期的計畫表列出來了。" },
  { name: "小傑",   emoji: "⚡", type: "ESTP", badge: "bg-orange-300",   line: "下課鐘響我先衝操場喔！😆" },
  { name: "雅雯",   emoji: "🌙", type: "INFJ", badge: "bg-indigo-300",   line: "你今天看起來有心事...要不要聊聊？" },
  { name: "宇航",   emoji: "🎨", type: "ISFP", badge: "bg-rose-300",     line: "我把今天的晚霞畫下來了，給你看。" },
  { name: "凱莉",   emoji: "👑", type: "ENTJ", badge: "bg-red-300",      line: "校慶我們班一定要拿冠軍！跟我來！" },
  { name: "小宇",   emoji: "📚", type: "INTP", badge: "bg-sky-300",      line: "你知道彩虹為什麼有 7 個顏色嗎？" },
  { name: "婷婷",   emoji: "🍰", type: "ESFJ", badge: "bg-pink-300",     line: "今天誰生日？我帶了小蛋糕！🎂" },
];

export default function CampusIntro() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  // 角色逐一登場
  useEffect(() => {
    if (visibleCount >= STUDENTS.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 280);
    return () => clearTimeout(t);
  }, [visibleCount]);

  // 對白輪替
  useEffect(() => {
    if (visibleCount < STUDENTS.length) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % STUDENTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [visibleCount]);

  const active = STUDENTS[activeIdx];

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          👋 全班同學在這裡等你
        </h2>
        <p className="text-center text-[var(--color-ink)]/70 mb-10 text-lg">
          每個人都是獨特的 MBTI 類型，看看你跟誰最像？
        </p>

        {/* 場景：教室全景 */}
        <div className="relative bg-gradient-to-b from-sky-100 via-yellow-50 to-amber-50 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden">
          {/* 黑板 */}
          <div className="bg-emerald-800 text-yellow-100 text-center py-2 px-4 font-black text-sm sm:text-base">
            ✏️ 三年五班・新學期歡迎會
          </div>

          {/* 學生們陳列 */}
          <div className="px-3 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 mb-6">
              {STUDENTS.map((s, i) => {
                const isVisible = i < visibleCount;
                const isActive = i === activeIdx && visibleCount >= STUDENTS.length;
                return (
                  <motion.button
                    key={s.name}
                    onClick={() => {
                      if (visibleCount >= STUDENTS.length) {
                        playSound("pop");
                        setActiveIdx(i);
                      }
                    }}
                    initial={{ y: 60, opacity: 0, scale: 0.5 }}
                    animate={isVisible ? { y: 0, opacity: 1, scale: 1 } : { y: 60, opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    whileHover={isVisible ? { y: -4, scale: 1.08 } : undefined}
                    className="relative flex flex-col items-center group disabled:cursor-default"
                    disabled={!isVisible}
                  >
                    <motion.div
                      animate={isActive ? { y: [-4, 0, -4] } : { y: 0 }}
                      transition={isActive ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${s.badge} flex items-center justify-center text-2xl sm:text-3xl border-2 ${
                        isActive ? "border-[var(--color-coral)] shadow-lg ring-4 ring-[var(--color-coral)]/30" : "border-white"
                      } transition`}
                    >
                      {s.emoji}
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 text-xs"
                        >
                          💬
                        </motion.span>
                      )}
                    </motion.div>
                    <span className={`mt-1 text-[10px] sm:text-xs font-bold ${isActive ? "text-[var(--color-coral)]" : "text-[var(--color-ink)]/70"}`}>
                      {s.name}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black opacity-60 ${isActive ? "text-[var(--color-coral)] opacity-100" : ""}`}>
                      {s.type}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* 對話氣泡 */}
            <div className="min-h-[88px] sm:min-h-[100px] flex items-start justify-center">
              <AnimatePresence mode="wait">
                {visibleCount >= STUDENTS.length && (
                  <motion.div
                    key={active.name + active.line}
                    initial={{ opacity: 0, y: 16, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="relative max-w-md bg-white rounded-2xl px-5 py-3 border-2 border-[var(--color-ink)]/15 shadow-md"
                  >
                    {/* 三角形小尾巴 */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-[var(--color-ink)]/15 rotate-45"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{active.emoji}</span>
                      <span className="font-black text-sm">
                        {active.name}
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-cream)] text-[var(--color-ink)]/60 font-bold">
                          {active.type}
                        </span>
                      </span>
                    </div>
                    <p className="text-[var(--color-ink)] leading-relaxed text-sm sm:text-base">
                      {active.line}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs text-[var(--color-ink)]/50 mt-3">
              👆 點頭像看不同同學的個性，下方有完整的 16 型介紹
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
