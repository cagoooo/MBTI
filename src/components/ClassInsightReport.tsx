"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateClassInsight, isGeminiAvailable } from "@/lib/gemini";
import type { SessionSnapshot } from "@/lib/classroom-rtdb";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";

interface Props {
  sessionId: string;
  snapshot: SessionSnapshot;
}

const STORAGE_KEY_PREFIX = "mbti-class-insight-";

/**
 * W1 — AI 班級洞察報告
 *
 * 老師在 /teacher/history 點按鈕→ Gemini 生成 350-400 字班級分析
 * 內含: 班級個性 / 3 合作建議 / 2 衝突提示 / 推薦下次活動
 *
 * 設計:
 *   - 不自動觸發 (節省額度)
 *   - localStorage 快取結果 (跨 session — 老師重訪可看)
 *   - 生成後自動朗讀 (跟其他 Gemini widget 一致)
 *   - 列印按鈕 (家長日報告材料)
 */
export default function ClassInsightReport({ sessionId, snapshot }: Props) {
  const [available, setAvailable] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    setAvailable(isGeminiAvailable());
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    try {
      const cached = localStorage.getItem(STORAGE_KEY_PREFIX + sessionId);
      if (cached) setResult(cached);
    } catch {}
    const refreshTts = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refreshTts);
    window.addEventListener("mbti-settings-change", refreshTts);
    return () => {
      window.removeEventListener("storage", refreshTts);
      window.removeEventListener("mbti-settings-change", refreshTts);
    };
  }, [sessionId]);

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
    setLoading(true);
    setError(null);
    setOpen(true);
    playSound("coin");
    try {
      const text = await generateClassInsight({
        sessionLabel: snapshot.sessionLabel ?? "活動",
        totalCount: snapshot.totalCount,
        completedCount: snapshot.completedCount,
        typeDistribution: snapshot.typeDistribution,
        axisCount: snapshot.axisCount,
      });
      setResult(text);
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + sessionId, text);
      } catch {}
      setTimeout(() => speakResult(text), 350);
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
      localStorage.removeItem(STORAGE_KEY_PREFIX + sessionId);
    } catch {}
    setResult(null);
    void generate();
  }

  function printReport() {
    playSound("coin");
    window.print();
  }

  if (!available) return null;

  return (
    <>
      <button
        onClick={() => {
          if (result) {
            setOpen(true);
            playSound("tap");
          } else {
            void generate();
          }
        }}
        className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow"
      >
        <span>✨</span>
        <span>{result ? "查看 AI 報告" : "AI 寫家長日報告"}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-violet-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print-hide"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-4 border-violet-200 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-violet-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-700/80">
                    ✨ AI 班級洞察報告
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--color-ink)]">
                    {snapshot.sessionLabel ?? "活動"}
                  </h3>
                  <p className="text-xs text-[var(--color-ink)]/60 mt-0.5">
                    {snapshot.completedCount} 人完成 · 房號 {snapshot.roomCode}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 font-black flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 class-insight-print">
                {loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                      <span className="animate-pulse">🪄</span>
                      <span>AI 正在為這個班級分析中... (約 8 秒)</span>
                    </div>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 bg-violet-200 rounded-full w-1/3 animate-pulse" />
                        <div className="h-3 bg-violet-200/70 rounded-full w-full animate-pulse" />
                        <div className="h-3 bg-violet-200/70 rounded-full w-5/6 animate-pulse" />
                      </div>
                    ))}
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
                  <div className="prose prose-sm max-w-none">
                    {result.split(/\n\n+/).map((para, i) => (
                      <p
                        key={i}
                        className="text-[var(--color-ink)] leading-relaxed text-sm sm:text-base mb-4 last:mb-0"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {result && (
                <div className="p-4 border-t-2 border-violet-100 flex items-center justify-between gap-2 flex-wrap print-hide">
                  <p className="text-[10px] text-violet-700/60 leading-relaxed flex-1 min-w-[180px]">
                    ✨ 由 Google Gemini AI 生成 · 老師參考用
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ttsEnabled && (
                      <>
                        <button
                          onClick={() => { playSound("tap"); speakResult(result); }}
                          className="text-xs px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold hover:bg-amber-200"
                        >
                          🔊 唸給我聽
                        </button>
                        <button
                          onClick={stopReading}
                          className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-violet-200 text-violet-700 font-bold hover:border-amber-400"
                        >
                          ⏸
                        </button>
                      </>
                    )}
                    <button
                      onClick={printReport}
                      className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600"
                    >
                      🖨️ 列印
                    </button>
                    <button
                      onClick={regenerate}
                      className="text-xs px-3 py-1.5 rounded-full bg-violet-100 border border-violet-300 text-violet-700 font-bold hover:bg-violet-200"
                    >
                      🔄 重新生成
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          .print-hide { display: none !important; }
          .class-insight-print {
            max-height: none !important;
            overflow: visible !important;
            padding: 20mm !important;
            font-size: 12pt !important;
          }
        }
      `}</style>
    </>
  );
}
