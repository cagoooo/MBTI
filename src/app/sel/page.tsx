"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import SoundButton from "@/components/SoundButton";
import BgmController from "@/components/BgmController";
import RubyText from "@/components/RubyText";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, speakScene, stop as stopTts, pause as pauseTts, resume as resumeTts, subscribeStatus as subscribeTtsStatus } from "@/lib/tts";
import {
  ALL_SEL_STYLES,
  SEL_SCENARIOS,
  applySelDelta,
  deriveSelStyle,
  getSelStyleInfo,
  initialSelScores,
  selStrengthPercents,
  type SelChoice,
  type SelScores,
  type SelStyle,
} from "@/lib/sel";
import SelCelebration from "@/components/SelCelebration";
import SelGeminiPrescription from "@/components/SelGeminiPrescription";
import EmergencyCard from "@/components/EmergencyCard";
import { addHistory } from "@/lib/history";
import { setStudentSelStyle, updateSelProgress } from "@/lib/classroom-rtdb";
import { isFirebaseAvailable } from "@/lib/firebase";

/**
 * SEL 逆境特別篇 — Social-Emotional Learning
 *
 * 流程：9 個情境 → 計算 4 軸因應分數 → 主導風格結果頁
 * 單頁 (state machine)，不切路由方便老師輔導課直接用
 */

type Phase = "intro" | "scene" | "result";

interface ClassSession {
  roomCode: string;
  studentUid: string;
}

export default function SelPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <SelPageInner />
    </Suspense>
  );
}

function SelPageInner() {
  const searchParams = useSearchParams();
  const roomCodeFromUrl = (searchParams.get("room") || "").toUpperCase();

  const [phase, setPhase] = useState<Phase>("intro");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [scores, setScores] = useState<SelScores>(initialSelScores);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<{ speaking: boolean; paused: boolean }>({
    speaking: false,
    paused: false,
  });

  useEffect(() => {
    if (!ttsEnabled) {
      setTtsStatus({ speaking: false, paused: false });
      return;
    }
    return subscribeTtsStatus(setTtsStatus);
  }, [ttsEnabled]);

  // 班級模式 session (從 /join 帶過來)
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!roomCodeFromUrl) return;
    try {
      const raw = sessionStorage.getItem("mbti-class-session");
      if (!raw) return;
      const session = JSON.parse(raw) as ClassSession;
      if (session.roomCode === roomCodeFromUrl) {
        setClassSession(session);
      }
    } catch {}
  }, [roomCodeFromUrl]);

  // 學生在 SEL 房間：每進新場景上傳 progress
  useEffect(() => {
    if (!classSession || !isFirebaseAvailable()) return;
    if (phase !== "scene") return;
    void updateSelProgress(classSession.roomCode, classSession.studentUid, {
      currentSceneIdx: sceneIdx,
      selScores: scores,
    });
  }, [classSession, sceneIdx, scores, phase]);

  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    const refresh = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refresh);
    const iv = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(iv);
    };
  }, []);

  const scene = SEL_SCENARIOS[sceneIdx];

  // 場景切換時自動唸 (若 TTS 開啟)
  useEffect(() => {
    if (phase !== "scene" || !scene || showFollowUp || !ttsEnabled) return;
    const t = setTimeout(() => {
      speakScene({ location: scene.title, text: scene.text });
    }, 350);
    return () => {
      clearTimeout(t);
      stopTts();
    };
  }, [scene?.id, showFollowUp, ttsEnabled, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // intro phase 進場自動朗讀引言 (TTS 開啟才)
  useEffect(() => {
    if (phase !== "intro" || !ttsEnabled) return;
    const t = setTimeout(() => {
      speakScene({
        text: [
          "逆境裡的你，會怎麼接住自己？",
          "每個人都會遇到難過、生氣、害怕、被誤會、失敗的時刻。",
          "重要的不是不要有情緒，而是我可以怎麼接住自己。",
          "這場活動會幫你發現專屬於你的情緒因應風格與工具箱。",
        ],
      });
    }, 500);
    return () => {
      clearTimeout(t);
      stopTts();
    };
  }, [phase, ttsEnabled]);

  // followUp 朗讀
  useEffect(() => {
    if (!showFollowUp || !ttsEnabled) return;
    speakTts(showFollowUp, { rate: 1.0, pitch: 1.05 });
    return () => { stopTts(); };
  }, [showFollowUp, ttsEnabled]);

  function startGame() {
    playSound("click");
    setPhase("scene");
    setSceneIdx(0);
    setScores(initialSelScores);
    setShowFollowUp(null);
  }

  /** 從頭朗讀當前 SEL 場景 */
  function speakCurrentScene() {
    if (!scene) return;
    playSound("tap");
    speakScene({ location: scene.title, text: scene.text });
  }

  /** 智慧切換: 沒在播 → 從頭播；播放中 → 暫停；暫停中 → 繼續 */
  function toggleSpeaking() {
    if (ttsStatus.paused) {
      playSound("tap");
      resumeTts();
    } else if (ttsStatus.speaking) {
      playSound("toggleOff");
      pauseTts();
    } else {
      speakCurrentScene();
    }
  }

  function stopSpeaking() {
    playSound("toggleOff");
    stopTts();
  }

  function handleChoice(c: SelChoice) {
    playSound("click");
    const next = applySelDelta(scores, c.delta);
    setScores(next);
    setShowFollowUp(c.followUp);
  }

  function continueAfterFollowUp() {
    playSound("pageTurn");
    setShowFollowUp(null);
    if (sceneIdx < SEL_SCENARIOS.length - 1) {
      setSceneIdx(sceneIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // 結束 → 結果頁；存 result 到 sessionStorage 給 /journey 看完成狀態
      const style = deriveSelStyle(scores);
      try {
        sessionStorage.setItem(
          "mbti-sel-result",
          JSON.stringify({ style, scores, at: Date.now() }),
        );
        // U1 學習歷程冊：跨次 localStorage 紀錄
        addHistory({ kind: "sel", style, scores });
      } catch {}
      // O2 SEL 班級同步：上傳最終風格
      if (classSession && isFirebaseAvailable()) {
        void setStudentSelStyle(classSession.roomCode, classSession.studentUid, style);
      }
      setPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
      playSound("reveal");
    }
  }

  function restartFromBeginning() {
    playSound("whoosh");
    setPhase("intro");
    setSceneIdx(0);
    setScores(initialSelScores);
    setShowFollowUp(null);
  }

  return (
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/sel" />
      <BgmController track="result" />
      <div className="max-w-3xl mx-auto" style={{ paddingTop: 24 }}>


        {/* 班級模式 badge (O2) */}
        {classSession && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 border-2 border-violet-300 text-violet-800">
              🎓 班級 SEL 模式 ・ 房號 {classSession.roomCode}
            </span>
          </div>
        )}

        {/* ─── Intro ─── */}
        {phase === "intro" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-100 via-purple-50 to-rose-50 rounded-3xl p-6 sm:p-10 border-4 border-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 text-9xl opacity-15">🌧️</div>
            <div className="absolute -bottom-6 -left-6 text-8xl opacity-10">🌈</div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-700/80 mb-2 relative">
              🌧️ SEL · 社會情緒學習
            </p>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 relative text-[var(--color-ink)]">
              逆境裡的<br className="sm:hidden" />
              <span className="text-violet-700">你會怎麼接住自己？</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink)]/80 leading-relaxed mb-5 relative zhuyin-spaced">
              <RubyText>
                每個人都會遇到難過、生氣、害怕、被誤會、失敗…的時刻。
              </RubyText>
              <br />
              <RubyText>
                重要的不是「不要有情緒」，而是「我可以怎麼接住自己」。
              </RubyText>
            </p>

            <div className="bg-white/70 rounded-2xl p-4 sm:p-5 mb-5 relative">
              <p className="text-sm font-black mb-3 text-violet-900">這場活動會幫你發現：</p>
              <ul className="space-y-2 text-sm text-violet-900/90">
                <li className="flex gap-2">
                  <span>🌸</span>
                  <span>你最常用的「情緒因應方式」是哪一種</span>
                </li>
                <li className="flex gap-2">
                  <span>🧠</span>
                  <span>同學們的不同方式 → 沒有對錯，只有不同</span>
                </li>
                <li className="flex gap-2">
                  <span>🛠️</span>
                  <span>專屬於你的「情緒工具箱」5 個小工具</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-violet-700/70 mb-5 relative bg-violet-100/50 rounded-xl p-3 leading-relaxed">
              💡 <strong>給老師：</strong>適合輔導課、班會、SEL 主題課用。
              學生跑完約 8 分鐘，可以接著討論「為什麼不同人會選不同？」。
              <strong>沒有對錯</strong>，每個因應風格都珍貴。
            </p>

            <button
              onClick={startGame}
              className="btn-3d w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white text-xl font-black hover:opacity-95 transition flex items-center justify-center gap-2 relative"
            >
              <span className="text-2xl">🌱</span>
              <span>開始 (約 8 分鐘)</span>
            </button>
            <p className="text-center text-xs text-violet-700/60 mt-3 relative">
              9 個情境 · 沒有對錯答案 · 跟著直覺選
            </p>
          </motion.section>
        )}

        {/* ─── Scene ─── */}
        {phase === "scene" && scene && (
          <>
            {/* 進度 dots */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {SEL_SCENARIOS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i < sceneIdx ? "w-6 bg-violet-400" :
                    i === sceneIdx ? "w-10 bg-violet-600" :
                    "w-3 bg-violet-200"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs font-bold text-violet-700/60 uppercase tracking-wider">
                {sceneIdx + 1}/{SEL_SCENARIOS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, rotateY: 30, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -30, x: -80, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
                className="scene-card-narrow bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-violet-200 shadow-2xl relative overflow-hidden"
              >
                {/* 情緒色彩 background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-rose-50 pointer-events-none" />
                {/* 場景情緒貼紙 */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-5xl bg-white/90 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-md border-2 border-violet-200 pointer-events-none z-10">
                  {scene.emoji}
                </div>

                <div className="relative z-10">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-violet-600 mb-1">
                    情境 {sceneIdx + 1}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black mb-4 text-[var(--color-ink)]">
                    <RubyText>{scene.title}</RubyText>
                  </h2>

                  {/* TTS 控制工具列 — 播 / 暫停 / 繼續 / 停止 */}
                  {ttsEnabled && (
                    <div className="tts-toolbar">
                      <button
                        onClick={toggleSpeaking}
                        className="tts-btn-main"
                        title={
                          ttsStatus.paused
                            ? "繼續播放"
                            : ttsStatus.speaking
                              ? "暫停 (之後可繼續)"
                              : "從頭唸這段"
                        }
                      >
                        <span className="tts-btn-icon">
                          {ttsStatus.paused ? "▶" : ttsStatus.speaking ? "⏸" : "🔊"}
                        </span>
                        <span className="tts-btn-label">
                          {ttsStatus.paused ? "繼續播放" : ttsStatus.speaking ? "暫停" : "唸給我聽"}
                        </span>
                      </button>

                      {(ttsStatus.speaking || ttsStatus.paused) && (
                        <button
                          onClick={speakCurrentScene}
                          className="tts-btn-secondary"
                          title="從頭再唸一次"
                        >
                          <span style={{ fontSize: 16 }}>↻</span>
                          <span className="hidden sm:inline">從頭</span>
                        </button>
                      )}

                      {(ttsStatus.speaking || ttsStatus.paused) && (
                        <button
                          onClick={stopSpeaking}
                          className="tts-btn-secondary"
                          title="停止朗讀（不會繼續）"
                        >
                          <span style={{ fontSize: 14 }}>✕</span>
                          <span className="hidden sm:inline">停止</span>
                        </button>
                      )}

                      <div className="tts-status">
                        <span className={`tts-dot ${ttsStatus.paused ? "paused" : ttsStatus.speaking ? "live" : ""}`}></span>
                        <span className="hud" style={{ color: "var(--muted)", letterSpacing: 2 }}>
                          {ttsStatus.paused ? "PAUSED" : ttsStatus.speaking ? "▸ NOW READING" : "READY"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-5 text-base sm:text-lg leading-relaxed text-[var(--color-ink)] zhuyin-spaced">
                    {scene.text.map((p, i) => (
                      <p key={i}><RubyText>{p}</RubyText></p>
                    ))}
                  </div>

                  <div className="border-t-2 border-dashed border-violet-200 pt-4">
                    <p className="text-sm font-bold text-violet-700 mb-3">💭 你會怎麼接住自己？</p>
                    <div className="space-y-3">
                      {scene.choices.map((c, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleChoice(c)}
                          disabled={!!showFollowUp}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="choice-option w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-violet-200 hover:border-violet-500 hover:bg-violet-50 active:bg-violet-50 transition group relative min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-lg sm:text-2xl shrink-0 group-hover:scale-110 transition-transform leading-none mt-0.5">
                              {c.emoji}
                            </span>
                            <span className="flex-1 font-medium text-sm sm:text-base leading-snug min-w-0 break-words">
                              <RubyText>{c.text}</RubyText>
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* ─── Result ─── */}
        {phase === "result" && (
          <SelResultView scores={scores} onRestart={restartFromBeginning} ttsEnabled={ttsEnabled} />
        )}

        {/* followUp modal */}
        <AnimatePresence>
          {showFollowUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-violet-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={continueAfterFollowUp}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-violet-200 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--color-ink)] zhuyin-spaced">
                  <RubyText>{showFollowUp}</RubyText>
                </p>
                <SoundButton
                  sound="whoosh"
                  onClick={continueAfterFollowUp}
                  className="btn-3d mt-5 w-full py-3 rounded-2xl bg-violet-500 text-white font-black hover:bg-violet-600"
                >
                  繼續 →
                </SoundButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────── Result View ───────────────────

function SelResultView({
  scores,
  onRestart,
  ttsEnabled,
}: {
  scores: SelScores;
  onRestart: () => void;
  ttsEnabled: boolean;
}) {
  const style = deriveSelStyle(scores);
  const info = getSelStyleInfo(style);
  const percents = selStrengthPercents(scores);

  // 進入結果頁自動朗讀 hero (TTS 開啟才)
  useEffect(() => {
    if (!ttsEnabled) return;
    const t = setTimeout(() => {
      speakScene({
        text: [
          `你的情緒因應風格是 ${info.nickname}`,
          info.oneLiner,
          ...info.description,
        ],
      });
    }, 500);
    return () => {
      clearTimeout(t);
      stopTts();
    };
  }, [ttsEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  function speakHero() {
    playSound("tap");
    speakScene({
      text: [
        `你的情緒因應風格是 ${info.nickname}`,
        info.oneLiner,
        ...info.description,
      ],
    });
  }

  function speakToolbox() {
    playSound("tap");
    speakScene({
      text: [
        `你的情緒工具箱有 5 個小工具`,
        ...info.toolbox.map((t, i) => `第 ${i + 1} 個：${t}`),
      ],
    });
  }

  function stopSpeak() {
    playSound("toggleOff");
    stopTts();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Hero */}
      <section
        className={`bg-gradient-to-br ${info.gradient} rounded-[2rem] p-6 sm:p-10 text-center text-white shadow-xl border-4 border-white/60 relative overflow-hidden min-h-[420px]`}
      >
        {/* 4 種 SEL 風格專屬慶祝動畫 */}
        <SelCelebration style={style} />
        <div className="absolute top-4 right-4 text-7xl opacity-15 animate-wiggle">{info.emoji}</div>
        <div className="absolute bottom-4 left-4 text-6xl opacity-15 animate-float-slow">🌱</div>

        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/90 mb-2 drop-shadow">
          🌧️ 你的情緒因應風格是
        </p>
        <div className="text-8xl mb-2 animate-pop-in relative">{info.emoji}</div>
        <h1 className="text-4xl sm:text-6xl font-black drop-shadow-lg mb-2">
          {info.nickname}
        </h1>
        <p className="text-lg sm:text-xl text-white/95 max-w-xl mx-auto leading-relaxed font-medium drop-shadow zhuyin-spaced">
          <RubyText>{info.oneLiner}</RubyText>
        </p>

        {/* TTS 控制 (僅 TTS 開啟時顯示) */}
        {ttsEnabled && (
          <div className="flex items-center justify-center gap-2 mt-5 relative">
            <button
              onClick={speakHero}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur border-2 border-white/50 text-white text-xs font-bold hover:bg-white/40 transition shadow"
            >
              <span>🔊</span><span>再唸一次</span>
            </button>
            <button
              onClick={stopSpeak}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border-2 border-white/30 text-white text-xs font-bold hover:bg-white/25 transition"
            >
              <span>⏸</span><span>停止</span>
            </button>
          </div>
        )}
      </section>

      {/* 強度條 (4 軸百分比) */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <span>📊</span> 你的 4 軸因應策略
        </h3>
        <div className="space-y-3">
          {ALL_SEL_STYLES.map((s) => {
            const i = getSelStyleInfo(s);
            const pct = percents[s];
            const isMain = s === style;
            return (
              <div key={s}>
                <div className="flex items-center justify-between mb-1 text-sm font-bold">
                  <span className={isMain ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]/60"}>
                    {i.emoji} {i.nickname}
                  </span>
                  <span className={isMain ? "text-[var(--color-coral)] font-black" : "text-[var(--color-ink)]/50"}>
                    {pct}%
                  </span>
                </div>
                <div className="bg-[var(--color-ink)]/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${i.gradient}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--color-ink)]/60 mt-4 leading-relaxed text-center">
          💡 每個人都用 4 種方式，差別只在主要習慣哪一種 — 都很好
        </p>
      </section>

      {/* 描述 */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
        <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
          <span>🌟</span> <RubyText>你是這樣的人</RubyText>
        </h3>
        <div className="space-y-3 text-[var(--color-ink)]/90 leading-relaxed zhuyin-spaced">
          {info.description.map((p, i) => (
            <p key={i}><RubyText>{p}</RubyText></p>
          ))}
        </div>
      </section>

      {/* 兩欄：優勢 + 也試試看 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-emerald-900">
            <span>💪</span> 你的優勢
          </h3>
          <ul className="space-y-2 text-emerald-900/90">
            {info.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-amber-900">
            <span>🌱</span> 也試試看
          </h3>
          <ul className="space-y-2 text-amber-900/90">
            {info.growthAreas.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* AI 個人化情緒處方 (R1 — 設了 Gemini API key 才會顯示) */}
      <SelGeminiPrescription style={style} scores={scores} />

      {/* 情緒工具箱 (重點！) */}
      <section className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-7xl opacity-10">🛠️</div>
        <h3 className="text-2xl font-black mb-2 flex items-center gap-2 text-amber-900">
          <span>🛠️</span> 你的情緒工具箱
        </h3>
        <p className="text-sm text-amber-800/70 mb-4">把這 5 個工具收進你的「情緒急救包」，遇到事時拿出來用 ✨</p>
        <ul className="space-y-2.5">
          {info.toolbox.map((t, i) => (
            <li
              key={i}
              className="bg-white/80 rounded-xl p-3 text-sm sm:text-base text-amber-900/90 border border-amber-200/60 font-medium"
            >
              {t}
            </li>
          ))}
        </ul>
        {/* TTS：聽老師唸 5 個工具給你聽 */}
        {ttsEnabled && (
          <div className="flex items-center gap-2 mt-4 relative">
            <button
              onClick={speakToolbox}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-200 transition"
            >
              <span>🔊</span><span>唸出我的 5 個工具</span>
            </button>
            <button
              onClick={stopSpeak}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-amber-200 text-amber-700 text-xs font-bold hover:border-amber-400 transition"
            >
              <span>⏸</span><span>停止</span>
            </button>
          </div>
        )}
      </section>

      {/* 情緒急救卡 (O4 — 可列印 PDF) */}
      <EmergencyCard style={style} />

      {/* 互補搭檔 */}
      <section className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-6 border-2 border-sky-200">
        <h3 className="text-xl font-black mb-2 flex items-center gap-2 text-sky-900">
          <span>🤝</span> 最互補的搭檔
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{getSelStyleInfo(info.bestPartner.style).emoji}</div>
          <div>
            <p className="font-black text-sky-900">{getSelStyleInfo(info.bestPartner.style).nickname}</p>
            <p className="text-sm text-sky-800/80 mt-1">{info.bestPartner.reason}</p>
          </div>
        </div>
      </section>

      {/* 給老師家長的話 */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-6 border-2 border-violet-200">
        <h3 className="text-lg font-black mb-2 flex items-center gap-2 text-violet-900">
          <span>💌</span> 給老師、家長
        </h3>
        <p className="text-violet-900/90 leading-relaxed text-sm sm:text-base">{info.tipForGrowth}</p>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <SoundButton
          sound="click"
          onClick={onRestart}
          className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-violet-500 text-white text-lg font-black hover:bg-violet-600"
        >
          <span>↻</span>
          <span>再玩一次</span>
        </SoundButton>
        <Link
          href="/game"
          className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-lg font-black hover:border-[var(--color-coral)]/40"
        >
          <span>🎮</span>
          <span>玩 MBTI 校園奇遇記</span>
        </Link>
      </div>

      <p className="text-center text-sm text-[var(--color-ink)]/50 mt-4">
        ⚠️ 此活動為情緒能力探索參考，不代表心理診斷
      </p>
    </motion.div>
  );
}
