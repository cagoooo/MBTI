"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import SoundButton from "@/components/SoundButton";
import SoundLink from "@/components/SoundLink";
import BgmController from "@/components/BgmController";
import { computeStats, parseClassInput, type ClassEntry } from "@/lib/parse-class";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { MBTI_GROUPS, getMBTIInfo } from "@/lib/mbti";
import StatsExport from "@/components/StatsExport";
import { playSound } from "@/lib/sound";

const SAMPLE_INPUT = `小明 ENFP
小芸: INFJ
阿哲 INTJ
雅雯 ESFJ
小傑 ESTP
婷婷 ISFJ
宇航 ISFP
凱莉 ENTJ
小宇 INTP
家豪 ENFP
依依 INFP
小綠 ESFP`;

export default function ClassStatsPageWrap() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <ClassStatsPage />
    </Suspense>
  );
}

function ClassStatsPage() {
  const search = useSearchParams();
  const fromRoom = search.get("from")?.toUpperCase() ?? null;

  const [raw, setRaw] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 自動載入「結束會議」時帶來的班級名單
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!fromRoom) return;
    try {
      const roster = sessionStorage.getItem(`mbti-class-roster-${fromRoom}`);
      if (roster && raw === "") {
        setRaw(roster);
        // 自動送出 (有資料就直接看統計)
        setTimeout(() => setSubmitted(true), 200);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromRoom]);

  const { entries, invalidLines } = useMemo(() => parseClassInput(raw), [raw]);
  const stats = useMemo(() => computeStats(entries), [entries]);

  const maxCount = Math.max(1, ...ALL_TYPES.map((t) => stats.perType[t]));

  function handleAnalyze() {
    playSound("reveal");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    playSound("whoosh");
    setRaw("");
    setSubmitted(false);
  }

  function loadSample() {
    playSound("pop");
    setRaw(SAMPLE_INPUT);
  }

  return (
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/class-stats" />
      <BgmController track="home" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          
          <SoundLink
            href="/game"
            sound="tap"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border-2 border-[var(--color-ink)]/15 text-sm font-bold hover:border-[var(--color-coral)]/40"
          >
            🎮 玩遊戲
          </SoundLink>
        </div>

        <header className="text-center mb-8">
          <p className="inline-block px-4 py-1.5 rounded-full bg-violet-100 border-2 border-violet-300 text-xs sm:text-sm font-bold text-violet-700 uppercase tracking-wider mb-3">
            👩‍🏫 老師專用
          </p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            <span className="shimmer-text">全班 MBTI 分布圖</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)]/70 max-w-2xl mx-auto">
            把全班學生的測驗結果貼進來，馬上看到班級人格分布。
            <br />
            支援多種格式：一行一個、CSV、帶名字都可以。
          </p>
        </header>

        {!submitted || entries.length === 0 ? (
          /* 輸入區 */
          <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
            <h2 className="text-2xl font-black mb-3 flex items-center gap-2">
              <span>📥</span> 貼上全班結果
            </h2>
            <p className="text-sm text-[var(--color-ink)]/70 mb-4">
              建議流程：請學生玩完遊戲後在 Google 表單填寫名字和結果，
              你把表單回應的「型別」那一欄整欄複製貼進來就好（其他欄位會被自動忽略）。
            </p>

            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              placeholder={"範例格式：\n\n小明 ENFP\n小芸: INFJ\n阿哲 INTJ\nESTJ, INFP, ENTP\n..."}
              className="w-full p-4 rounded-2xl border-2 border-[var(--color-ink)]/15 font-mono text-sm focus:border-[var(--color-coral)] focus:outline-none transition resize-y"
            />

            <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-ink)]/60 flex-wrap gap-2">
              <span>
                {raw.trim() === "" ? (
                  "尚未輸入"
                ) : (
                  <>
                    已偵測到 <strong className="text-[var(--color-coral)]">{entries.length}</strong> 位同學
                    {invalidLines.length > 0 && (
                      <span className="text-amber-600 ml-2">
                        ⚠️ {invalidLines.length} 行格式無法辨識
                      </span>
                    )}
                  </>
                )}
              </span>
              <button
                onClick={loadSample}
                className="text-xs underline underline-offset-2 hover:text-[var(--color-coral)]"
              >
                沒有資料？載入範例
              </button>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <SoundButton
                sound="coin"
                onClick={handleAnalyze}
                disabled={entries.length === 0}
                className="btn-3d flex-1 px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                📊 產生統計圖
              </SoundButton>
              {raw && (
                <SoundButton
                  sound="toggleOff"
                  onClick={() => setRaw("")}
                  className="px-6 py-3 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)] font-black hover:border-[var(--color-coral)]/40"
                >
                  清空
                </SoundButton>
              )}
            </div>

            {/* 教學提示 */}
            <details className="mt-6 bg-[var(--color-cream)] rounded-2xl p-4 text-sm">
              <summary className="font-bold cursor-pointer">💡 給老師的教學流程建議</summary>
              <ol className="mt-3 space-y-2 list-decimal list-inside text-[var(--color-ink)]/80">
                <li>請學生玩完一輪遊戲（約 10 分鐘）</li>
                <li>事先準備 Google 表單，欄位：「姓名」+「MBTI 結果（如 ENFP）」</li>
                <li>學生在結果頁直接抄四個英文字母回答</li>
                <li>表單填寫完後，到「回應」頁籤把整欄「結果」複製</li>
                <li>回到這頁貼上 → 點「產生統計圖」</li>
                <li>引導學生討論：班上最多哪一型？少了哪一型會怎樣？</li>
              </ol>
            </details>
          </section>
        ) : (
          /* 統計結果 */
          <div className="space-y-6">
            {/* 摘要卡 */}
            <section className="bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">📊 全班統計</div>
              <div className="text-5xl sm:text-6xl font-black mb-2">{stats.total} 位同學</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {stats.mostCommon && (
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
                    <div className="text-xs opacity-80">人數最多</div>
                    <div className="text-2xl font-black mt-1">
                      {getMBTIInfo(stats.mostCommon.type).emoji} {stats.mostCommon.type}
                    </div>
                    <div className="text-xs mt-1">{stats.mostCommon.count} 位</div>
                  </div>
                )}
                {stats.rarest && stats.rarest.type !== stats.mostCommon?.type && (
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
                    <div className="text-xs opacity-80">最稀有</div>
                    <div className="text-2xl font-black mt-1">
                      {getMBTIInfo(stats.rarest.type).emoji} {stats.rarest.type}
                    </div>
                    <div className="text-xs mt-1">僅 {stats.rarest.count} 位</div>
                  </div>
                )}
                <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
                  <div className="text-xs opacity-80">出現的型</div>
                  <div className="text-2xl font-black mt-1">{16 - stats.missingTypes.length}/16</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
                  <div className="text-xs opacity-80">沒出現的型</div>
                  <div className="text-2xl font-black mt-1">{stats.missingTypes.length}</div>
                </div>
              </div>
            </section>

            {/* 16 型長條圖 */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                <span>📊</span> 16 型分布
              </h3>
              <div className="space-y-2">
                {ALL_TYPES.slice()
                  .sort((a, b) => stats.perType[b] - stats.perType[a])
                  .map((t) => {
                    const count = stats.perType[t];
                    const info = getMBTIInfo(t);
                    const pct = count === 0 ? 0 : (count / maxCount) * 100;
                    return (
                      <Link key={t} href={`/types/${t}`} className="group block">
                        <div className="flex items-center gap-3">
                          <div className="w-20 sm:w-24 flex items-center gap-2 font-black text-sm sm:text-base">
                            <span className="text-lg">{info.emoji}</span>
                            <span className={count === 0 ? "text-[var(--color-ink)]/30" : ""}>{t}</span>
                          </div>
                          <div className="flex-1 h-7 rounded-full bg-[var(--color-ink)]/5 overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                              className={`h-full bg-gradient-to-r ${info.gradient} rounded-full flex items-center justify-end pr-3 text-xs font-bold text-white drop-shadow`}
                            >
                              {count > 0 && pct > 12 && `${count} 位`}
                            </motion.div>
                            {count > 0 && pct <= 12 && (
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold">
                                {count}
                              </span>
                            )}
                          </div>
                          <div className="hidden sm:block text-xs text-[var(--color-ink)]/60 w-20 truncate group-hover:text-[var(--color-coral)]">
                            {info.nickname}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>

            {/* 四大群分布 */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                <span>🌳</span> 四大人格群分布
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.perGroup.map((g, idx) => {
                  const groupInfo = MBTI_GROUPS.find((m) => m.key === g.key) ?? MBTI_GROUPS[0];
                  const pct = stats.total === 0 ? 0 : Math.round((g.count / stats.total) * 100);
                  return (
                    <motion.div
                      key={g.key}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`bg-gradient-to-br ${groupInfo.color} rounded-3xl p-5 text-center border-4 border-white shadow-md`}
                    >
                      <div className="text-4xl mb-2">{groupInfo.emoji}</div>
                      <div className="font-black text-base">{g.name}</div>
                      <div className="text-3xl font-black mt-2">{g.count}</div>
                      <div className="text-xs opacity-70 mt-0.5">{pct}%</div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* 四軸平衡 */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                <span>⚖️</span> 四軸班級平衡
              </h3>
              <div className="space-y-4">
                {([
                  { left: "E 外向", right: "內向 I", leftN: stats.axes.E, rightN: stats.axes.I, color: "from-amber-400 to-orange-400" },
                  { left: "S 實感", right: "直覺 N", leftN: stats.axes.S, rightN: stats.axes.N, color: "from-emerald-400 to-teal-400" },
                  { left: "T 思考", right: "情感 F", leftN: stats.axes.T, rightN: stats.axes.F, color: "from-sky-400 to-blue-400" },
                  { left: "J 判斷", right: "感知 P", leftN: stats.axes.J, rightN: stats.axes.P, color: "from-purple-400 to-fuchsia-400" },
                ]).map((a, idx) => {
                  const sum = a.leftN + a.rightN || 1;
                  const leftPct = Math.round((a.leftN / sum) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm font-bold mb-1">
                        <span>{a.left} ({a.leftN})</span>
                        <span>({a.rightN}) {a.right}</span>
                      </div>
                      <div className="h-4 rounded-full bg-[var(--color-ink)]/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${leftPct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${a.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 沒出現的型 */}
            {stats.missingTypes.length > 0 && (
              <section className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200">
                <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-amber-900">
                  <span>👻</span> 班上沒出現的人格類型
                </h3>
                <p className="text-sm text-amber-900/80 mb-3">
                  跟學生討論：「如果班上多一位這種人，會帶來什麼改變？」
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.missingTypes.map((t) => (
                    <Link
                      key={t}
                      href={`/types/${t}`}
                      className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-sm font-bold text-amber-900 hover:bg-amber-100 transition"
                    >
                      {getMBTIInfo(t).emoji} {t}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 個別學生列表 (折疊) */}
            <details className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10">
              <summary className="text-lg font-black cursor-pointer flex items-center gap-2">
                <span>👥</span> 看每位同學的類型 ({entries.length})
              </summary>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {entries.map((e: ClassEntry, i) => {
                  const info = getMBTIInfo(e.type);
                  return (
                    <Link
                      key={i}
                      href={`/types/${e.type}`}
                      className={`bg-gradient-to-r ${info.gradient} rounded-xl px-3 py-2 text-white text-sm font-bold flex items-center gap-2 hover:scale-105 transition`}
                    >
                      <span className="text-base">{info.emoji}</span>
                      <span className="truncate">{e.name ?? "(無名)"}</span>
                      <span className="ml-auto text-xs opacity-90">{e.type}</span>
                    </Link>
                  );
                })}
              </div>
            </details>

            {/* 警告：無效行 */}
            {invalidLines.length > 0 && (
              <details className="bg-white rounded-3xl p-6 border-2 border-amber-300">
                <summary className="text-base font-black cursor-pointer text-amber-900">
                  ⚠️ 有 {invalidLines.length} 行無法辨識
                </summary>
                <ul className="mt-3 space-y-1 text-sm font-mono text-amber-900/80 max-h-40 overflow-auto">
                  {invalidLines.map((l, i) => (
                    <li key={i}>「{l}」</li>
                  ))}
                </ul>
              </details>
            )}

            {/* 匯出 / 保存 */}
            <StatsExport stats={stats} />

            {/* 動作列 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 print-hide">
              <SoundButton
                sound="tap"
                onClick={() => setSubmitted(false)}
                className="btn-3d flex-1 px-6 py-3 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)] font-black hover:border-[var(--color-coral)]/40"
              >
                ← 回去修改名單
              </SoundButton>
              <SoundButton
                sound="whoosh"
                onClick={handleReset}
                className="btn-3d px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black hover:bg-[var(--color-coral)]/90"
              >
                重新開始
              </SoundButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
