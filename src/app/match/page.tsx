"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HomeToButton from "@/components/HomeToButton";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo, MBTI_GROUPS } from "@/lib/mbti";
import { computeMatch, findClassMatches } from "@/lib/match";
import { parseClassInput } from "@/lib/parse-class";
import { playSound } from "@/lib/sound";

type Mode = "pair" | "class";

export default function MatchPage() {
  const [mode, setMode] = useState<Mode>("pair");
  const [a, setA] = useState<MBTIType | "">("");
  const [b, setB] = useState<MBTIType | "">("");
  const [roster, setRoster] = useState("");

  const result = useMemo(() => {
    if (a && b) return computeMatch(a as MBTIType, b as MBTIType);
    return null;
  }, [a, b]);

  const classMatches = useMemo(() => {
    if (!roster.trim()) return [];
    const { entries } = parseClassInput(roster);
    if (entries.length < 2) return [];
    const namedRoster = entries
      .filter((e) => e.name)
      .map((e) => ({ name: e.name as string, type: e.type }));
    if (namedRoster.length < 2) return [];
    return findClassMatches(namedRoster);
  }, [roster]);

  const aInfo = a ? getMBTIInfo(a as MBTIType) : null;
  const bInfo = b ? getMBTIInfo(b as MBTIType) : null;

  function showResult() {
    if (a && b) playSound("reveal");
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <HomeToButton />
        </div>

        <header className="text-center mb-8">
          <p className="inline-block px-4 py-1.5 rounded-full bg-rose-100 border-2 border-rose-300 text-xs sm:text-sm font-bold text-rose-700 uppercase tracking-wider mb-3">
            🤝 兩人配對 / 全班配對工具
          </p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            <span className="shimmer-text">MBTI 麻吉配對</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)]/70 max-w-2xl mx-auto">
            選兩個人格類型，看你們的合拍指數、相處模式與溝通建議。
          </p>
        </header>

        {/* 模式切換 */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => setMode("pair")}
            className={`px-5 py-2.5 rounded-2xl font-black transition ${mode === "pair" ? "bg-[var(--color-coral)] text-white shadow-md" : "bg-white border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)]/70"}`}
          >
            👥 兩人配對
          </button>
          <button
            onClick={() => setMode("class")}
            className={`px-5 py-2.5 rounded-2xl font-black transition ${mode === "class" ? "bg-[var(--color-coral)] text-white shadow-md" : "bg-white border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)]/70"}`}
          >
            🏫 全班配對
          </button>
        </div>

        {mode === "pair" ? (
          /* 兩人配對 */
          <div className="space-y-6">
            {/* 選人區 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "第一位", value: a, set: setA, info: aInfo },
                { label: "第二位", value: b, set: setB, info: bInfo },
              ].map((p, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border-2 border-[var(--color-ink)]/10">
                  <label className="block text-sm font-bold mb-2">{p.label}</label>
                  <select
                    value={p.value}
                    onChange={(e) => p.set(e.target.value as MBTIType)}
                    className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 font-bold focus:border-[var(--color-coral)] focus:outline-none"
                  >
                    <option value="">— 選一個人格 —</option>
                    {MBTI_GROUPS.map((g) => (
                      <optgroup key={g.key} label={`${g.emoji} ${g.name}`}>
                        {g.types.map((t) => (
                          <option key={t} value={t}>
                            {getMBTIInfo(t).emoji} {t} {getMBTIInfo(t).nickname}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {p.info && (
                    <div className={`mt-3 bg-gradient-to-br ${p.info.gradient} rounded-2xl p-4 text-white`}>
                      <div className="text-4xl mb-1">{p.info.emoji}</div>
                      <div className="text-2xl font-black">{p.info.type}</div>
                      <div className="font-bold">{p.info.nickname}</div>
                      <div className="text-xs opacity-90 mt-1">{p.info.oneLiner}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 配對按鈕 */}
            {a && b && (
              <div className="text-center">
                <button
                  onClick={showResult}
                  className="btn-3d px-8 py-4 rounded-2xl bg-[var(--color-coral)] text-white text-xl font-black hover:bg-[var(--color-coral)]/90"
                >
                  💫 看我們有多合拍！
                </button>
              </div>
            )}

            {/* 結果區 */}
            <AnimatePresence>
              {result && a && b && (
                <motion.div
                  key={`${a}-${b}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* 合拍分數 */}
                  <section className="bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl">
                    <div className="text-sm uppercase tracking-widest opacity-80 mb-1">合拍指數</div>
                    <div className="text-7xl sm:text-8xl font-black drop-shadow-lg">{result.score}</div>
                    <div className="text-2xl font-black mt-2 drop-shadow">{result.headline}</div>
                  </section>

                  {/* 相處模式 */}
                  <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10">
                    <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                      <span>💞</span> 你們的相處模式
                    </h3>
                    <p className="text-[var(--color-ink)]/90 leading-relaxed">{result.dynamic}</p>
                  </section>

                  {/* 衝突點 + 建議 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-200">
                      <h3 className="text-lg font-black mb-3 flex items-center gap-2 text-amber-900">
                        <span>⚡</span> 常見小衝突
                      </h3>
                      <ul className="space-y-2 text-sm text-amber-900/90">
                        {result.conflicts.map((c, i) => (
                          <li key={i} className="flex items-start gap-2"><span>•</span><span>{c}</span></li>
                        ))}
                      </ul>
                    </section>
                    <section className="bg-emerald-50 rounded-3xl p-5 border-2 border-emerald-200">
                      <h3 className="text-lg font-black mb-3 flex items-center gap-2 text-emerald-900">
                        <span>💡</span> 相處建議
                      </h3>
                      <ul className="space-y-2 text-sm text-emerald-900/90">
                        {result.tips.map((t, i) => (
                          <li key={i} className="flex items-start gap-2"><span>•</span><span>{t}</span></li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* 適合一起做 */}
                  <section className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-3xl p-6 border-2 border-sky-200">
                    <h3 className="text-lg font-black mb-3 flex items-center gap-2 text-sky-900">
                      <span>🎯</span> 你們特別適合一起做這些
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.goodAt.map((g, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-white text-sm font-bold border border-sky-300">
                          {g}
                        </span>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* 全班配對 */
          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10">
              <h3 className="text-xl font-black mb-3">📥 貼上全班名單</h3>
              <p className="text-sm text-[var(--color-ink)]/70 mb-3">
                每行一位「名字 + MBTI」（例：<code>小明 ENFP</code>）。系統會幫每個人找出班上最合拍的同學。
              </p>
              <textarea
                value={roster}
                onChange={(e) => setRoster(e.target.value)}
                rows={8}
                placeholder="小明 ENFP&#10;小芸: INFJ&#10;阿哲 INTJ&#10;..."
                className="w-full p-4 rounded-2xl border-2 border-[var(--color-ink)]/15 font-mono text-sm focus:border-[var(--color-coral)] focus:outline-none transition"
              />
              {roster.trim() && classMatches.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  ⚠️ 至少要有兩位「帶名字」的同學才能配對
                </p>
              )}
            </section>

            {classMatches.length > 0 && (
              <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10">
                <h3 className="text-xl font-black mb-4">
                  💝 全班 {classMatches.length} 位的最佳配對
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classMatches.map((m) => {
                    const myInfo = getMBTIInfo(m.type);
                    const youInfo = m.bestPartner ? getMBTIInfo(m.bestPartner.type) : null;
                    return (
                      <div key={m.name} className="bg-[var(--color-cream)] rounded-2xl p-4 border border-[var(--color-ink)]/10">
                        <div className="flex items-center gap-3">
                          <div className={`bg-gradient-to-br ${myInfo.gradient} rounded-xl px-3 py-2 text-white font-black flex items-center gap-2 min-w-[120px]`}>
                            <span>{myInfo.emoji}</span>
                            <span className="truncate">{m.name}</span>
                          </div>
                          <span className="text-2xl">💞</span>
                          {m.bestPartner && youInfo ? (
                            <div className={`bg-gradient-to-br ${youInfo.gradient} rounded-xl px-3 py-2 text-white font-black flex items-center gap-2 flex-1 min-w-0`}>
                              <span>{youInfo.emoji}</span>
                              <span className="truncate">{m.bestPartner.name}</span>
                              <span className="ml-auto text-xs opacity-90">{m.bestPartner.score}%</span>
                            </div>
                          ) : (
                            <span className="text-[var(--color-ink)]/60">沒有可配對的人</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-[var(--color-ink)]/60 text-center">
                  💡 這只是「我跟誰最合拍」單向視角。可能 A 最合拍 B，B 最合拍 C — 這也是有趣的人際練習題。
                </p>
              </section>
            )}
          </div>
        )}

        {/* 快速跳轉 */}
        <div className="mt-12 text-center text-sm text-[var(--color-ink)]/60">
          <p>還沒測過自己的 MBTI？<Link href="/game" className="text-[var(--color-coral)] font-bold hover:underline">先玩一場校園 RPG 找出來 →</Link></p>
        </div>
      </div>
    </div>
  );
}
