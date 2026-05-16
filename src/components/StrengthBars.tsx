"use client";

import { useEffect, useState } from "react";
import type { Scores } from "@/lib/types";
import { strengthBars } from "@/lib/scoring";

interface SavedResult {
  scores: Scores;
  branch?: string;
  historyLen?: number;
}

function Bar({ left, right, leftPct, rightPct, color }: {
  left: string; right: string; leftPct: number; rightPct: number; color: string;
}) {
  const dominant = leftPct >= rightPct ? "left" : "right";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={dominant === "left" ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]/40"}>
          {left} {leftPct}%
        </span>
        <span className={dominant === "right" ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]/40"}>
          {rightPct}% {right}
        </span>
      </div>
      <div className="h-3 rounded-full bg-[var(--color-ink)]/10 overflow-hidden flex">
        <div className={`h-full ${color}`} style={{ width: `${leftPct}%` }} />
      </div>
    </div>
  );
}

export default function StrengthBars() {
  const [result, setResult] = useState<SavedResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mbti-result");
      if (raw) setResult(JSON.parse(raw) as SavedResult);
    } catch {
      // ignore
    }
  }, []);

  if (!result) {
    return (
      <div className="bg-white/60 rounded-2xl p-4 text-center text-sm text-[var(--color-ink)]/60">
        💡 想看你個人化的傾向強度圖嗎？回首頁玩一次完整的故事吧！
      </div>
    );
  }

  const bars = strengthBars(result.scores);

  return (
    <div className="space-y-4 bg-white/70 rounded-2xl p-5">
      <h3 className="text-lg font-black flex items-center gap-2">
        <span>📊</span> 你的人格傾向
      </h3>
      <Bar left="外向 E" right="I 內向" leftPct={bars.E} rightPct={bars.I} color="bg-amber-400" />
      <Bar left="實感 S" right="N 直覺" leftPct={bars.S} rightPct={bars.N} color="bg-emerald-400" />
      <Bar left="思考 T" right="F 情感" leftPct={bars.T} rightPct={bars.F} color="bg-sky-400" />
      <Bar left="判斷 J" right="P 感知" leftPct={bars.J} rightPct={bars.P} color="bg-purple-400" />
    </div>
  );
}
