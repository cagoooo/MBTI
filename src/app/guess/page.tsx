"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
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
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/guess" />
      <BgmController track="home" />
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 32 }}>

        {/* Hero */}
        <section style={{ paddingBottom: 24 }}>
          <div className="tape sunny rotate-n2" style={{ marginBottom: 24 }}>🎲 STATION · 03 · 班級互動遊戲</div>
          <div className="f-hand" style={{ fontSize: 30, color: "var(--coral)", transform: "rotate(-2deg)", marginBottom: 6 }}>
            你眼中的同學，跟你想的一樣嗎？✨
          </div>
          <h1 className="f-serif" style={{ fontWeight: 900, fontSize: "clamp(48px, 9vw, 124px)", lineHeight: 0.92, letterSpacing: -2, margin: "0 0 24px" }}>
            你猜得到<br />
            <span style={{ color: "var(--coral)" }}>同學是哪型</span>嗎？
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--ink-soft)", maxWidth: 680, margin: "0 0 32px" }}>
            把全班的「名字＋真實 MBTI」貼進來，系統會隨機抽問你猜每個人是哪型。
            結束時告訴你<b>猜對幾個</b>＋<b>哪幾個最讓你意外</b> — 也是引發班級討論的好素材。
          </p>

          {/* Phase indicator */}
          <div className="phase-bar">
            <div className="tab">◆ 3 PHASES</div>
            <div>
              <div className="hud" style={{ marginBottom: 4 }}>CURRENT PHASE</div>
              <div className="f-serif" style={{ fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
                {phase === "input" && "名單輸入"}
                {phase === "guess" && "一題一題猜"}
                {phase === "result" && "看結果"}
              </div>
            </div>
            <div className="phase-pills hidden lg:flex">
              <div className={`phase-pill ${phase === "input" ? "current" : "done"}`}>① 輸入名單</div>
              <span className="phase-arrow">→</span>
              <div className={`phase-pill ${phase === "guess" ? "current" : phase === "result" ? "done" : ""}`}>② 一題一題猜</div>
              <span className="phase-arrow">→</span>
              <div className={`phase-pill ${phase === "result" ? "current" : ""}`}>③ 看結果</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="hud" style={{ marginBottom: 4 }}>PROGRESS</div>
              <div className="f-mono" style={{ fontSize: 18, fontWeight: 800 }}>
                {phase === "guess" ? `${currentIdx + 1} / ${people.length}` : `${guesses.length} / ${people.length || 0}`}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Input ─── */}
        {phase === "input" && (
          <div className="roster-box" style={{ marginBottom: 32 }}>
            <div className="tab-label">📋 ROSTER · INPUT</div>
            <h2 className="f-serif" style={{ fontWeight: 900, fontSize: 32, lineHeight: 1, margin: "8px 0 4px" }}>班級名單</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 18px" }}>
              每行一人，名字 + 真實 MBTI。格式很彈性 — 空格、冒號、逗號都行。
            </p>
            <textarea
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
              placeholder={`小芸 ENFP\n阿哲 INTJ\n小傑 ESTP\n雅雯 INFJ\n宇航 ISFP`}
              className="roster-textarea"
              spellCheck={false}
            />
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                background: "var(--paper-warm)",
                borderLeft: "4px solid var(--coral)",
                fontSize: 12,
                color: "var(--ink-soft)",
                lineHeight: 1.65,
              }}
            >
              <b>💡 格式很彈性</b>　「小明 INTJ」、「小明: INTJ」、「小明,INTJ」都可以。
              也可以從<Link href="/class-stats" className="underline font-bold mx-1">班級統計</Link>
              或<Link href="/teacher/history" className="underline font-bold mx-1">班級歷史</Link>把名單複製過來。
            </div>

            {parseError && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  background: "#fde3ea",
                  border: "2px solid var(--rose)",
                  fontSize: 13,
                  color: "#7a1a3a",
                }}
              >
                ⚠️ {parseError}
              </div>
            )}

            <button
              onClick={startGuessing}
              disabled={!rosterText.trim()}
              className="btn-start"
              style={{ marginTop: 24, width: "100%", justifyContent: "center", padding: 20 }}
            >
              <span style={{ fontSize: 32 }}>🎲</span>
              <span>開始猜！</span>
              <span className="arrow">→</span>
            </button>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "var(--paper-2)",
                border: "1px solid var(--line)",
                fontSize: 12,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              <p style={{ fontWeight: 900, marginBottom: 6, color: "var(--ink)" }}>🎓 給老師：</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>適合班級互相認識深化 / 破除刻板印象 / 引發討論</li>
                <li>玩完問學生「為什麼你會這樣猜？」最有教學價值</li>
                <li>結果不公開比較，避免人身評論</li>
                <li>學生先到 <Link href="/teacher/history" className="underline">/teacher/history</Link> 把名單複製過來最方便</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── Guess (1-by-1) ─── */}
        {phase === "guess" && currentPerson && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPerson.name + currentIdx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="person-card"
                style={{ marginBottom: 28, marginTop: 24 }}
              >
                <div className="person-label">▸ QUESTION · {String(currentIdx + 1).padStart(2, "0")} / {String(people.length).padStart(2, "0")}</div>
                <div className="person-avatar">{currentPerson.name[0]}</div>
                <h2 className="person-name">{currentPerson.name}</h2>
                <p className="person-num">他/她是哪一型？</p>
              </motion.div>

              {/* 16 型 pick grid */}
              <div className="type-pick-grid" key="grid">
                {ALL_TYPES.map((t) => {
                  const isActual = revealed && t === currentPerson.actual;
                  const isPicked = revealed && t === revealed;
                  const isMatch = revealed === currentPerson.actual;
                  const info = getMBTIInfo(t);
                  const groupMap: Record<string, string> = {
                    INTJ: "NT", INTP: "NT", ENTJ: "NT", ENTP: "NT",
                    INFJ: "NF", INFP: "NF", ENFJ: "NF", ENFP: "NF",
                    ISTJ: "SJ", ISFJ: "SJ", ESTJ: "SJ", ESFJ: "SJ",
                    ISTP: "SP", ISFP: "SP", ESTP: "SP", ESFP: "SP",
                  };
                  return (
                    <button
                      key={t}
                      onClick={() => pickGuess(t)}
                      disabled={!!revealed}
                      data-group={groupMap[t]}
                      className={`type-pick ${isActual ? "correct" : isPicked && !isMatch ? "wrong" : ""}`}
                      style={{ position: "relative" }}
                    >
                      <div className="e">{info.emoji}</div>
                      <div className="code">{t}</div>
                      <div className="nick">{info.nickname}</div>
                      {isActual && (
                        <span style={{ position: "absolute", top: -8, right: -8, fontSize: 18 }}>✅</span>
                      )}
                      {isPicked && !isMatch && (
                        <span style={{ position: "absolute", top: -8, right: -8, fontSize: 18 }}>👈</span>
                      )}
                    </button>
                  );
                })}
              </div>

            </AnimatePresence>

            {/* Reveal feedback (新 design 樣式) */}
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`reveal-card-guess ${revealed === currentPerson.actual ? "correct" : "wrong"}`}
              >
                <div className="reveal-stamp">
                  {revealed === currentPerson.actual ? "✓ CORRECT" : "✗ MISSED"}
                </div>
                {revealed === currentPerson.actual ? (
                  <p style={{ fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: 0 }}>
                    <span style={{ fontSize: 24 }}>🎯</span>
                    <span>猜對了！{currentPerson.name} 確實是 {currentPerson.actual}</span>
                  </p>
                ) : (
                  <p style={{ fontSize: 16, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, margin: 0 }}>
                    <span>你猜 <span className="f-mono" style={{ fontWeight: 900 }}>{revealed}</span>，</span>
                    <span>
                      實際上 {currentPerson.name} 是{" "}
                      <span className="f-mono" style={{ fontWeight: 900, color: "var(--mint)" }}>{currentPerson.actual}</span>{" "}
                      喔！
                    </span>
                  </p>
                )}
                <SoundButton
                  sound="whoosh"
                  onClick={nextQuestion}
                  className="btn-start"
                  style={{ marginTop: 20, width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 18 }}
                >
                  {currentIdx < people.length - 1 ? "下一位 →" : "看結果 →"}
                </SoundButton>
              </motion.div>
            )}
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
      {/* Hero — 新設計 score-display */}
      <section className="score-display">
        <div className="score-label">▸ YOUR RESULT · 你的猜測結果</div>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{verdict.emoji}</div>
        <h1
          className="f-serif"
          style={{ fontWeight: 900, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1, margin: "0 0 16px" }}
        >
          {verdict.title}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "var(--ink-soft)",
            maxWidth: 480,
            margin: "0 auto 24px",
            lineHeight: 1.7,
          }}
        >
          {verdict.subtitle}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
          <span className="big-num">{correct}</span>
          <span className="of">/{total}</span>
        </div>
        <div className="hud" style={{ marginTop: 4 }}>
          {accuracy}% 準確率
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
