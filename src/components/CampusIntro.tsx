"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playSound } from "@/lib/sound";

interface Student {
  name: string;
  emoji: string;
  type: string;
  badge: string; // 角色配色
  /** 對白輪播 (每 3.2 秒換) — 第二句通常帶家庭背景自然呈現多元 */
  lines: string[];
}

/**
 * NPC 設計兼顧 MBTI 風格 + 多元家庭情境 (#7 SDGs):
 *   雅雯 — 隔代教養 (跟奶奶住)
 *   阿哲 — 新住民第二代 (爸爸是越南人)
 *   凱莉 — 同志家庭 (兩個媽媽)
 *   婷婷 — 大家庭 (照顧弟妹)
 *   小傑 — 單親爸爸忙碌
 *   宇航 — 阿公會手語 (家有聽障家人)
 * 不刻意說教,只在第二輪台詞自然帶到。
 */
const STUDENTS: Student[] = [
  {
    name: "小芸", emoji: "🌸", type: "ENFP", badge: "bg-yellow-300",
    lines: [
      "嗨嗨！我是小芸～新學期一起玩好不好？✨",
      "我妹妹今天也是開學第一天！她讀一年級耶。",
    ],
  },
  {
    name: "阿哲", emoji: "🤓", type: "INTJ", badge: "bg-purple-300",
    lines: [
      "我已經把這學期的計畫表列出來了。",
      "我爸爸是越南人，所以我會講一點越南話喔！",
    ],
  },
  {
    name: "小傑", emoji: "⚡", type: "ESTP", badge: "bg-orange-300",
    lines: [
      "下課鐘響我先衝操場喔！😆",
      "今天我爸值班，姑姑會來接我。我們家就我跟爸爸兩個人。",
    ],
  },
  {
    name: "雅雯", emoji: "🌙", type: "INFJ", badge: "bg-indigo-300",
    lines: [
      "你今天看起來有心事...要不要聊聊？",
      "晚上是奶奶接我回家，她每天都煮我最愛吃的菜 💕",
    ],
  },
  {
    name: "宇航", emoji: "🎨", type: "ISFP", badge: "bg-rose-300",
    lines: [
      "我把今天的晚霞畫下來了，給你看。",
      "我爺爺聽不見，所以我們在家都用手語聊天，超酷！",
    ],
  },
  {
    name: "凱莉", emoji: "👑", type: "ENTJ", badge: "bg-red-300",
    lines: [
      "校慶我們班一定要拿冠軍！跟我來！",
      "我家有兩個媽媽，她們都超會煮菜，我超幸福的！",
    ],
  },
  {
    name: "小宇", emoji: "📚", type: "INTP", badge: "bg-sky-300",
    lines: [
      "你知道彩虹為什麼有 7 個顏色嗎？",
      "其實光的顏色是連續的，七色只是人類分類方式啦。",
    ],
  },
  {
    name: "婷婷", emoji: "🍰", type: "ESFJ", badge: "bg-pink-300",
    lines: [
      "今天誰生日？我帶了小蛋糕！🎂",
      "我家有兩個弟弟一個妹妹，所以我超會照顧人 ✨",
    ],
  },
];

export default function CampusIntro() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  // 角色逐一登場
  useEffect(() => {
    if (visibleCount >= STUDENTS.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 280);
    return () => clearTimeout(t);
  }, [visibleCount]);

  // 對白輪替：每 3.2 秒換 (角色 + line 雙重輪播)
  useEffect(() => {
    if (visibleCount < STUDENTS.length) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => {
        const next = (i + 1) % STUDENTS.length;
        // 每輪走完所有角色才換到第二輪台詞 (家庭背景版本)
        if (next === 0) setLineIdx((li) => (li + 1) % 2);
        return next;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [visibleCount]);

  const active = STUDENTS[activeIdx];
  const activeLine = active.lines[lineIdx % active.lines.length] ?? active.lines[0];

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

          {/* 學生們陳列 — 手機 4 欄 (兩排) / 平板以上 8 欄 (一排) */}
          <div className="px-2 sm:px-6 py-5 sm:py-8">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-3 mb-5 sm:mb-6">
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
                    <span className={`mt-1 text-[11px] sm:text-xs font-bold leading-tight no-zhuyin-spacing ${isActive ? "text-[var(--color-coral)]" : "text-[var(--color-ink)]/70"}`}>
                      {s.name}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black opacity-60 leading-tight no-zhuyin-spacing ${isActive ? "text-[var(--color-coral)] opacity-100" : ""}`}>
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
                    key={active.name + activeLine}
                    initial={{ opacity: 0, y: 16, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="relative w-[min(90vw,28rem)] bg-white rounded-2xl px-4 sm:px-5 py-3 border-2 border-[var(--color-ink)]/15 shadow-md"
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
                    <p className="text-[var(--color-ink)] leading-relaxed text-sm sm:text-base zhuyin-spaced">
                      {activeLine}
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
