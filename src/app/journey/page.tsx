"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import SoundLink from "@/components/SoundLink";
import SoundButton from "@/components/SoundButton";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import { getMBTIInfo } from "@/lib/mbti";
import { getSelStyleInfo, type SelStyle } from "@/lib/sel";
import type { MBTIType, Scores } from "@/lib/types";
import { deriveType } from "@/lib/scoring";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";

/**
 * 🎒 自我探索三部曲 — 一個課程包把 MBTI / SEL / 猜朋友 串起來
 *
 * 適合 45 分鐘輔導課 / 班會 / SEL 主題課
 *
 * 學生看到的:
 *   - 三個大卡並排 (依完成狀態變色 + 標記)
 *   - 點卡開始該段
 *   - 三段都完成 → 解鎖綜合報告
 *
 * 老師備課省力:
 *   - 一頁看完三段時程 + 教學目標
 *   - 不用個別說明三個入口
 *   - 完成綜合報告可印 PDF 給學生帶回家
 */

interface JourneyState {
  mbti: { type: MBTIType; scores: Scores } | null;
  sel: { style: SelStyle; scores: { express: number; solve: number; calm: number; connect: number } } | null;
  guess: { total: number; correct: number } | null;
}

export default function JourneyPage() {
  const [state, setState] = useState<JourneyState>({ mbti: null, sel: null, guess: null });
  const [showCert, setShowCert] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    refresh();
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    // 從別頁回來時也要更新
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const refreshTts = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refreshTts);
    window.addEventListener("mbti-settings-change", refreshTts);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("storage", refreshTts);
      window.removeEventListener("mbti-settings-change", refreshTts);
    };
  }, []);

  // 進場自動朗讀 hero 介紹一次 (只在 TTS 開啟 + 還沒朗讀過)
  useEffect(() => {
    if (!ttsEnabled || introSpoken) return;
    const t = setTimeout(() => {
      const done = [state.mbti, state.sel, state.guess].filter(Boolean).length;
      const intro = [
        "自我探索三部曲！",
        "一節 45 分鐘輔導課，跑完三段體驗。",
        done === 0
          ? "三段都還沒開始，從任何一站開始都可以。"
          : done === 3
            ? "恭喜你！三段都完成了，可以看綜合報告囉。"
            : `你已經完成 ${done} 段，再 ${3 - done} 段就完成全部探索囉！`,
      ].join("。");
      speakTts(intro, { rate: 1.0, pitch: 1.08 });
      setIntroSpoken(true);
    }, 600);
    return () => {
      clearTimeout(t);
      stopTts();
    };
  }, [ttsEnabled, introSpoken]); // eslint-disable-line react-hooks/exhaustive-deps

  function refresh() {
    try {
      // MBTI
      const mbtiRaw = sessionStorage.getItem("mbti-result");
      const mbti = mbtiRaw ? (() => {
        const parsed = JSON.parse(mbtiRaw) as { scores: Scores };
        const type = deriveType(parsed.scores) as MBTIType;
        return { type, scores: parsed.scores };
      })() : null;

      // SEL
      const selRaw = sessionStorage.getItem("mbti-sel-result");
      const sel = selRaw ? (JSON.parse(selRaw) as { style: SelStyle; scores: { express: number; solve: number; calm: number; connect: number } }) : null;

      // Guess
      const guessRaw = sessionStorage.getItem("mbti-guess-result");
      const guess = guessRaw ? (JSON.parse(guessRaw) as { total: number; correct: number }) : null;

      setState({ mbti, sel, guess });
    } catch {}
  }

  const doneCount = [state.mbti, state.sel, state.guess].filter(Boolean).length;
  const allDone = doneCount === 3;

  function resetAll() {
    if (!confirm("確定重置三部曲進度？所有結果會清掉。")) return;
    playSound("toggleOff");
    try {
      sessionStorage.removeItem("mbti-result");
      sessionStorage.removeItem("mbti-sel-result");
      sessionStorage.removeItem("mbti-guess-result");
    } catch {}
    refresh();
  }

  function printSummary() {
    playSound("coin");
    window.print();
  }

  // 徽章打開時朗讀祝賀
  useEffect(() => {
    if (!showCert || !ttsEnabled) return;
    const t = setTimeout(() => {
      speakTts(
        "恭喜你獲得自我探索王徽章！你完整跑完三部曲：MBTI、SEL 情緒、猜朋友 — 對自己有了更深的認識。",
        { rate: 1.0, pitch: 1.1 },
      );
    }, 400);
    return () => {
      clearTimeout(t);
      stopTts();
    };
  }, [showCert, ttsEnabled]);

  // 朗讀綜合詮釋
  function speakSummary() {
    if (!state.mbti || !state.sel) return;
    playSound("tap");
    const mbtiInfo = getMBTIInfo(state.mbti.type);
    const selInfo = getSelStyleInfo(state.sel.style);
    const guessRate = state.guess ? Math.round((state.guess.correct / state.guess.total) * 100) : 0;
    const text = [
      `你的綜合報告：`,
      `你是一個 ${mbtiInfo.nickname}，MBTI 類型 ${state.mbti.type}。`,
      mbtiInfo.oneLiner,
      `面對情緒時，你主要用 ${selInfo.nickname} 的方式接住自己。`,
      selInfo.oneLiner,
      state.guess && state.guess.correct / state.guess.total >= 0.5
        ? `你對朋友的觀察很細，${guessRate}% 猜對。`
        : `你對朋友的觀察猜中 ${guessRate}%，下次可以多注意他們的選擇細節。`,
    ].join("。");
    speakTts(text, { rate: 1.0, pitch: 1.05 });
  }

  function stopSpeaking() {
    playSound("toggleOff");
    stopTts();
  }

  return (
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/journey" />
      <BgmController track="home" />
      <div className="max-w-5xl mx-auto">
        {/* 列印時不顯示這些 */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3 print-hide">
          
          {doneCount > 0 && (
            <button
              onClick={resetAll}
              className="text-xs text-[var(--color-ink)]/50 hover:text-rose-600 underline underline-offset-4"
            >
              ↻ 重置三部曲進度
            </button>
          )}
        </div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[var(--color-coral)] via-rose-400 to-fuchsia-500 rounded-[2rem] p-6 sm:p-10 text-white shadow-xl border-4 border-white/60 relative overflow-hidden print-hide"
        >
          <div className="absolute -top-6 -right-6 text-9xl opacity-15">🎒</div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/95 mb-2 drop-shadow">
            🎓 完整 45 分鐘輔導課程包
          </p>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 drop-shadow-lg">
            自我探索<br className="sm:hidden" />三部曲
          </h1>
          <p className="text-base sm:text-lg text-white/95 leading-relaxed max-w-2xl drop-shadow">
            一節輔導課，跑完三段體驗 — 認識自己的人格、了解情緒因應方式、深化班級認識。
            老師備課直接用，學生帶綜合報告回家。
          </p>

          {/* 進度條 */}
          <div className="mt-5 bg-white/20 backdrop-blur rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
              <span>進度</span>
              <span>{doneCount} / 3 完成</span>
            </div>
            <div className="bg-white/30 rounded-full h-2 overflow-hidden">
              <motion.div
                animate={{ width: `${(doneCount / 3) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-white rounded-full"
              />
            </div>
            {allDone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs sm:text-sm font-black text-white mt-2 text-center"
              >
                🎉 三段全部完成！你解鎖了「自我探索王」徽章
              </motion.p>
            )}
          </div>
        </motion.section>

        {/* 三個課程卡 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 print-hide">
          {/* 第一站 MBTI */}
          <JourneyCard
            step={1}
            title="MBTI 校園奇遇記"
            subtitle="10 分鐘 · 故事 RPG"
            description="從開學第一天到校慶大結局，用 30+ 場景選擇揭曉你的 16 型人格"
            href="/game"
            emoji="🎒"
            gradient="from-amber-300 to-orange-400"
            done={!!state.mbti}
            doneLabel={state.mbti ? `${getMBTIInfo(state.mbti.type).emoji} ${state.mbti.type}` : null}
            doneDetail={state.mbti ? getMBTIInfo(state.mbti.type).nickname : null}
            doneHref={state.mbti ? `/result/${state.mbti.type}` : null}
          />
          {/* 第二站 SEL */}
          <JourneyCard
            step={2}
            title="SEL 逆境特別篇"
            subtitle="8 分鐘 · 情緒探索"
            description="6 個情緒情境探索你的「情緒因應風格」+ 拿到專屬情緒工具箱"
            href="/sel"
            emoji="🌧️"
            gradient="from-violet-400 to-fuchsia-500"
            done={!!state.sel}
            doneLabel={state.sel ? `${getSelStyleInfo(state.sel.style).emoji} ${getSelStyleInfo(state.sel.style).nickname}` : null}
            doneDetail={state.sel ? "點看完整結果" : null}
            doneHref={state.sel ? "/sel" : null}
            badge="教育部重點"
          />
          {/* 第三站 猜朋友 */}
          <JourneyCard
            step={3}
            title="猜朋友 MBTI"
            subtitle="10 分鐘 · 班級互動"
            description="打破刻板印象 — 猜班上同學是哪型，看你對朋友了解多深"
            href="/guess"
            emoji="🎲"
            gradient="from-orange-400 to-amber-500"
            done={!!state.guess}
            doneLabel={state.guess ? `${state.guess.correct} / ${state.guess.total} 猜對` : null}
            doneDetail={state.guess ? `${Math.round((state.guess.correct / state.guess.total) * 100)}% 準確率` : null}
            doneHref={state.guess ? "/guess" : null}
          />
        </div>

        {/* 完成全部 → 顯示綜合報告 */}
        {allDone && state.mbti && state.sel && (
          <AnimatePresence>
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-md relative overflow-hidden journey-summary"
            >
              <div className="absolute -top-4 -right-4 text-7xl opacity-15 print-hide">🏆</div>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 flex items-center gap-2">
                  <span>🏆</span>
                  <span>你的自我探索綜合報告</span>
                </h2>
                <div className="flex gap-2 print-hide flex-wrap">
                  <SoundButton
                    sound="coin"
                    onClick={printSummary}
                    className="btn-3d px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600"
                  >
                    🖨️ 列印 / 存 PDF
                  </SoundButton>
                  {ttsEnabled && (
                    <SoundButton
                      sound="tap"
                      onClick={speakSummary}
                      className="px-4 py-2 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold text-sm hover:bg-amber-200"
                    >
                      🔊 唸給我聽
                    </SoundButton>
                  )}
                  <button
                    onClick={() => setShowCert((v) => !v)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50"
                  >
                    🎖️ 看徽章
                  </button>
                </div>
              </div>

              {/* 綜合卡 — 三段並陳 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <SummaryBlock
                  title="🎒 MBTI 人格類型"
                  emoji={getMBTIInfo(state.mbti.type).emoji}
                  bigText={state.mbti.type}
                  subText={getMBTIInfo(state.mbti.type).nickname}
                  caption={getMBTIInfo(state.mbti.type).oneLiner}
                  color="amber"
                />
                <SummaryBlock
                  title="🌧️ 情緒因應風格"
                  emoji={getSelStyleInfo(state.sel.style).emoji}
                  bigText={getSelStyleInfo(state.sel.style).nickname}
                  subText="SEL 因應風格"
                  caption={getSelStyleInfo(state.sel.style).oneLiner}
                  color="violet"
                />
                <SummaryBlock
                  title="🎲 對朋友的觀察力"
                  emoji="🎲"
                  bigText={`${Math.round(((state.guess?.correct ?? 0) / (state.guess?.total || 1)) * 100)}%`}
                  subText="猜中準確率"
                  caption={`${state.guess?.correct} / ${state.guess?.total} 猜對`}
                  color="orange"
                />
              </div>

              {/* 一段綜合詮釋 */}
              <div className="bg-white/70 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-black text-emerald-900 mb-2">📜 給你的綜合詮釋</h3>
                <p className="text-sm sm:text-base text-emerald-900/90 leading-relaxed">
                  你是一個 <strong>{getMBTIInfo(state.mbti.type).nickname}</strong>，
                  面對情緒時主要用 <strong>{getSelStyleInfo(state.sel.style).nickname}</strong> 的方式接住自己。
                  {state.guess && state.guess.correct / state.guess.total >= 0.5
                    ? `你對朋友的觀察很細，${Math.round((state.guess.correct / state.guess.total) * 100)}% 猜對 — 平常一定很用心認識身邊的人 ✨`
                    : state.guess && state.guess.correct / state.guess.total >= 0.25
                      ? `這次猜朋友只中了 ${Math.round((state.guess.correct / state.guess.total) * 100)}% — 這也很棒，代表班上的人都比你想的更多元 🌈`
                      : "對朋友的觀察可以再深一點，下次可以多注意他們的選擇細節 💡"}
                </p>
              </div>

              {/* 給老師的話 */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed print-hide">
                <strong>💡 給老師：</strong>學生完成三部曲後，可以開放討論
                「你的 MBTI 跟你的情緒風格之間有沒有關聯？」「猜朋友時你最意外的是什麼？」
                — 引導學生說出自己的觀察。
              </div>
            </motion.section>
          </AnimatePresence>
        )}

        {/* 還沒做完 → 提示 */}
        {!allDone && (
          <section className="mt-6 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 print-hide">
            <p className="text-sm text-amber-900 leading-relaxed">
              💡 完成全部三段後，這裡會自動出現「綜合報告」與「自我探索王」徽章。
              三段順序不重要，可以從任何一站開始。
            </p>
          </section>
        )}

        {/* 給老師備課指南 */}
        <section className="mt-8 bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 shadow-sm print-hide">
          <h2 className="text-xl font-black mb-3 flex items-center gap-2">
            <span>🎓</span> 給老師的備課指南
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[var(--color-ink)]/80">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <p className="font-black text-amber-900 mb-2">⏱️ 時間規劃</p>
              <ul className="space-y-1 leading-relaxed">
                <li>• 0-10 min：MBTI</li>
                <li>• 10-20 min：SEL</li>
                <li>• 20-30 min：猜朋友</li>
                <li>• 30-45 min：分組討論 + 反思</li>
              </ul>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="font-black text-violet-900 mb-2">🎯 教學目標</p>
              <ul className="space-y-1 leading-relaxed">
                <li>• 認識自我人格傾向</li>
                <li>• 覺察情緒因應方式</li>
                <li>• 打破刻板印象</li>
                <li>• 練習尊重多元</li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="font-black text-emerald-900 mb-2">💬 反思題建議</p>
              <ul className="space-y-1 leading-relaxed">
                <li>• 你跑出來的型跟你猜的一樣嗎？</li>
                <li>• 你的情緒工具箱想先試哪一個？</li>
                <li>• 你猜錯誰最讓你意外？</li>
                <li>• 班上跟你最像的是誰？</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 徽章 modal */}
      <AnimatePresence>
        {showCert && allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCert(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-8xl mb-3 animate-wiggle">🏆</div>
              <h2 className="text-3xl font-black text-amber-900 mb-2">自我探索王</h2>
              <p className="text-sm text-amber-900/80 mb-5">
                你完整跑完三部曲 — MBTI、SEL、猜朋友 — 對自己有了更深的認識 ✨
              </p>
              <button
                onClick={() => setShowCert(false)}
                className="btn-3d px-6 py-3 rounded-2xl bg-white text-amber-700 font-black hover:bg-amber-50"
              >
                太棒了 →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print 樣式 */}
      <style jsx global>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: white !important; }
          .journey-summary {
            background: white !important;
            border: 2px solid #059669 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ──────────── 子元件 ────────────

function JourneyCard({
  step,
  title,
  subtitle,
  description,
  href,
  emoji,
  gradient,
  done,
  doneLabel,
  doneDetail,
  doneHref,
  badge,
}: {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  emoji: string;
  gradient: string;
  done: boolean;
  doneLabel: string | null;
  doneDetail: string | null;
  doneHref: string | null;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-5 sm:p-6 border-4 ${done ? "border-emerald-400 ring-4 ring-emerald-200" : "border-white"} shadow-lg overflow-hidden`}
    >
      {/* 步驟 # */}
      <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/40 backdrop-blur flex items-center justify-center text-white font-black text-lg">
        {step}
      </div>
      {/* 完成 badge */}
      {done && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
          <span>✓</span><span>已完成</span>
        </div>
      )}
      {/* 特殊 badge */}
      {!done && badge && (
        <div className="absolute top-3 right-3 bg-white text-violet-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-violet-300">
          {badge}
        </div>
      )}

      <div className="mt-8">
        <div className="text-5xl mb-2">{emoji}</div>
        <h3 className="text-xl font-black text-white drop-shadow mb-1">{title}</h3>
        <p className="text-xs font-bold text-white/85 drop-shadow mb-2">{subtitle}</p>
        <p className="text-sm text-white/95 leading-relaxed drop-shadow mb-4">{description}</p>

        {done && doneLabel ? (
          <div className="bg-white/85 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-[var(--color-ink)]/60 uppercase">你的結果</p>
            <p className="text-lg font-black text-[var(--color-coral)] my-1">{doneLabel}</p>
            {doneDetail && (
              <Link
                href={doneHref ?? href}
                className="text-xs underline text-[var(--color-ink)]/70 hover:text-[var(--color-coral)]"
              >
                {doneDetail} →
              </Link>
            )}
            <SoundLink
              href={href}
              sound="tap"
              className="block mt-2 text-xs text-[var(--color-ink)]/60 hover:text-[var(--color-coral)] underline"
            >
              ↻ 再玩一次
            </SoundLink>
          </div>
        ) : (
          <SoundLink
            href={href}
            sound="click"
            className="btn-3d block text-center py-3 rounded-xl bg-white text-[var(--color-ink)] font-black hover:bg-white/90 transition"
          >
            開始第 {step} 站 →
          </SoundLink>
        )}
      </div>
    </motion.div>
  );
}

function SummaryBlock({
  title,
  emoji,
  bigText,
  subText,
  caption,
  color,
}: {
  title: string;
  emoji: string;
  bigText: string;
  subText: string;
  caption: string;
  color: "amber" | "violet" | "orange";
}) {
  const colorMap = {
    amber: "from-amber-100 to-orange-100 border-amber-300 text-amber-900",
    violet: "from-violet-100 to-fuchsia-100 border-violet-300 text-violet-900",
    orange: "from-orange-100 to-yellow-100 border-orange-300 text-orange-900",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-4 border-2 text-center`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{title}</p>
      <div className="text-3xl mb-1">{emoji}</div>
      <p className="text-2xl font-black tracking-wider mb-0.5">{bigText}</p>
      <p className="text-xs font-bold opacity-80">{subText}</p>
      <p className="text-[11px] opacity-70 mt-1.5 leading-snug">{caption}</p>
    </div>
  );
}
