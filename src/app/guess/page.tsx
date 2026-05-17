"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import { parseClassInput } from "@/lib/parse-class";
import { addHistory } from "@/lib/history";

/**
 * 🤔 「猜朋友的 MBTI」遊戲模式
 *
 * 玩法:
 *   1. 老師 / 學生 貼一份「名字 + 真實 MBTI」名單 (從 /class-stats 拿過來)
 *   2. 系統隨機洗牌，一個一個顯示同學名字
 *   3. 玩家從 16 型挑一個猜
 *   4. 全部猜完，顯示對照結果 + 趣味統計
 *
 * 教育價值:
 *   - 打破刻板印象 (有人外表像 ESTP 內心其實是 ISFP)
 *   - 班級互相認識深度 +
 *   - 引發討論「為什麼我猜錯？」
 *
 * 注意:
 *   - 為避免人身評論，不顯示「個人最差猜中率」
 *   - 結果是「我自己猜中幾個」(不公開比較)
 */

type Phase = "input" | "guess" | "result";

interface Person {
  name: string;
  actual: MBTIType;
}

interface Guess {
  person: Person;
  guessed: MBTIType;
}

const STORAGE_KEY = "mbti-guess-roster";

export default function GuessGamePage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [rosterText, setRosterText] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [revealed, setRevealed] = useState<MBTIType | null>(null); // 當前題目選完顯示對照
  const [parseError, setParseError] = useState<string | null>(null);

  // 從 /class-stats 或之前儲存的 roster 自動帶入
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        setRosterText(cached);
        return;
      }
      // 從 class-stats 拿最近的 roster
      const keys = Object.keys(sessionStorage);
      for (const k of keys) {
        if (k.startsWith("mbti-class-roster-")) {
          const v = sessionStorage.getItem(k);
          if (v) {
            setRosterText(v);
            break;
          }
        }
      }
    } catch {}
  }, []);

  function startGuessing() {
    const { entries, invalidLines } = parseClassInput(rosterText);
    const named = entries.filter((e) => e.name);
    if (named.length < 3) {
      setParseError(`至少需要 3 位有名字的同學。目前解析到 ${named.length} 位有名字的。`);
      playSound("toggleOff");
      return;
    }
    if (invalidLines.length > 0 && named.length < 5) {
      setParseError(`有 ${invalidLines.length} 行無法解析，且有效名單只有 ${named.length} 人。`);
      playSound("toggleOff");
      return;
    }
    setParseError(null);
    // 洗牌
    const shuffled = [...named].map((e) => ({ name: e.name!, actual: e.type })).sort(() => Math.random() - 0.5);
    setPeople(shuffled);
    setCurrentIdx(0);
    setGuesses([]);
    setRevealed(null);
    setPhase("guess");
    try {
      sessionStorage.setItem(STORAGE_KEY, rosterText);
    } catch {}
    playSound("click");
  }

  function pickGuess(type: MBTIType) {
    if (revealed) return;
    const person = people[currentIdx];
    if (!person) return;
    setRevealed(type);
    setGuesses((g) => [...g, { person, guessed: type }]);
    // 對的 / 錯的 給不同音效
    if (type === person.actual) playSound("coin");
    else playSound("pop");
  }

  function nextQuestion() {
    setRevealed(null);
    if (currentIdx < people.length - 1) {
      setCurrentIdx(currentIdx + 1);
      playSound("pageTurn");
    } else {
      // 結束 → 存完成 flag 給 /journey 看
      const correctCount = guesses.filter((g) => g.guessed === g.person.actual).length;
      try {
        sessionStorage.setItem(
          "mbti-guess-result",
          JSON.stringify({ total: people.length, correct: correctCount, at: Date.now() }),
        );
        // U1 學習歷程冊：跨次 localStorage 紀錄
        const axes = { EI: 0, SN: 0, TF: 0, JP: 0 };
        for (const g of guesses) {
          if (g.guessed[0] === g.person.actual[0]) axes.EI++;
          if (g.guessed[1] === g.person.actual[1]) axes.SN++;
          if (g.guessed[2] === g.person.actual[2]) axes.TF++;
          if (g.guessed[3] === g.person.actual[3]) axes.JP++;
        }
        addHistory({ kind: "guess", total: people.length, correct: correctCount, axes });
      } catch {}
      setPhase("result");
      playSound("reveal");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function restartFromInput() {
    playSound("whoosh");
    setPhase("input");
    setCurrentIdx(0);
    setGuesses([]);
    setRevealed(null);
  }

  function playAgainSameRoster() {
    playSound("whoosh");
    const shuffled = [...people].sort(() => Math.random() - 0.5);
    setPeople(shuffled);
    setCurrentIdx(0);
    setGuesses([]);
    setRevealed(null);
    setPhase("guess");
  }

  const currentPerson = people[currentIdx];

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      <BgmController track="home" />
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <HomeToButton />
        </div>

        {/* ─── Input ─── */}
        {phase === "input" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-10 border-4 border-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 text-9xl opacity-15">🤔</div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-700/80 mb-2 relative">
              🎲 班級互動遊戲
            </p>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 relative text-[var(--color-ink)]">
              你猜得到<br className="sm:hidden" />
              <span className="text-orange-700">同學是哪型嗎？</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink)]/80 leading-relaxed mb-5 relative">
              把全班的「名字 + 真實 MBTI」貼進來，系統隨機抽問你猜每個人是哪型 — 結束會告訴你猜對幾個 + 哪幾個最讓你意外。
            </p>

            <div className="bg-white/70 rounded-2xl p-4 mb-4 relative">
              <p className="text-sm font-bold mb-2 text-orange-900">📋 班級名單（每行一人）</p>
              <textarea
                value={rosterText}
                onChange={(e) => setRosterText(e.target.value)}
                placeholder={`小芸 ENFP\n阿哲 INTJ\n小傑 ESTP\n雅雯 INFJ\n宇航 ISFP`}
                className="w-full h-40 p-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none font-mono text-sm bg-white"
              />
              <p className="text-[11px] text-orange-700/60 mt-2 leading-relaxed">
                💡 格式很彈性：「小明 INTJ」、「小明: INTJ」、「小明,INTJ」都可以。
                也可以從<Link href="/class-stats" className="underline font-bold mx-1">📊 班級統計</Link>
                或<Link href="/teacher/history" className="underline font-bold mx-1">📈 班級歷史</Link>把名單複製過來。
              </p>
            </div>

            {parseError && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 mb-4 text-sm text-rose-800 relative">
                ⚠️ {parseError}
              </div>
            )}

            <button
              onClick={startGuessing}
              disabled={!rosterText.trim()}
              className="btn-3d w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-black hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative"
            >
              <span className="text-2xl">🎲</span>
              <span>開始猜！</span>
            </button>

            <div className="mt-5 p-4 rounded-2xl bg-amber-100/50 border border-amber-200 relative">
              <p className="text-xs font-black text-amber-900 mb-2">🎓 給老師：</p>
              <ul className="text-xs text-amber-800/80 space-y-1 leading-relaxed">
                <li>• 適合班級互相認識深化 / 破除刻板印象 / 引發討論</li>
                <li>• 玩完問學生「為什麼你會這樣猜？」最有教學價值</li>
                <li>• 結果不公開比較，避免人身評論</li>
                <li>• 學生先到 <Link href="/teacher/history" className="underline">/teacher/history</Link> 把名單複製過來最方便</li>
              </ul>
            </div>
          </motion.section>
        )}

        {/* ─── Guess (1-by-1) ─── */}
        {phase === "guess" && currentPerson && (
          <>
            {/* 進度 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-bold text-[var(--color-ink)]/60 uppercase tracking-wider">
                {currentIdx + 1} / {people.length}
              </span>
            </div>
            <div className="bg-[var(--color-ink)]/10 rounded-full h-2 mb-5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                animate={{ width: `${((currentIdx + (revealed ? 1 : 0)) / people.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* 問題卡 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPerson.name + currentIdx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-xl text-center"
              >
                <p className="text-sm font-bold text-[var(--color-ink)]/50 uppercase tracking-widest mb-3">
                  你猜這位同學是
                </p>
                <h2 className="text-4xl sm:text-6xl font-black mb-2 text-[var(--color-coral)]">
                  {currentPerson.name}
                </h2>
                <p className="text-sm text-[var(--color-ink)]/60 mb-6">他/她是哪一型？</p>

                {/* 16 型 grid */}
                <div className="grid grid-cols-4 gap-2">
                  {ALL_TYPES.map((t) => {
                    const isActual = revealed && t === currentPerson.actual;
                    const isPicked = revealed && t === revealed;
                    const isMatch = revealed === currentPerson.actual;
                    const info = getMBTIInfo(t);
                    return (
                      <button
                        key={t}
                        onClick={() => pickGuess(t)}
                        disabled={!!revealed}
                        className={`p-2 sm:p-3 rounded-xl border-2 transition text-center relative ${
                          isActual
                            ? "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300"
                            : isPicked && !isMatch
                              ? "bg-rose-100 border-rose-500 ring-2 ring-rose-300"
                              : revealed
                                ? "border-[var(--color-ink)]/10 opacity-40"
                                : "border-[var(--color-ink)]/15 hover:border-[var(--color-coral)] hover:bg-[var(--color-cream)]"
                        }`}
                      >
                        <div className="text-xl sm:text-2xl">{info.emoji}</div>
                        <div className="text-[10px] sm:text-xs font-black mt-1 tracking-wider">{t}</div>
                        {isActual && (
                          <span className="absolute -top-2 -right-2 text-base">✅</span>
                        )}
                        {isPicked && !isMatch && (
                          <span className="absolute -top-2 -right-2 text-base">👈</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reveal feedback */}
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"
                  >
                    {revealed === currentPerson.actual ? (
                      <p className="text-emerald-800 font-black text-lg flex items-center justify-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <span>猜對了！{currentPerson.name} 確實是 {currentPerson.actual}</span>
                      </p>
                    ) : (
                      <p className="text-rose-700 font-bold text-base flex flex-col items-center gap-1">
                        <span>你猜 <span className="font-mono">{revealed}</span>，</span>
                        <span>實際上 {currentPerson.name} 是 <span className="text-emerald-700 font-black font-mono">{currentPerson.actual}</span> 喔！</span>
                      </p>
                    )}
                    <SoundButton
                      sound="whoosh"
                      onClick={nextQuestion}
                      className="btn-3d mt-3 w-full py-2.5 rounded-xl bg-orange-500 text-white font-black hover:bg-orange-600"
                    >
                      {currentIdx < people.length - 1 ? "下一位 →" : "看結果 →"}
                    </SoundButton>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* ─── Result ─── */}
        {phase === "result" && (
          <GuessResultView
            guesses={guesses}
            onPlayAgain={playAgainSameRoster}
            onChangeRoster={restartFromInput}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────── Result ───────────────────

function GuessResultView({
  guesses,
  onPlayAgain,
  onChangeRoster,
}: {
  guesses: Guess[];
  onPlayAgain: () => void;
  onChangeRoster: () => void;
}) {
  const total = guesses.length;
  const correct = guesses.filter((g) => g.guessed === g.person.actual).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // 4 軸個別 accuracy
  const axes = useMemo(() => {
    const out = { EI: 0, SN: 0, TF: 0, JP: 0 };
    for (const g of guesses) {
      if (g.guessed[0] === g.person.actual[0]) out.EI++;
      if (g.guessed[1] === g.person.actual[1]) out.SN++;
      if (g.guessed[2] === g.person.actual[2]) out.TF++;
      if (g.guessed[3] === g.person.actual[3]) out.JP++;
    }
    return out;
  }, [guesses]);

  // 最意外的 (你猜 vs 實際 完全 4 字不同)
  const biggestSurprise = useMemo(() => {
    let max = -1;
    let pick: Guess | null = null;
    for (const g of guesses) {
      let diff = 0;
      for (let i = 0; i < 4; i++) if (g.guessed[i] !== g.person.actual[i]) diff++;
      if (diff > max) {
        max = diff;
        pick = g;
      }
    }
    return max > 0 ? pick : null;
  }, [guesses]);

  // 結果評語
  const verdict = (() => {
    if (accuracy >= 80) return { emoji: "🎯", title: "MBTI 大師！", subtitle: "你超了解你的同學，平常一定很觀察人！" };
    if (accuracy >= 50) return { emoji: "👀", title: "蠻會看的", subtitle: "你對同學的觀察滿準確，繼續用心認識他們吧" };
    if (accuracy >= 25) return { emoji: "🤔", title: "有點意外", subtitle: "也許平常沒這麼仔細看，這是個好機會深入認識同學" };
    return { emoji: "😅", title: "刻板印象 buster", subtitle: "看來大家都比你想的更多元！這正是 MBTI 提醒我們的事" };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-300 rounded-[2rem] p-8 sm:p-10 text-center text-white shadow-xl border-4 border-white/60 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-7xl opacity-20 animate-wiggle">{verdict.emoji}</div>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/95 mb-2 drop-shadow">
          🎲 你的猜測結果
        </p>
        <div className="text-8xl mb-2 animate-pop-in">{verdict.emoji}</div>
        <h1 className="text-3xl sm:text-5xl font-black drop-shadow-lg mb-2">{verdict.title}</h1>
        <p className="text-base sm:text-lg text-white/95 max-w-xl mx-auto leading-relaxed drop-shadow">
          {verdict.subtitle}
        </p>
        <div className="mt-5 inline-block bg-white/30 backdrop-blur rounded-2xl px-6 py-3">
          <p className="text-sm font-bold drop-shadow">猜中</p>
          <p className="text-5xl font-black drop-shadow">
            {correct}<span className="text-2xl opacity-80"> / {total}</span>
          </p>
          <p className="text-sm font-bold drop-shadow mt-1">{accuracy}% 準確率</p>
        </div>
      </section>

      {/* 4 軸詳細 */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
        <h3 className="text-xl font-black mb-3 flex items-center gap-2">
          <span>📊</span> 4 軸個別準確率
        </h3>
        <p className="text-xs text-[var(--color-ink)]/60 mb-4">
          看你比較會猜中哪一軸 — 通常 E/I 是最容易猜對的，T/F 最難
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["EI", "SN", "TF", "JP"] as const).map((axis) => {
            const cnt = axes[axis];
            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            return (
              <div key={axis} className="bg-[var(--color-cream)] rounded-2xl p-3 text-center">
                <p className="text-xs font-bold text-[var(--color-ink)]/60 uppercase tracking-wider">{axis}</p>
                <p className="text-3xl font-black my-1" style={{ color: pct >= 70 ? "#15803d" : pct >= 40 ? "#d97706" : "#dc2626" }}>
                  {pct}%
                </p>
                <p className="text-[10px] text-[var(--color-ink)]/50">{cnt} / {total}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 最意外的 */}
      {biggestSurprise && (
        <section className="bg-gradient-to-br from-fuchsia-50 to-rose-50 rounded-3xl p-6 border-2 border-fuchsia-300">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-fuchsia-900">
            <span>💫</span> 最讓你意外的同學
          </h3>
          <div className="bg-white/80 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-fuchsia-700">{biggestSurprise.person.name}</p>
            <p className="text-sm text-[var(--color-ink)]/60 mt-2">
              你猜 <span className="font-mono font-black text-rose-700">{biggestSurprise.guessed}</span>
              <span className="mx-2">→</span>
              實際 <span className="font-mono font-black text-emerald-700">{biggestSurprise.person.actual}</span>
            </p>
            <p className="text-xs text-fuchsia-700/70 mt-3 leading-relaxed">
              💡 找他/她聊聊，問問是什麼選擇讓故事走向 {biggestSurprise.person.actual} — 你會看到不同的他/她
            </p>
          </div>
        </section>
      )}

      {/* 全部對照表 */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
        <h3 className="text-xl font-black mb-3 flex items-center gap-2">
          <span>📋</span> 完整對照表
        </h3>
        <div className="space-y-2">
          {guesses.map((g, i) => {
            const match = g.guessed === g.person.actual;
            const actualInfo = getMBTIInfo(g.person.actual);
            const guessedInfo = getMBTIInfo(g.guessed);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                  match ? "bg-emerald-50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                }`}
              >
                <span className="text-2xl">{match ? "✅" : "✗"}</span>
                <span className="font-black flex-1 min-w-0 truncate">{g.person.name}</span>
                <span className="text-xs sm:text-sm flex items-center gap-1">
                  <span className="opacity-60">你猜</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[var(--color-ink)]/10 font-black font-mono">
                    {guessedInfo.emoji} {g.guessed}
                  </span>
                </span>
                {!match && (
                  <span className="text-xs sm:text-sm flex items-center gap-1">
                    <span className="opacity-60">→</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black font-mono">
                      {actualInfo.emoji} {g.person.actual}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 給老師的話 */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-6 border-2 border-violet-200">
        <h3 className="text-lg font-black mb-2 flex items-center gap-2 text-violet-900">
          <span>💡</span> 給老師：可以問學生的反思題
        </h3>
        <ul className="text-violet-900/90 leading-relaxed text-sm space-y-1.5">
          <li>• 為什麼你會猜 XX 是某型？是因為他的什麼行為？</li>
          <li>• 猜錯的時候，你對那位同學的印象是不是太單一了？</li>
          <li>• MBTI 提醒我們：每個人都比我們想的更多元 ✨</li>
        </ul>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <SoundButton
          sound="click"
          onClick={onPlayAgain}
          className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white text-lg font-black hover:bg-orange-600"
        >
          <span>🎲</span>
          <span>再猜一輪</span>
        </SoundButton>
        <SoundButton
          sound="tap"
          onClick={onChangeRoster}
          className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-lg font-black hover:border-[var(--color-coral)]/40"
        >
          <span>✏️</span>
          <span>換班級名單</span>
        </SoundButton>
      </div>
    </motion.div>
  );
}
