"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generatePersonalAnalysis, isGeminiAvailable } from "@/lib/gemini";
import { loadPretestGuess } from "@/lib/pretest";
import type { MBTIType } from "@/lib/types";
import { playSound } from "@/lib/sound";

interface Props {
  type: MBTIType;
  nickname: string;
}

const STORAGE_KEY_PREFIX = "mbti-gemini-analysis-";

/**
 * Gemini 個人化分析 — 結果頁可選 widget
 *
 * 設計:
 *   - 不自動觸發 (要使用者主動按按鈕,避免無謂呼叫額度)
 *   - 結果快取在 sessionStorage,同型別 + 同 session 不重打
 *   - Loading 狀態用骨架屏 + 提示
 *   - 失敗 graceful fallback
 *   - 醒目標示「✨ AI 寫的、非診斷」
 */
export default function GeminiAnalysis({ type, nickname }: Props) {
  const [available, setAvailable] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branch, setBranch] = useState<string>("main");

  useEffect(() => {
    setAvailable(isGeminiAvailable());
    // 拿 sessionStorage 的 branch / 之前快取的結果
    try {
      const raw = sessionStorage.getItem("mbti-result");
      if (raw) {
        const parsed = JSON.parse(raw) as { branch?: string };
        if (parsed.branch) setBranch(parsed.branch);
      }
      const cached = sessionStorage.getItem(STORAGE_KEY_PREFIX + type);
      if (cached) setResult(cached);
    } catch {}
  }, [type]);

  async function generate() {
    setLoading(true);
    setError(null);
    playSound("coin");
    try {
      const pretest = loadPretestGuess();
      const text = await generatePersonalAnalysis({
        type,
        nickname,
        branch,
        pretestGuess: pretest?.guess,
      });
      setResult(text);
      try {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + type, text);
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
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + type);
    } catch {}
    setResult(null);
    void generate();
  }

  if (!available) return null; // 沒設 API key 就完全隱藏

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-3xl p-6 sm:p-8 border-2 border-violet-300 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 text-7xl opacity-10">✨</div>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-violet-900">
            <span>✨</span>
            <span>AI 為你寫一段</span>
          </h3>
          <p className="text-xs text-violet-700/70 mt-1">
            根據你的 MBTI + 故事選擇，請 AI 寫一段專屬於你的描述
          </p>
        </div>
      </div>

      {!result && !loading && !error && (
        <button
          onClick={generate}
          className="btn-3d w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-base hover:opacity-95 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🪄</span>
          <span>點此產生 (約 5 秒)</span>
        </button>
      )}

      {loading && (
        <div className="bg-white/70 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <span className="animate-pulse">🪄</span>
            <span>AI 正在為你寫專屬分析中... (約 5 秒)</span>
          </div>
          {/* 骨架屏 */}
          <div className="space-y-2">
            <div className="h-3 bg-violet-200 rounded-full w-1/3 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-5/6 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-4/5 animate-pulse" />
            <div className="h-3 bg-violet-200 rounded-full w-1/4 mt-3 animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-violet-200/70 rounded-full w-5/6 animate-pulse" />
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
              ✨ 由 Google Gemini AI 生成 · 僅供參考，非心理診斷
            </p>
            <button
              onClick={regenerate}
              className="text-xs px-3 py-1 rounded-full bg-violet-100 border border-violet-300 text-violet-700 font-bold hover:bg-violet-200 transition shrink-0"
            >
              🔄 換一段
            </button>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
