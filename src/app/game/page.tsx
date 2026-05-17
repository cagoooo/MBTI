"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getScene, START_SCENE_ID, TOTAL_CHAPTERS } from "@/lib/scenes";
import { applyDelta, deriveType, initialScores } from "@/lib/scoring";
import type { Branch, Choice, Scene, Scores } from "@/lib/types";
import ProgressDots from "@/components/ProgressDots";
import HomeToButton from "@/components/HomeToButton";
import BgmController from "@/components/BgmController";
import SoundButton from "@/components/SoundButton";
import { playSound, type BgmTrackId } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speakScene, stop as stopTts, speak as speakTts } from "@/lib/tts";
import {
  setStudentVote,
  subscribeRoom,
  updateStudentProgress,
  type RoomSnapshot,
} from "@/lib/classroom-rtdb";
import { isFirebaseAvailable } from "@/lib/firebase";
import RubyText from "@/components/RubyText";
import PretestQuiz from "@/components/PretestQuiz";
import { loadPretestGuess } from "@/lib/pretest";

/**
 * 場景所屬支線 → BGM track 對應
 * - main 主線 (開學週 scene_01~06 + 校慶結局 final_01~04) 用 game (Playful Kids 通用感)
 * - 四條支線各自的專屬 BGM (校隊熱血/藝術夢幻/學術好奇/友誼溫暖)
 */
const BRANCH_TO_BGM: Record<Branch, BgmTrackId> = {
  main: "game",
  sport: "sport",
  art: "art",
  study: "study",
  friend: "friend",
};

interface HistoryEntry {
  sceneId: string;
  choiceIndex: number;
  followUp?: string;
  delta: Choice["delta"];
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <GameInner />
    </Suspense>
  );
}

interface ClassSession {
  roomCode: string;
  studentUid: string;
}

function GameInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCodeFromUrl = (searchParams.get("room") || "").toUpperCase();

  const [sceneId, setSceneId] = useState<string>(START_SCENE_ID);
  const [scores, setScores] = useState<Scores>(initialScores);
  const [branch, setBranch] = useState<Branch>("main");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);
  const [pendingNext, setPendingNext] = useState<{ id: string; isEnding: boolean } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // ─────── 課前快測 modal ───────
  // 只在「真的剛開始 (scene_01) + 沒進度 + 沒做過 pretest」時顯示
  const [showPretest, setShowPretest] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sceneId !== START_SCENE_ID) return;
    if (history.length > 0) return;
    if (loadPretestGuess()) return; // 已經做過
    setShowPretest(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────── 班級模式 sync hook ───────
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [pinnedScene, setPinnedScene] = useState<string | null>(null);
  const [pinReason, setPinReason] = useState<string>("");

  // 從 sessionStorage 拿 class session (從 /join 帶過來)
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

  // 訂閱房間，接收 pinnedScene 變動
  useEffect(() => {
    if (!classSession || !isFirebaseAvailable()) return;
    const unsub = subscribeRoom(classSession.roomCode, (snap: RoomSnapshot) => {
      setPinnedScene(snap.teacherControl?.pinnedScene ?? null);
      setPinReason(snap.teacherControl?.pinReason ?? "");
    });
    return () => unsub();
  }, [classSession]);

  // 進場景時上傳 progress (含初始 scene_01)
  useEffect(() => {
    if (!classSession || !isFirebaseAvailable()) return;
    void updateStudentProgress(classSession.roomCode, classSession.studentUid, {
      currentScene: sceneId,
      currentBranch: branch,
      score: scores,
    });
  }, [classSession, sceneId, branch, scores]);

  // 是否被老師 pin 住
  const isPinned = !!(classSession && pinnedScene && pinnedScene === sceneId);

  // pin 期間的投票暫存（解 pin 後自動套用）
  const [pendingVote, setPendingVote] = useState<{ sceneId: string; choiceIndex: number } | null>(null);

  // 監聽 unpin → 若有 pendingVote 且場景對應 → 自動 proceed
  useEffect(() => {
    if (!classSession) return;
    if (isPinned) return; // 還被 pin 中
    if (!pendingVote) return;
    if (pendingVote.sceneId !== sceneId) {
      setPendingVote(null);
      return;
    }
    // unpin 了，套用 pendingVote
    const choice = scene?.choices[pendingVote.choiceIndex];
    if (!choice) {
      setPendingVote(null);
      return;
    }
    // 清 RTDB votingChoice
    void setStudentVote(classSession.roomCode, classSession.studentUid, sceneId, null);
    setPendingVote(null);
    // 直接執行原本的 handleChoice (但要避免無限迴圈，所以稍延遲)
    const t = setTimeout(() => handleChoice(choice, pendingVote.choiceIndex), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinned, pendingVote, sceneId, classSession]);

  // 追蹤 TTS 開關狀態 (避免 SSR mismatch + 使用者中途切換)
  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    // localStorage 沒 storage event 在同一頁 tab，但我們可以監聽 sound-toggle 的 click
    function refresh() {
      setTtsEnabled(isTtsAvailable() && isTtsOn());
    }
    window.addEventListener("storage", refresh);
    // 每 1.5s polling 一次 (給同 tab 切換用，輕量)
    const iv = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(iv);
    };
  }, []);

  const scene: Scene | undefined = useMemo(() => getScene(sceneId), [sceneId]);

  // 場景切換時自動唸場景內容（若 TTS 開啟）
  useEffect(() => {
    if (!scene) return;
    if (showFollowUp) return; // followUp modal 開著時不唸
    if (!ttsEnabled) return;
    // 稍微延遲讓翻頁動畫先進來
    const t = setTimeout(() => {
      speakScene({
        location: scene.location,
        speaker: scene.speaker,
        text: scene.text,
      });
    }, 350);
    return () => {
      clearTimeout(t);
      // 切場景前停掉舊的
      stopTts();
    };
  }, [scene?.id, showFollowUp, ttsEnabled]);

  // followUp modal 開啟時唸 followUp 文字
  useEffect(() => {
    if (!showFollowUp) return;
    if (!ttsEnabled) return;
    speakTts(showFollowUp, { rate: 1.05, pitch: 1.1 });
    return () => { stopTts(); };
  }, [showFollowUp, ttsEnabled]);

  function speakCurrentScene() {
    if (!scene) return;
    playSound("tap");
    speakScene({
      location: scene.location,
      speaker: scene.speaker,
      text: scene.text,
    });
  }

  function stopSpeaking() {
    playSound("toggleOff");
    stopTts();
  }

  // Click choice
  function handleChoice(choice: Choice, index: number) {
    if (!scene || showFollowUp) return;
    if (isPinned) {
      // 被老師 pin 住，記錄投票但不前進
      playSound("pop");
      setPendingVote({ sceneId: scene.id, choiceIndex: index });
      if (classSession) {
        void setStudentVote(classSession.roomCode, classSession.studentUid, scene.id, index);
      }
      return;
    }
    playSound("click");

    const newScores = applyDelta(scores, choice.delta);
    setScores(newScores);

    if (choice.setBranch) setBranch(choice.setBranch);

    const nextId = choice.next ?? scene.next;
    const willEnd = scene.isEnding || !nextId;

    setHistory((h) => [
      ...h,
      { sceneId: scene.id, choiceIndex: index, followUp: choice.followUp, delta: choice.delta },
    ]);

    if (choice.followUp) {
      setShowFollowUp(choice.followUp);
      setPendingNext(willEnd ? { id: "__end__", isEnding: true } : { id: nextId!, isEnding: false });
    } else {
      proceed(willEnd ? "__end__" : nextId!, willEnd, newScores);
    }
  }

  function proceed(nextId: string, isEnding: boolean, finalScores: Scores) {
    if (isEnding || nextId === "__end__") {
      const type = deriveType(finalScores);
      try {
        sessionStorage.setItem(
          "mbti-result",
          JSON.stringify({ scores: finalScores, branch, historyLen: history.length + 1 }),
        );
      } catch {
        // ignore (private mode etc.)
      }
      // 班級模式：上傳 finalType 到 RTDB
      if (classSession) {
        import("@/lib/classroom-rtdb").then((mod) =>
          mod.setStudentFinalType(classSession.roomCode, classSession.studentUid, type),
        );
      }
      const suffix = classSession ? `?room=${classSession.roomCode}` : "";
      router.push(`/result/${type}${suffix}`);
      return;
    }
    setSceneId(nextId);
    playSound("pageTurn");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 班級模式：上傳當前場景 + 分數
    if (classSession) {
      void updateStudentProgress(classSession.roomCode, classSession.studentUid, {
        currentScene: nextId,
        currentBranch: branch,
        score: finalScores,
      });
    }
  }

  function dismissFollowUp() {
    if (!pendingNext) return;
    const next = pendingNext;
    setShowFollowUp(null);
    setPendingNext(null);
    proceed(next.id, next.isEnding, scores);
  }

  function handleRestart() {
    setSceneId(START_SCENE_ID);
    setScores(initialScores);
    setBranch("main");
    setHistory([]);
    setShowFollowUp(null);
    setPendingNext(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!scene) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-xl mb-4">場景找不到了 😢</p>
          <HomeToButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      {/* 場景變動時自動切換 BGM track (依當前場景所屬支線) */}
      <BgmController track={scene ? BRANCH_TO_BGM[scene.branch] : "game"} />
      {/* Top bar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <HomeToButton />
        <SoundButton
          sound="whoosh"
          onClick={handleRestart}
          className="text-xs sm:text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-coral)] underline underline-offset-4"
        >
          ↻ 從頭再玩
        </SoundButton>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 班級模式 badge */}
        {classSession && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 border-2 border-violet-300 text-violet-800">
              🎓 班級模式 ・ 房號 {classSession.roomCode}
            </span>
          </div>
        )}

        {/* 老師 Pin 提示 */}
        {isPinned && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl p-4 mb-4 shadow-lg border-4 border-white"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">📌</span>
              <div>
                <div className="font-black text-lg">老師正在引導大家討論</div>
                <div className="text-sm opacity-95">
                  {pinReason || "請等老師讓大家繼續，先想想你想選什麼"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <ProgressDots chapter={scene.chapter} total={TOTAL_CHAPTERS} />

        {/* 支線標籤 */}
        {branch !== "main" && (
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/80 border border-[var(--color-ink)]/15 text-[var(--color-ink)]/70">
              {branch === "sport" && "🏃 校隊組"}
              {branch === "art" && "🎨 藝術組"}
              {branch === "study" && "📚 學術組"}
              {branch === "friend" && "🤝 友誼組"}
            </span>
          </div>
        )}

        {/* 透視容器：讓子層的 rotateY 看起來有翻書感 */}
        <div style={{ perspective: 1400 }} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, rotateY: 30, x: 100, scale: 0.92 }}
            animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -30, x: -100, scale: 0.92 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "center center", transformStyle: "preserve-3d" }}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-2xl relative overflow-hidden"
          >
            {/* 翻頁的脊邊陰影（左側陰影模擬書脊光影）— 手機縮窄避免吃內容 */}
            <div className="absolute inset-y-0 left-0 w-4 sm:w-12 pointer-events-none bg-gradient-to-r from-black/8 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-4 sm:w-12 pointer-events-none bg-gradient-to-l from-black/4 to-transparent" />
            {/* 場景背景 emoji 點綴 — 手機縮小避免吃文字 */}
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-6xl sm:text-9xl opacity-10 select-none pointer-events-none">
              {scene.bg}
            </div>

            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-coral)] mb-1">
              📍 <RubyText>{scene.location}</RubyText>
            </p>

            {scene.speaker && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{scene.speakerEmoji}</span>
                <span className="font-bold text-[var(--color-ink)]/80">
                  <RubyText>{scene.speaker}</RubyText>
                </span>
              </div>
            )}

            <div className="space-y-3 mb-3 text-base sm:text-lg leading-relaxed text-[var(--color-ink)] zhuyin-spaced">
              {scene.text.map((p, i) => (
                <p key={i}>
                  <RubyText>{p}</RubyText>
                </p>
              ))}
            </div>

            {/* TTS 控制 (僅 TTS 開啟時顯示) */}
            {ttsEnabled && (
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={speakCurrentScene}
                  title="再唸一次"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-200 transition"
                >
                  <span>🔊</span>
                  <span>再唸一次</span>
                </button>
                <button
                  onClick={stopSpeaking}
                  title="停止朗讀"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)]/70 text-xs font-bold hover:border-amber-300 transition"
                >
                  <span>⏸</span>
                  <span>停止</span>
                </button>
              </div>
            )}

            <div className="border-t-2 border-dashed border-[var(--color-ink)]/15 pt-5">
              <p className="text-sm font-bold text-[var(--color-ink)]/60 mb-3">💭 你會怎麼做？</p>
              <div className="space-y-3">
                {scene.choices.map((c, i) => {
                  const isVoted = pendingVote && pendingVote.sceneId === sceneId && pendingVote.choiceIndex === i;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleChoice(c, i)}
                      disabled={!!showFollowUp}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`choice-option w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition group relative min-h-[56px] ${
                        isVoted
                          ? "border-rose-500 bg-rose-50 ring-2 ring-rose-300/50"
                          : "border-[var(--color-ink)]/15 hover:border-[var(--color-coral)] hover:bg-[var(--color-cream)] active:bg-[var(--color-cream)]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        {c.emoji && (
                          <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                            {c.emoji}
                          </span>
                        )}
                        <span className="flex-1 font-medium text-sm sm:text-base leading-snug min-w-0">
                          <RubyText>{c.text}</RubyText>
                        </span>
                        {isVoted && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black animate-pulse">
                            ✓ 已投
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {isPinned && pendingVote && pendingVote.sceneId === sceneId && (
                <p className="text-xs text-rose-700 mt-3 text-center font-bold">
                  💡 你已投票，等老師結束討論後會自動往下走（可改投別的選項）
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* 課前快測 modal (只在開頭顯示一次) */}
      <AnimatePresence>
        {showPretest && <PretestQuiz onDone={() => setShowPretest(false)} />}
      </AnimatePresence>

      {/* Follow-up modal */}
      <AnimatePresence>
        {showFollowUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={dismissFollowUp}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-3 text-center">✨</div>
              <p className="text-base sm:text-xl text-center leading-relaxed text-[var(--color-ink)] zhuyin-spaced">
                <RubyText>{showFollowUp}</RubyText>
              </p>
              <SoundButton
                sound="whoosh"
                onClick={dismissFollowUp}
                className="btn-3d mt-6 w-full py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90"
              >
                繼續故事 →
              </SoundButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
