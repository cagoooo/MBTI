"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import { loadProgress, unlockResult, type UnlockEvent } from "@/lib/badges";
import { playSound } from "@/lib/sound";
import SoundLink from "@/components/SoundLink";

interface Props {
  /** 結果頁進入時要解鎖的型 */
  newlyUnlocked?: MBTIType;
  /** 玩家剛走過的支線 */
  branch?: string;
}

export default function BadgeWall({ newlyUnlocked, branch }: Props) {
  const [unlocked, setUnlocked] = useState<MBTIType[]>([]);
  const [events, setEvents] = useState<UnlockEvent[]>([]);
  const [showToast, setShowToast] = useState<UnlockEvent | null>(null);

  // 第一次掛載時解鎖 + load progress
  useEffect(() => {
    if (newlyUnlocked) {
      const evs = unlockResult(newlyUnlocked, branch);
      setEvents(evs);
      if (evs.length > 0) {
        setShowToast(evs[0]);
        playSound("unlock");
      }
    }
    setUnlocked(loadProgress().unlockedTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toast 自動關閉 + 多個事件輪播
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => {
      const idx = events.indexOf(showToast);
      if (idx + 1 < events.length) {
        setShowToast(events[idx + 1]);
        playSound("unlock");
      } else {
        setShowToast(null);
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [showToast, events]);

  const total = ALL_TYPES.length;
  const count = unlocked.length;

  return (
    <>
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🏆</span> 我的徽章牆
          </h3>
          <div className="text-sm font-bold text-[var(--color-ink)]/70">
            已解鎖 <span className="text-2xl text-[var(--color-coral)]">{count}</span>/{total}
          </div>
        </div>

        {/* 進度條 */}
        <div className="h-3 rounded-full bg-[var(--color-ink)]/10 overflow-hidden mb-5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(count / total) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
          />
        </div>

        {/* 16 格徽章 */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ALL_TYPES.map((t) => {
            const isUnlocked = unlocked.includes(t);
            const isNew = newlyUnlocked === t;
            const info = getMBTIInfo(t);
            return (
              <SoundLink
                key={t}
                href={`/types/${t}`}
                sound={isUnlocked ? "pop" : "tap"}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-center transition ${isUnlocked ? `bg-gradient-to-br ${info.gradient} text-white shadow-md hover:scale-105` : "bg-[var(--color-ink)]/10 text-[var(--color-ink)]/30 hover:bg-[var(--color-ink)]/20"}`}
                aria-label={isUnlocked ? `${t} ${info.nickname}` : `未解鎖 ${t}`}
                title={isUnlocked ? `${t} - ${info.nickname}` : `未解鎖：${t}`}
              >
                <span className="text-2xl">{isUnlocked ? info.emoji : "❔"}</span>
                <span className="text-[10px] sm:text-xs font-black mt-0.5">{isUnlocked ? t : "???"}</span>
                {isNew && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                    NEW
                  </span>
                )}
              </SoundLink>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-[var(--color-ink)]/60 text-center">
          💡 想解鎖更多徽章？回去再玩一次，做不同選擇看看會走到哪一型！
        </p>
      </section>

      {/* Toast 慶祝 */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 print:hidden"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-white rounded-2xl shadow-2xl px-6 py-4 max-w-sm border-4 border-white">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{showToast.emoji}</div>
                <div>
                  <div className="font-black text-lg drop-shadow">{showToast.title}</div>
                  <div className="text-sm opacity-95">{showToast.description}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
