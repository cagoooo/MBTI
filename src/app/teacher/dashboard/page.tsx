"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import BgmController from "@/components/BgmController";
import TeacherLoginButton from "@/components/TeacherLoginButton";
import { ensureSignedIn, isFirebaseAvailable } from "@/lib/firebase";
import { subscribeTeacherHistory, type SessionSnapshot } from "@/lib/classroom-rtdb";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import { playSound } from "@/lib/sound";

/**
 * 🎓 老師個人 dashboard — 散落功能一頁到位
 *
 * 內容:
 *   - Hero 統計 (這學期跑了 N 次活動 / 共 N 人完成)
 *   - 最近 5 次活動快速進入
 *   - 全校型別分布 (跨所有活動累積)
 *   - 4 軸總平均
 *   - 所有老師工具入口 (history / class-stats / journey / sel / guess / new room)
 *
 * 設計:
 *   - 一頁 = 一杯咖啡時間了解班級狀況
 *   - 沒設 Firebase 也能用 (只少了班級資料部分)
 */

interface HistoryItem {
  sessionId: string;
  snapshot: SessionSnapshot;
}

export default function TeacherDashboardPage() {
  const [teacherUid, setTeacherUid] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  // AF1: 跨班級總覽 — 選中的 className filter (null = 全部班級)
  const [activeClassName, setActiveClassName] = useState<string | null>(null);
  // 避免 SSG (no window → Firebase 不可用) vs client (有 window → Firebase 可用) 的 hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    if (!isFirebaseAvailable()) {
      setLoading(false);
      return;
    }
    void ensureSignedIn().then((uid) => {
      if (!uid) {
        setLoading(false);
        return;
      }
      setTeacherUid(uid);
    });
  }, []);

  useEffect(() => {
    if (!teacherUid) return;
    const unsub = subscribeTeacherHistory(teacherUid, (next) => {
      setItems(next);
      setLoading(false);
    });
    return () => unsub();
  }, [teacherUid]);

  // AF1: 抽出所有出現過的班級名 (依次數排序)
  const classNames = useMemo(() => {
    const counter: Record<string, number> = {};
    for (const it of items) {
      const cn = it.snapshot.className?.trim();
      if (cn) counter[cn] = (counter[cn] ?? 0) + 1;
    }
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  // AF1: 依 active className filter 過濾 items
  const filteredItems = useMemo(() => {
    if (!activeClassName) return items;
    return items.filter((it) => (it.snapshot.className?.trim() ?? "") === activeClassName);
  }, [items, activeClassName]);

  // 統計 (依 filteredItems)
  const stats = useMemo(() => {
    const totalSessions = filteredItems.length;
    const totalCompletedStudents = filteredItems.reduce((sum, it) => sum + it.snapshot.completedCount, 0);
    const totalStudents = filteredItems.reduce((sum, it) => sum + it.snapshot.totalCount, 0);
    // 30 天內 sessions
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSessions = filteredItems.filter((it) => it.snapshot.endedAt > monthAgo).length;
    // 整合所有 type 分布
    const aggregatedTypes: Record<string, number> = {};
    const aggregatedAxes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const it of filteredItems) {
      for (const [t, c] of Object.entries(it.snapshot.typeDistribution)) {
        aggregatedTypes[t] = (aggregatedTypes[t] ?? 0) + c;
      }
      for (const k of Object.keys(aggregatedAxes) as Array<keyof typeof aggregatedAxes>) {
        aggregatedAxes[k] += it.snapshot.axisCount[k] ?? 0;
      }
    }
    // top 3 types
    const topTypes = Object.entries(aggregatedTypes).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return {
      totalSessions,
      totalCompletedStudents,
      totalStudents,
      recentSessions,
      aggregatedTypes,
      aggregatedAxes,
      topTypes,
    };
  }, [filteredItems]);

  const recent5 = filteredItems.slice(0, 5);

  return (
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/teacher/dashboard" />
      <BgmController track="home" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          {/* 🔑 Google OAuth 跨裝置同步 */}
          <TeacherLoginButton variant="full" />
        </div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-[2rem] p-6 sm:p-10 text-white shadow-xl border-4 border-white/60 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 text-9xl opacity-15">🎓</div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/95 mb-2 drop-shadow">
            🎓 老師個人 dashboard
          </p>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 drop-shadow-lg">
            一杯咖啡<br className="sm:hidden" />看完班級狀況
          </h1>

          {/* 統計卡 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <DashStat emoji="🎒" label="總活動次數" value={stats.totalSessions} sub={stats.recentSessions > 0 ? `30 天 ${stats.recentSessions} 次` : "尚未活動"} />
            <DashStat emoji="👥" label="完成人次" value={stats.totalCompletedStudents} sub={stats.totalStudents > 0 ? `總到場 ${stats.totalStudents}` : "—"} />
            <DashStat
              emoji="🌟"
              label="最常出現型"
              value={stats.topTypes[0]?.[0] ?? "—"}
              sub={stats.topTypes[0] ? `${stats.topTypes[0][1]} 人次` : "—"}
            />
            <DashStat
              emoji="📊"
              label="型別總數"
              value={Object.keys(stats.aggregatedTypes).length}
              sub={`/ 16 種`}
            />
          </div>
        </motion.section>

        {mounted && !isFirebaseAvailable() && (
          <div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
            <p className="text-sm text-amber-900 font-bold">⚠️ Firebase 還沒設好，班級資料部分無法顯示</p>
            <p className="text-xs text-amber-800/80 mt-1">
              GitHub repo Secrets 加上 NEXT_PUBLIC_FIREBASE_* env 並重新部署即可
            </p>
          </div>
        )}

        {/* AF1: 跨班級總覽 — 班級切換 chips */}
        {classNames.length > 0 && (
          <section className="mt-6 bg-white rounded-3xl p-4 sm:p-5 border-2 border-[var(--color-ink)]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="hud" style={{ color: "var(--coral)" }}>◆ CLASS · FILTER</span>
              <span className="text-xs text-[var(--color-ink)]/60">
                {activeClassName
                  ? `目前顯示「${activeClassName}」的 ${filteredItems.length} 次活動`
                  : `共 ${classNames.length} 個班級，顯示全部 ${items.length} 次活動`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  playSound("tap");
                  setActiveClassName(null);
                }}
                className={`text-sm px-3 py-1.5 rounded-full border-2 font-bold transition tap-target ${
                  activeClassName === null
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                    : "bg-white border-[var(--color-ink)]/20 hover:border-[var(--color-coral)]"
                }`}
                style={{ minHeight: 36 }}
              >
                🌐 全部 ({items.length})
              </button>
              {classNames.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => {
                    playSound("tap");
                    setActiveClassName(name);
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border-2 font-bold transition tap-target ${
                    activeClassName === name
                      ? "bg-[var(--color-coral)] text-white border-[var(--color-coral)]"
                      : "bg-white border-[var(--color-ink)]/20 hover:border-[var(--color-coral)]"
                  }`}
                  style={{ minHeight: 36 }}
                >
                  {name} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>
            {!activeClassName && classNames.length >= 2 && (
              <p className="text-xs text-[var(--color-ink)]/50 mt-3">
                💡 點任一班級可單獨檢視該班的統計與活動歷史
              </p>
            )}
            {/* 未來歸類 — 沒填 className 的舊資料 */}
            {items.some((it) => !it.snapshot.className?.trim()) && (
              <button
                onClick={() => {
                  playSound("tap");
                  setActiveClassName("");
                }}
                className={`text-xs px-3 py-1 rounded-full border-2 font-bold transition mt-2 ${
                  activeClassName === ""
                    ? "bg-[var(--color-ink)]/60 text-white border-[var(--color-ink)]/60"
                    : "bg-white border-[var(--color-ink)]/20 text-[var(--color-ink)]/60 hover:border-[var(--color-ink)]/40"
                }`}
              >
                📦 未分類 ({items.filter((it) => !it.snapshot.className?.trim()).length})
              </button>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* 最近 5 次活動 */}
          <section className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-black flex items-center gap-2">
                <span>📅</span> 最近 5 次活動
              </h2>
              <Link
                href="/teacher/history"
                className="text-xs px-3 py-1.5 rounded-full bg-violet-100 border border-violet-300 text-violet-700 font-bold hover:bg-violet-200"
              >
                看全部 →
              </Link>
            </div>

            {loading && (
              <div className="text-center py-8 text-[var(--color-ink)]/40 text-sm">載入中...</div>
            )}

            {!loading && recent5.length === 0 && (
              <div className="text-center py-8 text-[var(--color-ink)]/50 text-sm">
                <div className="text-4xl mb-2">📭</div>
                <p>還沒有任何活動</p>
                <Link
                  href="/teacher/new"
                  className="inline-block mt-3 px-4 py-2 rounded-full bg-violet-500 text-white text-xs font-bold hover:bg-violet-600"
                >
                  建立第一個房間 →
                </Link>
              </div>
            )}

            {!loading && recent5.length > 0 && (
              <div className="space-y-2">
                {recent5.map((it) => {
                  const topType = Object.entries(it.snapshot.typeDistribution).sort((a, b) => b[1] - a[1])[0];
                  return (
                    <div
                      key={it.sessionId}
                      className="flex items-center gap-3 p-3 rounded-2xl border-2 border-[var(--color-ink)]/10 hover:border-violet-300 hover:bg-[var(--color-cream)]/50 transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-violet-100 border-2 border-violet-200 flex items-center justify-center text-2xl shrink-0">
                        {topType ? getMBTIInfo(topType[0] as MBTIType).emoji : "🎒"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{it.snapshot.sessionLabel ?? "活動"}</p>
                        <p className="text-xs text-[var(--color-ink)]/60">
                          {new Date(it.snapshot.endedAt).toLocaleDateString("zh-TW")} · {it.snapshot.completedCount} 人完成
                        </p>
                      </div>
                      <Link
                        href="/teacher/history"
                        className="text-xs px-3 py-1 rounded-full bg-white border-2 border-violet-300 text-violet-700 font-bold hover:bg-violet-50 shrink-0"
                      >
                        ↗
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 全校 4 軸總平均 */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
            <h2 className="text-xl font-black mb-3 flex items-center gap-2">
              <span>📊</span> 4 軸總平均
            </h2>
            <p className="text-xs text-[var(--color-ink)]/60 mb-4">
              所有活動累積的學生人數分布
            </p>
            <div className="space-y-3">
              <AxisBar label="E ↔ I" leftCount={stats.aggregatedAxes.E} rightCount={stats.aggregatedAxes.I} leftColor="bg-orange-400" rightColor="bg-sky-400" />
              <AxisBar label="S ↔ N" leftCount={stats.aggregatedAxes.S} rightCount={stats.aggregatedAxes.N} leftColor="bg-emerald-400" rightColor="bg-purple-400" />
              <AxisBar label="T ↔ F" leftCount={stats.aggregatedAxes.T} rightCount={stats.aggregatedAxes.F} leftColor="bg-indigo-400" rightColor="bg-rose-400" />
              <AxisBar label="J ↔ P" leftCount={stats.aggregatedAxes.J} rightCount={stats.aggregatedAxes.P} leftColor="bg-amber-400" rightColor="bg-teal-400" />
            </div>
          </section>
        </div>

        {/* 16 型總分布 */}
        {Object.keys(stats.aggregatedTypes).length > 0 && (
          <section className="mt-4 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[var(--color-ink)]/10 shadow-sm">
            <h2 className="text-xl font-black mb-3 flex items-center gap-2">
              <span>🌟</span> 全校 16 型總分布
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {ALL_TYPES.map((t) => {
                const count = stats.aggregatedTypes[t] ?? 0;
                const info = getMBTIInfo(t);
                const isHighest = count > 0 && count === Math.max(...Object.values(stats.aggregatedTypes));
                return (
                  <div
                    key={t}
                    className={`text-center p-2 rounded-xl border-2 ${
                      count > 0
                        ? isHighest
                          ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300"
                          : "bg-white border-[var(--color-coral)]/30"
                        : "bg-[var(--color-ink)]/5 border-transparent opacity-40"
                    }`}
                  >
                    <div className="text-xl sm:text-2xl">{info.emoji}</div>
                    <div className="text-[10px] sm:text-xs font-black tracking-wider mt-0.5">{t}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-[var(--color-coral)] mt-0.5">
                      {count > 0 ? `×${count}` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 所有老師工具入口 */}
        <section className="mt-6">
          <h2 className="text-xl font-black mb-3 flex items-center gap-2">
            <span>🛠️</span> 老師工具箱
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <ToolCard
              href="/teacher/new"
              emoji="🎓"
              title="建立班級房間"
              desc="開房號讓全班一起玩"
              gradient="from-violet-400 to-purple-500"
            />
            <ToolCard
              href="/teacher/history"
              emoji="📈"
              title="班級活動歷史"
              desc="歷次紀錄 + AI 報告"
              gradient="from-fuchsia-400 to-pink-500"
              badge="NEW AI"
            />
            <ToolCard
              href="/class-stats"
              emoji="📊"
              title="班級 MBTI 統計"
              desc="貼名單看分布"
              gradient="from-cyan-400 to-blue-500"
            />
            <ToolCard
              href="/guess"
              emoji="🎲"
              title="猜朋友 MBTI"
              desc="班級互動遊戲"
              gradient="from-orange-400 to-amber-500"
            />
            <ToolCard
              href="/journey"
              emoji="🎒"
              title="自我探索三部曲"
              desc="45 分鐘輔導課"
              gradient="from-emerald-400 to-teal-500"
              badge="課程包"
            />
            <ToolCard
              href="/sel"
              emoji="🌧️"
              title="SEL 逆境特別篇"
              desc="情緒因應探索"
              gradient="from-violet-500 to-fuchsia-500"
              badge="SEL"
            />
            <ToolCard
              href="/slides"
              emoji="🎬"
              title="教學投影片"
              desc="10 張備課直接投影"
              gradient="from-sky-400 to-indigo-500"
            />
            <ToolCard
              href="/worksheet"
              emoji="📋"
              title="A4 反思學習單"
              desc="列印給學生帶回家"
              gradient="from-lime-400 to-green-500"
            />
          </div>
        </section>

        {/* 提示 */}
        <section className="mt-6 p-4 rounded-2xl bg-violet-50 border-2 border-violet-200">
          <p className="text-xs text-violet-800/90 leading-relaxed">
            💡 <strong>給老師：</strong>
            這個 dashboard 整合了所有「老師相關」功能，書籤這頁就能一鍵到位。
            學生個人歷程在 <Link href="/me" className="underline font-bold">/me</Link>（學生自己看的）；
            這個 dashboard 是老師看的綜合視圖。
          </p>
        </section>
      </div>
    </div>
  );
}

// ─────────────────── 子元件 ───────────────────

function DashStat({ emoji, label, value, sub }: { emoji: string; label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center border border-white/30">
      <div className="text-2xl sm:text-3xl mb-0.5">{emoji}</div>
      <p className="text-[10px] sm:text-xs font-bold uppercase opacity-90">{label}</p>
      <p className="text-2xl sm:text-3xl font-black my-0.5 drop-shadow">{value}</p>
      <p className="text-[10px] sm:text-xs opacity-80">{sub}</p>
    </div>
  );
}

function AxisBar({
  label,
  leftCount,
  rightCount,
  leftColor,
  rightColor,
}: {
  label: string;
  leftCount: number;
  rightCount: number;
  leftColor: string;
  rightColor: string;
}) {
  const total = leftCount + rightCount;
  const leftPct = total > 0 ? (leftCount / total) * 100 : 50;
  return (
    <div>
      <p className="text-xs font-bold text-[var(--color-ink)]/60 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[var(--color-ink)]/70 w-8 text-right">{leftCount}</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-[var(--color-ink)]/10 flex">
          <div className={leftColor} style={{ width: `${leftPct}%` }} />
          <div className={rightColor} style={{ width: `${100 - leftPct}%` }} />
        </div>
        <span className="text-xs font-bold text-[var(--color-ink)]/70 w-8">{rightCount}</span>
      </div>
    </div>
  );
}

function ToolCard({
  href,
  emoji,
  title,
  desc,
  gradient,
  badge,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  gradient: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => playSound("tap")}
      className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-md hover:shadow-lg hover:scale-105 transition block`}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border-2 border-white">
          {badge}
        </span>
      )}
      <div className="text-3xl mb-1">{emoji}</div>
      <p className="font-black text-sm sm:text-base drop-shadow">{title}</p>
      <p className="text-[11px] opacity-90 drop-shadow mt-0.5">{desc}</p>
    </Link>
  );
}
