"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRETEST_QUESTIONS,
  assembleType,
  savePretestGuess,
  type PretestAnswers,
} from "@/lib/pretest";
import { playSound } from "@/lib/sound";

interface Props {
  /** 完成或跳過時呼叫，繼續流程 */
  onDone: () => void;
}

/**
 * 課前快測 modal — 4 題快選 (8 秒做完)
 *
 * 設計：
 *   - 一頁一題、超快節奏
 *   - 跳過按鈕：給已經做過 MBTI / 不想做的人
 *   - 完成後存 sessionStorage，結果頁會用
 */
export default function PretestQuiz({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PretestAnswers>({});
  const [finished, setFinished] = useState(false);

  const total = PRETEST_QUESTIONS.length;
  const q = PRETEST_QUESTIONS[step];

  function pick(letter: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P") {
    playSound("pop");
    const next = { ...answers, [q.id]: letter } as PretestAnswers;
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      // 全做完，存起來、進入「完成」畫面
      const guess = assembleType(next);
      if (guess) savePretestGuess(guess, next);
      setFinished(true);
    }
  }

  function skip() {
    playSound("toggleOff");
    onDone();
  }

  function finishAndStart() {
    playSound("click");
    onDone();
  }

  const guess = finished ? assembleType(answers) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[var(--color-ink)]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden"
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {!finished ? (
          <>
            {/* 進度條 */}
            <div className="flex items-center gap-1.5 mb-4">
              {PRETEST_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < step
                      ? "bg-[var(--color-coral)]"
                      : i === step
                        ? "bg-[var(--color-coral)]/70"
                        : "bg-[var(--color-ink)]/10"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-[var(--color-ink)]/50 font-bold uppercase tracking-wider mb-1">
              📋 開始前小測驗 ({step + 1}/{total}) · 8 秒做完
            </p>
            <h2 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2">
              <span>{q.icon}</span>
              <span>猜猜你是哪型？</span>
            </h2>
            <p className="text-sm text-[var(--color-ink)]/70 mb-5">
              這不會影響故事，純粹給你結束後對照看自己有多了解自己
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-base sm:text-lg font-bold mb-4">{q.prompt}</p>
                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <motion.button
                      key={opt.letter}
                      onClick={() => pick(opt.letter)}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-3.5 rounded-2xl border-2 border-[var(--color-ink)]/15 hover:border-[var(--color-coral)] hover:bg-[var(--color-cream)] active:bg-[var(--color-cream)] transition min-h-[60px] flex items-center gap-3"
                    >
                      <span className="text-2xl shrink-0">{opt.emoji}</span>
                      <span className="flex-1 font-medium">{opt.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-cream)] font-bold text-[var(--color-ink)]/60">
                        {opt.tag}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={skip}
              className="mt-5 w-full text-center text-sm text-[var(--color-ink)]/50 hover:text-[var(--color-coral)] underline underline-offset-4 transition"
            >
              先跳過，直接開始 →
            </button>
          </>
        ) : (
          /* 完成畫面 */
          <div className="text-center py-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
              className="text-7xl mb-3"
            >
              🔮
            </motion.div>
            <p className="text-sm text-[var(--color-ink)]/60 font-bold uppercase tracking-wider mb-1">
              你猜你是
            </p>
            <h2 className="text-5xl font-black text-[var(--color-coral)] mb-3 tracking-widest">
              {guess}
            </h2>
            <p className="text-base text-[var(--color-ink)]/70 leading-relaxed mb-6 px-2">
              這個猜測會保留到結束 — 等故事跑完，我們再來看看你猜得準不準！
            </p>
            <button
              onClick={finishAndStart}
              className="btn-3d w-full py-3.5 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90"
            >
              🎒 開始冒險！
            </button>
            <button
              onClick={() => {
                playSound("toggleOff");
                setAnswers({});
                setStep(0);
                setFinished(false);
              }}
              className="mt-3 text-xs text-[var(--color-ink)]/50 hover:text-[var(--color-coral)] underline"
            >
              ↻ 重新選一次
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
