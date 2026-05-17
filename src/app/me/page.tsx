"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import BgmController from "@/components/BgmController";
import {
  clearAllHistory,
  countMbtiChanges,
  countSelChanges,
  deleteHistoryEntry,
  getHistoryDesc,
  getHistorySorted,
  getCountByKind,
  groupByMonth,
  type HistoryEntry,
} from "@/lib/history";
import { getMBTIInfo } from "@/lib/mbti";
import { getSelStyleInfo } from "@/lib/sel";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";

/**
 * 📓 我的學習歷程冊 — 學生個人成長軌跡
 *
 * 顯示:
 *   - 統計卡 (跑過 N 次 MBTI / SEL / 猜朋友 + MBTI/SEL 變化次數)
 *   - 時間軸 (依月份分群 + 每筆完整資訊)
 *   - MBTI 變化軌跡圖 (折線顯示哪個月變什麼)
 *   - 列印 A4 學期成長紀錄
 *   - 一鍵刪除 (隱私尊重)
 */

export default function MePage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    const refreshTts = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("mbti-history-change", refresh);
    window.addEventListener("storage", refreshTts);
    window.addEventListener("mbti-settings-change", refreshTts);
    return () => {
      window.removeEventListener("mbti-history-change", refresh);
      window.removeEventListener("storage", refreshTts);
      window.removeEventListener("mbti-settings-change", refreshTts);
    };
  }, []);

  function refresh() {
    setEntries(getHistoryDesc());
  }

  const counts = useMemo(() => getCountByKind(), [entries]);
  const mbtiChanges = useMemo(() => countMbtiChanges(), [entries]);
  const selChanges = useMemo(() => countSelChanges(), [entries]);
  const grouped = useMemo(() => groupByMonth(entries), [entries]);
  const monthKeys = useMemo(() => Object.keys(grouped).sort((a, b) => b.localeCompare(a)), [grouped]);

  function onDelete(id: string) {
    if (!confirm("確定刪除這筆紀錄？")) return;
    playSound("toggleOff");
    deleteHistoryEntry(id);
  }

  function onClearAll() {
    if (!confirm("⚠️ 確定清掉全部歷程？這個動作無法復原")) return;
    if (!confirm("再確認一次：所有歷史紀錄將永久消失")) return;
    playSound("toggleOff");
    clearAllHistory();
  }

  function onPrint() {
    playSound("coin");
    window.print();
  }

  function speakOverview() {
    playSound("tap");
    const total = entries.length;
    const sorted = getHistorySorted();
    const first = sorted[0];
    const firstMonth = first ? new Date(first.at).toLocaleDateString("zh-TW") : "今天";
    const text = total === 0
      ? "你還沒有任何學習紀錄。完成一次 MBTI、SEL 或猜朋友活動，就會自動存進這裡。"
      : `你的學習歷程冊共有 ${total} 筆紀錄，從 ${firstMonth} 開始累積。其中 MBTI 跑了 ${counts.mbti} 次，SEL 跑了 ${counts.sel} 次，猜朋友玩了 ${counts.guess} 次。${
          mbtiChanges > 0 ? `你的 MBTI 變化過 ${mbtiChanges} 次，` : ""
        }${
          selChanges > 0 ? `情緒因應風格變化過 ${selChanges} 次。` : ""
        }每一筆都是你成長的軌跡。`;
    speakTts(text, { rate: 1.0, pitch: 1.05 });
  }

  function stopSpeak() {
    playSound("toggleOff");
    stopTts();
  }

  // SSR safe
  if (!mounted) {
    return (
      <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
        <div className="max-w-3xl mx-auto text-center py-12 text-[var(--color-ink)]/40">載入中...</div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      <BgmController track="home" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2 print-hide">
          <HomeToButton />
          {entries.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {ttsEnabled && (
                <>
                  <SoundButton
                    sound="tap"
                    onClick={speakOverview}
                    className="text-xs px-3 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold hover:bg-amber-200"
                  >
                    🔊 唸給我聽
                  </SoundButton>
                  <button
                    onClick={stopSpeak}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-white border-2 border-amber-200 text-amber-700 font-bold hover:border-amber-400"
                  >
                    ⏸
                  </button>
                </>
              )}
              <SoundButton
                sound="coin"
                onClick={onPrint}
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600"
              >
                🖨️ 列印 / 存 PDF
              </SoundButton>
              <button
                onClick={onClearAll}
                className="text-xs px-3 py-1.5 rounded-full bg-white border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50"
              >
                🗑️ 清掉全部
              </button>
            </div>
          )}
        </div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-100 via-yellow-50 to-rose-50 rounded-[2rem] p-6 sm:p-10 border-4 border-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 text-9xl opacity-15">📓</div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700/80 mb-2 relative">
            📓 我的學習歷程冊
          </p>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 relative text-[var(--color-ink)]">
            你的成長<br className="sm:hidden" />
            <span className="text-amber-700">看得見</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)]/80 leading-relaxed relative max-w-2xl">
            每次跑完 MBTI、SEL 或猜朋友活動，這裡會自動存一筆。
            半年後回來看 — 你會發現自己「原來變過這麼多」。
          </p>

          {/* 統計卡 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 relative">
            <StatBox
              emoji="🎒"
              label="MBTI"
              count={counts.mbti}
              sub={mbtiChanges > 0 ? `變化 ${mbtiChanges} 次` : "首次紀錄"}
              color="amber"
            />
            <StatBox
              emoji="🌧️"
              label="SEL"
              count={counts.sel}
              sub={selChanges > 0 ? `變化 ${selChanges} 次` : counts.sel > 0 ? "首次紀錄" : "未做過"}
              color="violet"
            />
            <StatBox
              emoji="🎲"
              label="猜朋友"
              count={counts.guess}
              sub={counts.guess > 0 ? "次完成" : "未做過"}
              color="orange"
            />
          </div>
        </motion.section>

        {/* 空狀態 */}
        {entries.length === 0 && (
          <section className="mt-6 bg-white rounded-3xl p-8 border-2 border-dashed border-[var(--color-ink)]/15 text-center">
            <div className="text-6xl mb-3">📭</div>
            <p className="text-lg font-bold mb-2">還沒開始累積</p>
            <p className="text-sm text-[var(--color-ink)]/60 mb-5">
              完成一次 MBTI、SEL 或猜朋友活動，這裡就會出現紀錄
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/game" className="btn-3d inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-coral)] text-white font-black hover:bg-[var(--color-coral)]/90">
                <span>🎒</span><span>玩 MBTI</span>
              </Link>
              <Link href="/sel" className="btn-3d inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-500 text-white font-black hover:bg-violet-600">
                <span>🌧️</span><span>跑 SEL</span>
              </Link>
              <Link href="/journey" className="btn-3d inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600">
                <span>🎒</span><span>三部曲</span>
              </Link>
            </div>
          </section>
        )}

        {/* MBTI 變化軌跡 (≥2 筆 MBTI 才顯示) */}
        {counts.mbti >= 2 && (
          <MbtiTrajectory entries={entries} />
        )}

        {/* SEL 變化軌跡 (≥2 筆 SEL) */}
        {counts.sel >= 2 && (
          <SelTrajectory entries={entries} />
        )}

        {/* 時間軸 */}
        {entries.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <span>📅</span> 時間軸
            </h2>
            <div className="space-y-6">
              {monthKeys.map((month) => (
                <div key={month}>
                  <p className="text-sm font-bold text-[var(--color-ink)]/60 mb-2 px-2 sticky top-0 bg-[var(--color-cream)]/80 backdrop-blur py-1 rounded z-10 print-hide">
                    {month} · {grouped[month].length} 筆
                  </p>
                  <p className="hidden print:block text-sm font-bold mb-2">
                    {month} · {grouped[month].length} 筆
                  </p>
                  <div className="space-y-2">
                    {grouped[month].map((e, i) => (
                      <HistoryEntryCard key={e.id} entry={e} onDelete={() => onDelete(e.id)} delay={i * 0.05} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 隱私說明 */}
        <section className="mt-8 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 print-hide">
          <p className="text-xs text-emerald-800/80 leading-relaxed">
            🔒 <strong>你的紀錄純粹存在這台裝置</strong> — 沒有上傳任何後端。
            老師看不到，只有你能看。同一台裝置的不同瀏覽器也分開存。
            想清掉隨時可以按上方「🗑️ 清掉全部」。
          </p>
        </section>
      </div>

      {/* Print 樣式 */}
      <style jsx global>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────── 子元件 ───────────────────

function StatBox({
  emoji,
  label,
  count,
  sub,
  color,
}: {
  emoji: string;
  label: string;
  count: number;
  sub: string;
  color: "amber" | "violet" | "orange";
}) {
  const colorMap = {
    amber: "from-amber-200 to-orange-200 text-amber-900 border-amber-300",
    violet: "from-violet-200 to-fuchsia-200 text-violet-900 border-violet-300",
    orange: "from-orange-200 to-yellow-200 text-orange-900 border-orange-300",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-3 sm:p-4 border-2 text-center`}>
      <div className="text-2xl sm:text-3xl mb-1">{emoji}</div>
      <p className="text-[10px] sm:text-xs font-bold uppercase opacity-80">{label}</p>
      <p className="text-2xl sm:text-3xl font-black my-0.5">{count}</p>
      <p className="text-[10px] sm:text-xs opacity-70">{sub}</p>
    </div>
  );
}

function HistoryEntryCard({
  entry,
  onDelete,
  delay,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
  delay: number;
}) {
  const date = new Date(entry.at).toLocaleDateString("zh-TW");
  const time = new Date(entry.at).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-[var(--color-ink)]/10 flex items-start gap-3 hover:border-[var(--color-coral)]/40 transition"
    >
      <div className="shrink-0">
        {entry.kind === "mbti" && (() => {
          const info = getMBTIInfo(entry.type);
          return (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl">
              {info.emoji}
            </div>
          );
        })()}
        {entry.kind === "sel" && (() => {
          const info = getSelStyleInfo(entry.style);
          return (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-100 border-2 border-violet-300 flex items-center justify-center text-2xl sm:text-3xl">
              {info.emoji}
            </div>
          );
        })()}
        {entry.kind === "guess" && (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-2xl sm:text-3xl">
            🎲
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {entry.kind === "mbti" && (
            <>
              <span className="font-black text-base sm:text-lg tracking-wider">{entry.type}</span>
              <span className="text-xs sm:text-sm text-[var(--color-ink)]/70">{getMBTIInfo(entry.type).nickname}</span>
            </>
          )}
          {entry.kind === "sel" && (
            <>
              <span className="font-black text-base sm:text-lg">{getSelStyleInfo(entry.style).nickname}</span>
              <span className="text-xs text-[var(--color-ink)]/50">SEL 因應風格</span>
            </>
          )}
          {entry.kind === "guess" && (
            <>
              <span className="font-black text-base sm:text-lg">
                {Math.round((entry.correct / entry.total) * 100)}%
              </span>
              <span className="text-xs sm:text-sm text-[var(--color-ink)]/70">
                猜對 {entry.correct} / {entry.total}
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-[var(--color-ink)]/50 mt-0.5">
          {date} {time}
          {entry.kind === "mbti" && entry.branch && entry.branch !== "main" && (
            <> · 走 {{ sport: "校隊", art: "藝術", study: "學術", friend: "友誼" }[entry.branch] ?? entry.branch}</>
          )}
          {entry.kind === "mbti" && entry.pretestMatched !== undefined && (
            <> · 課前猜中 {entry.pretestMatched}/4</>
          )}
        </p>
      </div>
      <button
        onClick={onDelete}
        title="刪除這筆"
        className="text-[var(--color-ink)]/30 hover:text-rose-500 text-sm shrink-0 px-2 print-hide"
      >
        ✕
      </button>
    </motion.article>
  );
}

function MbtiTrajectory({ entries }: { entries: HistoryEntry[] }) {
  const mbtis = entries
    .filter((e): e is Extract<HistoryEntry, { kind: "mbti" }> => e.kind === "mbti")
    .sort((a, b) => a.at - b.at);
  return (
    <section className="mt-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
      <h2 className="text-xl font-black mb-3 flex items-center gap-2">
        <span>🎒</span> MBTI 變化軌跡
      </h2>
      <p className="text-xs text-[var(--color-ink)]/60 mb-4">
        每次跑出來的 MBTI 並排顯示 — 看你「最常出現」的型 vs「探索新方向」的型
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {mbtis.map((e, i) => {
            const info = getMBTIInfo(e.type);
            const changed = i > 0 && mbtis[i - 1].type !== e.type;
            return (
              <div key={e.id} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`text-2xl ${changed ? "text-rose-500" : "text-emerald-500"}`}>
                    {changed ? "≠" : "→"}
                  </div>
                )}
                <div
                  title={`${new Date(e.at).toLocaleDateString("zh-TW")} - ${info.nickname}`}
                  className="flex flex-col items-center bg-amber-50 rounded-xl p-2 border-2 border-amber-200 min-w-[64px]"
                >
                  <div className="text-2xl">{info.emoji}</div>
                  <div className="text-[10px] font-black tracking-wider mt-0.5">{e.type}</div>
                  <div className="text-[9px] text-amber-700/60 mt-0.5">
                    {new Date(e.at).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SelTrajectory({ entries }: { entries: HistoryEntry[] }) {
  const sels = entries
    .filter((e): e is Extract<HistoryEntry, { kind: "sel" }> => e.kind === "sel")
    .sort((a, b) => a.at - b.at);
  return (
    <section className="mt-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-violet-200 shadow-sm">
      <h2 className="text-xl font-black mb-3 flex items-center gap-2">
        <span>🌧️</span> SEL 情緒因應風格軌跡
      </h2>
      <p className="text-xs text-[var(--color-ink)]/60 mb-4">
        情緒因應方式會隨著情境跟成長而變 — 都是健康的
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {sels.map((e, i) => {
            const info = getSelStyleInfo(e.style);
            const changed = i > 0 && sels[i - 1].style !== e.style;
            return (
              <div key={e.id} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`text-2xl ${changed ? "text-rose-500" : "text-emerald-500"}`}>
                    {changed ? "≠" : "→"}
                  </div>
                )}
                <div
                  title={`${new Date(e.at).toLocaleDateString("zh-TW")} - ${info.nickname}`}
                  className="flex flex-col items-center bg-violet-50 rounded-xl p-2 border-2 border-violet-200 min-w-[88px]"
                >
                  <div className="text-2xl">{info.emoji}</div>
                  <div className="text-xs font-black mt-0.5">{info.nickname}</div>
                  <div className="text-[9px] text-violet-700/60 mt-0.5">
                    {new Date(e.at).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
