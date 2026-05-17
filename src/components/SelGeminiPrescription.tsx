"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generateSelPrescription, isGeminiAvailable } from "@/lib/gemini";
import type { SelScores, SelStyle } from "@/lib/sel";
import { getSelStyleInfo } from "@/lib/sel";
import { playSound } from "@/lib/sound";

interface Props {
  style: SelStyle;
  scores: SelScores;
}

const STORAGE_KEY_PREFIX = "mbti-sel-prescription-";

/**
 * SEL 結果頁 Gemini 個人化情緒處方 widget
 *
 * 同 GeminiAnalysis 的模式:
 *   - 沒設 API key 就完全不出現
 *   - 不自動觸發，按按鈕才生 (省額度)
 *   - sessionStorage 快取結果
 *   - 骨架屏 loading / error fallback / 換一段
 */
export default function SelGeminiPrescription({ style, scores }: Props) {
  const [available, setAvailable] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = getSelStyleInfo(style);

  useEffect(() => {
    setAvailable(isGeminiAvailable());
    // 嘗試讀快取
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY_PREFIX + style);
      if (cached) setResult(cached);
    } catch {}
  }, [style]);

  async function generate() {
    setLoading(true);
    setError(null);
    playSound("coin");
    try {
      const text = await generateSelPrescription({
        style,
        nickname: info.nickname,
        scores,
      });
      setResult(text);
      try {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + style, text);
      } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知錯誤";
      setError(msg);
      playSound("toggleOff");
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    try {
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + style);
    } catch {}
    setResult(null);
    void generate();
  }

  if (!available) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-3xl p-6 sm:p-8 border-2 border-violet-300 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 text-7xl opacity-10">💊</div>

      <div className="mb-3">
        <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-violet-900">
          <span>💊</span>
          <span>AI 為你寫的情緒處方</span>
        </h3>
        <p className="text-xs text-violet-700/70 mt-1">
          結合你的因應風格 + 4 軸分布，AI 寫一份只屬於你的「下週可以這樣練習」
        </p>
      </div>

      {!result && !loading && !error && (
        <button
          onClick={generate}
          className="btn-3d w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-base hover:opacity-95 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🪄</span>
          <span>點此產生個人化處方 (約 5 秒)</span>
        </button>
      )}

      {loading && (
        <div className="bg-white/70 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <span className="animate-pulse">🪄</span>
            <span>AI 正在分析你的情緒風格寫處方... (約 5 秒)</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-violet-200 rounded-full w-1/3 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-5/6 animate-pulse" />
            <div className="h-3 bg-violet-200 rounded-full w-1/4 mt-3 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-4/5 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-5/6 animate-pulse" />
            <div className="h-3 bg-violet-200 rounded-full w-1/3 mt-3 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-rose-800">
          <p className="font-bold text-sm">😢 AI 生成失敗</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
          <button
            onClick={generate}
            className="mt-3 px-4 py-1.5 rounded-full bg-white border-2 border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50"
          >
            🔄 再試一次
          </button>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 rounded-2xl p-5 border border-violet-200 shadow-sm"
        >
          <div className="prose prose-sm max-w-none">
            {result.split(/\n\n+/).map((para, i) => (
              <p
                key={i}
                className="text-[var(--color-ink)] leading-relaxed text-sm sm:text-base mb-3 last:mb-0 zhuyin-spaced"
              >
                {para}
              </p>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-violet-100">
            <p className="text-[10px] text-violet-700/60 leading-relaxed flex-1">
              ✨ 由 Google Gemini AI 生成 · 是溫暖建議，不是診斷
            </p>
            <button
              onClick={regenerate}
              className="text-xs px-3 py-1 rounded-full bg-violet-100 border border-violet-300 text-violet-700 font-bold hover:bg-violet-200 transition shrink-0"
            >
              🔄 換一份
            </button>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
