"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  countMatchedAxes,
  describeMatch,
  loadPretestGuess,
  type SavedPretest,
} from "@/lib/pretest";
import type { MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";

interface Props {
  actual: MBTIType;
}

/**
 * 結果頁顯示「課前猜測 vs 課後結果」對照卡
 * 沒做課前快測就不顯示
 */
export default function PretestCompare({ actual }: Props) {
  const [pretest, setPretest] = useState<SavedPretest | null>(null);

  useEffect(() => {
    setPretest(loadPretestGuess());
  }, []);

  if (!pretest) return null;

  const guess = pretest.guess;
  const matched = countMatchedAxes(guess, actual);
  const desc = describeMatch(matched);
  const guessInfo = getMBTIInfo(guess);
  const actualInfo = getMBTIInfo(actual);
  const sameType = guess === actual;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-3 right-3 text-5xl opacity-15">{desc.emoji}</div>

      <h3 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2 text-amber-900">
        <span>{desc.emoji}</span>
        <span>{desc.title}</span>
      </h3>
      <p className="text-sm text-amber-800/80 mb-4">{desc.subtitle}</p>

      {/* 對照卡：課前 vs 課後 */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-4">
        {/* 課前 */}
        <div className="bg-white/80 rounded-2xl p-4 border-2 border-amber-200 text-center">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            🔮 你開始前猜
          </p>
          <div className="text-3xl mb-1">{guessInfo.emoji}</div>
          <p className="text-2xl font-black text-amber-900 tracking-widest">{guess}</p>
          <p className="text-xs text-amber-800/70 font-bold mt-1">{guessInfo.nickname}</p>
        </div>

        {/* 箭頭 */}
        <div className="text-center text-2xl text-amber-600 font-black hidden sm:block">→</div>
        <div className="text-center text-amber-600 font-black sm:hidden">↓</div>

        {/* 課後 */}
        <div
          className={`bg-white rounded-2xl p-4 border-2 text-center ${
            sameType
              ? "border-emerald-400 ring-2 ring-emerald-300/50"
              : "border-rose-300 ring-2 ring-rose-300/30"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[var(--color-coral)]">
            ✨ 故事告訴你
          </p>
          <div className="text-3xl mb-1">{actualInfo.emoji}</div>
          <p className="text-2xl font-black text-[var(--color-coral)] tracking-widest">{actual}</p>
          <p className="text-xs text-[var(--color-ink)]/70 font-bold mt-1">
            {actualInfo.nickname}
          </p>
        </div>
      </div>

      {/* 四軸詳細對比 */}
      <div className="bg-white/60 rounded-2xl p-3 sm:p-4">
        <p className="text-xs font-bold text-amber-900 mb-2">4 軸對照：</p>
        <div className="grid grid-cols-4 gap-2">
          {(["EI", "SN", "TF", "JP"] as const).map((axis, i) => {
            const g = guess[i];
            const a = actual[i];
            const match = g === a;
            return (
              <div
                key={axis}
                className={`rounded-xl p-2 text-center ${
                  match ? "bg-emerald-100 border border-emerald-300" : "bg-rose-50 border border-rose-200"
                }`}
              >
                <p className="text-[10px] font-bold text-[var(--color-ink)]/50 uppercase">
                  {axis}
                </p>
                <p className="text-sm font-mono font-black">
                  <span className={match ? "text-emerald-700" : "text-rose-700"}>{g}</span>
                  <span className="mx-1 text-[var(--color-ink)]/40">/</span>
                  <span className={match ? "text-emerald-700" : "text-rose-700"}>{a}</span>
                </p>
                <p className="text-[10px] font-bold mt-0.5">
                  {match ? (
                    <span className="text-emerald-600">✓ 對</span>
                  ) : (
                    <span className="text-rose-600">換了</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--color-ink)]/50 text-center mt-2">
          ✨ 4 軸中你猜對了 <span className="font-black text-amber-700">{matched}</span> 個
        </p>
      </div>
    </motion.section>
  );
}
