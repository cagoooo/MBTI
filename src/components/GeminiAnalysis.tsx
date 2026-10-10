"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { generatePersonalAnalysis, isGeminiAvailable } from "@/lib/gemini";
import { loadPretestGuess } from "@/lib/pretest";
import type { MBTIType } from "@/lib/types";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";
import GeminiKeySettings, { useGeminiSettings } from "./GeminiKeySettings";

interface Props {
  type: MBTIType;
  nickname: string;
}

/**
 * Gemini 個人化分析 — 結果頁可選 widget
 *
 * 設計:
 *   - 不自動觸發 (要使用者主動按按鈕,避免無謂呼叫額度)
 *   - 只顯示此頁取得的 Google 回應，不讀寫結果快取
 *   - Loading 狀態用骨架屏 + 提示
 *   - 失敗 graceful fallback
 *   - 醒目標示「✨ AI 寫的、非診斷」
 */
export default function GeminiAnalysis({ type, nickname }: Props) {
  const { available, revision } = useGeminiSettings();
  const requestId = useRef(0);
  const pending = useRef(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branch, setBranch] = useState<string>("main");
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    // 僅讀故事支線，不讀取舊 AI 結果。
    setBranch("main");
    try {
      const raw = sessionStorage.getItem("mbti-result");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "branch" in parsed &&
          typeof parsed.branch === "string" && ["main", "sport", "art", "study", "friend"].includes(parsed.branch)) {
          setBranch(parsed.branch);
        }
      }
    } catch {}
    const refreshTts = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refreshTts);
    window.addEventListener("mbti-settings-change", refreshTts);
    return () => {
      window.removeEventListener("storage", refreshTts);
      window.removeEventListener("mbti-settings-change", refreshTts);
    };
  }, [type]);

  useEffect(() => {
    requestId.current++;
    pending.current = false;
    setResult(null);
    setError(null);
    setLoading(false);
    stopTts();
    return () => { requestId.current++; };
  }, [revision, type]);

  function speakResult(text: string) {
    if (!ttsEnabled) return;
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
      const pretest = loadPretestGuess();
      const text = await generatePersonalAnalysis({
        type,
        nickname,
        branch,
        pretestGuess: pretest?.guess,
      });
      if (currentRequest !== requestId.current) return;
      setResult(text);
      // 新生成→自動朗讀
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
      <div className="absolute -top-4 -right-4 text-7xl opacity-10">✨</div>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-violet-900">
            <span>✨</span>
            <span>AI 為你寫一段</span>
          </h3>
          <p className="text-xs text-violet-700/70 mt-1">
            根據你的 MBTI、故事支線與課前猜測，請 AI 寫一段專屬於你的描述
          </p>
        </div>
      </div>

      <GeminiKeySettings />

      {!result && !loading && !error && (
        <button
          onClick={generate}
          disabled={!available || loading}
          className="btn-3d w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-base hover:opacity-95 transition flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-xl">🪄</span>
          <span>{available ? "點此產生個人化分析" : "請先由教師設定 Gemini"}</span>
        </button>
      )}

      {loading && (
        <div className="bg-white/70 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <span className="animate-pulse">🪄</span>
            <span>正在等待 Google 生成專屬分析，請耐心等待…</span>
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
                🔄 換一段
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
