"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getScene, START_SCENE_ID, TOTAL_CHAPTERS } from "@/lib/scenes";
import { applyDelta, deriveType, initialScores } from "@/lib/scoring";
import type { Branch, Choice, Scene, Scores } from "@/lib/types";
import ProgressDots from "@/components/ProgressDots";
import HomeToButton from "@/components/HomeToButton";
import BgmController from "@/components/BgmController";
import SoundButton from "@/components/SoundButton";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speakScene, stop as stopTts, speak as speakTts } from "@/lib/tts";

interface HistoryEntry {
  sceneId: string;
  choiceIndex: number;
  followUp?: string;
  delta: Choice["delta"];
}

export default function GamePage() {
  const router = useRouter();

  const [sceneId, setSceneId] = useState<string>(START_SCENE_ID);
  const [scores, setScores] = useState<Scores>(initialScores);
  const [branch, setBranch] = useState<Branch>("main");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);
  const [pendingNext, setPendingNext] = useState<{ id: string; isEnding: boolean } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);

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
      router.push(`/result/${type}`);
      return;
    }
    setSceneId(nextId);
    playSound("pageTurn");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
      <BgmController track="game" />
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
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-2xl relative overflow-hidden"
          >
            {/* 翻頁的脊邊陰影（左側陰影模擬書脊光影） */}
            <div className="absolute inset-y-0 left-0 w-12 pointer-events-none bg-gradient-to-r from-black/8 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-12 pointer-events-none bg-gradient-to-l from-black/4 to-transparent" />
            {/* 場景背景 emoji 點綴 */}
            <div className="absolute -top-6 -right-6 text-9xl opacity-10 select-none pointer-events-none">
              {scene.bg}
            </div>

            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-coral)] mb-1">
              📍 {scene.location}
            </p>

            {scene.speaker && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{scene.speakerEmoji}</span>
                <span className="font-bold text-[var(--color-ink)]/80">{scene.speaker}</span>
              </div>
            )}

            <div className="space-y-3 mb-3 text-lg leading-relaxed text-[var(--color-ink)]">
              {scene.text.map((p, i) => (
                <p key={i}>{p}</p>
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
                {scene.choices.map((c, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleChoice(c, i)}
                    disabled={!!showFollowUp}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-4 rounded-2xl border-2 border-[var(--color-ink)]/15 hover:border-[var(--color-coral)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition group"
                  >
                    <div className="flex items-start gap-3">
                      {c.emoji && (
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {c.emoji}
                        </span>
                      )}
                      <span className="flex-1 font-medium leading-snug">{c.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

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
              <p className="text-lg sm:text-xl text-center leading-relaxed text-[var(--color-ink)]">
                {showFollowUp}
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
