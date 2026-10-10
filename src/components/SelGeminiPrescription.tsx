"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { generateSelPrescription, isGeminiAvailable } from "@/lib/gemini";
import type { SelScores, SelStyle } from "@/lib/sel";
import { getSelStyleInfo } from "@/lib/sel";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";
import GeminiKeySettings, { useGeminiSettings } from "./GeminiKeySettings";

interface Props {
  style: SelStyle;
  scores: SelScores;
}

/**
 * SEL 結果頁 Gemini 個人化情緒處方 widget
 *
 * 同 GeminiAnalysis 的模式:
 *   - 永遠顯示教師設定，完成設定後才啟用生成
 *   - 不自動觸發，按按鈕才生 (省額度)
 *   - 只顯示此頁取得的 Google 回應，不讀寫結果快取
 *   - 骨架屏 loading / error fallback / 換一段
 */
export default function SelGeminiPrescription({ style, scores }: Props) {
  const { available, revision } = useGeminiSettings();
  const requestId = useRef(0);
  const pending = useRef(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const info = getSelStyleInfo(style);

  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    // 追蹤 TTS 開關 (使用者中途切換也可即時感知)
    const refresh = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refresh);
    window.addEventListener("mbti-settings-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("mbti-settings-change", refresh);
    };
  }, [style]);

  useEffect(() => {
    requestId.current++;
    pending.current = false;
    setResult(null);
    setError(null);
    setLoading(false);
    stopTts();
    return () => { requestId.current++; };
  }, [revision, style, scores.express, scores.solve, scores.calm, scores.connect]);

  // 僅朗讀此頁新生成的建議。
  function speakResult(text: string) {
    if (!ttsEnabled) return;
    // 把 emoji + markdown-ish 符號移除，讓 TTS 唸得順
    const cleaned = text
      .replace(/[#*_`>]/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s+\n\s+/g, "。")
      .trim();
    speakTts(cleaned, { rate: 1.0, pitch: 1.05 });
  }

  function stopReading() {
    playSound("toggleOff");
    stopTts();
  }

  async function generate() {
    if (!isGeminiAvailable() || pending.current) return;
    const currentRequest = ++requestId.current;
    pending.current = true;
    setLoading(true);
    setError(null);
    playSound("coin");
    try {
      const text = await generateSelPrescription({
        style,
        nickname: info.nickname,
        scores,
      });
      if (currentRequest !== requestId.current) return;
      setResult(text);
      // 新生成→自動朗讀 (TTS 開啟時)
      setTimeout(() => {
        if (currentRequest === requestId.current && isGeminiAvailable()) speakResult(text);
      }, 350);
    } catch (e) {
      if (currentRequest !== requestId.current) return;
      const msg = e instanceof Error ? e.message : "未知錯誤";
      setError(msg);
      playSound("toggleOff");
    } finally {
      if (currentRequest === requestId.current) {
        pending.current = false;
        setLoading(false);
      }
    }
  }

  function regenerate() {
    if (!isGeminiAvailable() || pending.current) return;
    setResult(null);
    void generate();
  }

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
          <span>AI 情緒練習建議</span>
        </h3>
        <p className="text-xs text-violet-700/70 mt-1">
          結合你的因應風格 + 4 軸分布，AI 寫一份只屬於你的「下週可以這樣練習」
        </p>
      </div>

      <GeminiKeySettings />

      {!result && !loading && !error && (
        <button
          onClick={generate}
          disabled={!available || loading}
          className="btn-3d w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-base hover:opacity-95 transition flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-xl">🪄</span>
          <span>{available ? "點此產生個人化情緒建議" : "請先由教師設定 Gemini"}</span>
        </button>
      )}

      {loading && (
        <div className="bg-white/70 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <span className="animate-pulse">🪄</span>
            <span>正在等待 Google 生成情緒建議，請耐心等待…</span>
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
            disabled={!available || loading}
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
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-violet-100 flex-wrap">
            <p className="text-[10px] text-violet-700/60 leading-relaxed flex-1 min-w-[180px]">
              ✨ 此頁取得的 Google Gemini 回應 · 非心理診斷，需教師審閱
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {ttsEnabled && result && (
                <>
                  <button
                    onClick={() => { playSound("tap"); speakResult(result); }}
                    title="再聽老師唸一次"
                    className="text-xs px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold hover:bg-amber-200 transition"
                  >
                    🔊 唸給我聽
                  </button>
                  <button
                    onClick={stopReading}
                    title="停止朗讀"
                    className="text-xs px-2.5 py-1 rounded-full bg-white border border-violet-200 text-violet-700 font-bold hover:border-amber-400 transition"
                  >
                    ⏸
                  </button>
                </>
              )}
              <button
                onClick={regenerate}
                disabled={!available || loading}
                className="text-xs px-3 py-1 rounded-full bg-violet-100 border border-violet-300 text-violet-700 font-bold hover:bg-violet-200 transition"
              >
                🔄 換一份
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
