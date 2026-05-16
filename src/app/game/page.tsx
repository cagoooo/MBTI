"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getScene, START_SCENE_ID, TOTAL_CHAPTERS } from "@/lib/scenes";
import { applyDelta, deriveType, initialScores } from "@/lib/scoring";
import type { Branch, Choice, Scene, Scores } from "@/lib/types";
import ProgressDots from "@/components/ProgressDots";
import HomeToButton from "@/components/HomeToButton";

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

  const scene: Scene | undefined = useMemo(() => getScene(sceneId), [sceneId]);

  // Click choice
  function handleChoice(choice: Choice, index: number) {
    if (!scene || showFollowUp) return;

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
      {/* Top bar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <HomeToButton />
        <button
          onClick={handleRestart}
          className="text-xs sm:text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-coral)] underline underline-offset-4"
        >
          ↻ 從頭再玩
        </button>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-lg relative overflow-hidden"
          >
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

            <div className="space-y-3 mb-6 text-lg leading-relaxed text-[var(--color-ink)]">
              {scene.text.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

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
              <button
                onClick={dismissFollowUp}
                className="btn-3d mt-6 w-full py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90"
              >
                繼續故事 →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
