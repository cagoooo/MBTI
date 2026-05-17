"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import SoundButton from "@/components/SoundButton";
import { ensureSignedIn, isFirebaseAvailable } from "@/lib/firebase";
import {
  deleteSessionHistory,
  subscribeTeacherHistory,
  type SessionSnapshot,
} from "@/lib/classroom-rtdb";
import { getMBTIInfo } from "@/lib/mbti";
import { ALL_TYPES } from "@/lib/types";
import type { MBTIType } from "@/lib/types";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import ClassInsightReport from "@/components/ClassInsightReport";
import { getSelStyleInfo, type SelStyle } from "@/lib/sel";

interface HistoryItem {
  sessionId: string;
  snapshot: SessionSnapshot;
}

export default function TeacherHistoryPage() {
  const [teacherUid, setTeacherUid] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
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

  // 趨勢資料：每場活動的 4 軸偏向（為了畫小折線圖）
  const trends = useMemo(() => {
    // 依時間正序（從舊到新，方便畫趨勢）
    const sorted = [...items].sort((a, b) => a.snapshot.endedAt - b.snapshot.endedAt);
    return sorted.map((it) => {
      const a = it.snapshot.axisCount;
      const totalEI = a.E + a.I;
      const totalSN = a.S + a.N;
      const totalTF = a.T + a.F;
      const totalJP = a.J + a.P;
      return {
        date: new Date(it.snapshot.endedAt).toLocaleDateString("zh-TW", {
          month: "numeric",
          day: "numeric",
        }),
        sessionId: it.sessionId,
        ePct: totalEI > 0 ? Math.round((a.E / totalEI) * 100) : 50,
        nPct: totalSN > 0 ? Math.round((a.N / totalSN) * 100) : 50,
        fPct: totalTF > 0 ? Math.round((a.F / totalTF) * 100) : 50,
        pPct: totalJP > 0 ? Math.round((a.P / totalJP) * 100) : 50,
      };
    });
  }, [items]);

  async function onDelete(sessionId: string) {
    if (!teacherUid) return;
    if (!confirm("確定刪除這筆活動紀錄？無法復原")) return;
    playSound("toggleOff");
    await deleteSessionHistory(teacherUid, sessionId);
  }

  return (
    <div className="container-paper has-floating-ui" style={{paddingTop:0}}>
      <SiteNav active="/teacher/history" />
      <BgmController track="home" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          
          <Link
            href="/teacher/new"
            className="text-sm text-violet-700 hover:text-violet-900 font-bold underline underline-offset-4"
          >
            ＋ 建立新班級房間
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-2">
          <span>📈</span> 班級活動歷史
        </h1>
        <p className="text-[var(--color-ink)]/70 mb-6">
          記錄你每次跑過的活動，看看班級 MBTI 分布隨時間的變化
        </p>

        {!isFirebaseAvailable() && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-center">
            <p className="text-amber-900 font-bold">
              ⚠️ Firebase 還沒設定好，歷史功能無法使用
            </p>
            <p className="text-sm text-amber-800/80 mt-2">
              請在 GitHub repo Secrets 加上 NEXT_PUBLIC_FIREBASE_* env 並重新部署
            </p>
          </div>
        )}

        {loading && isFirebaseAvailable() && (
          <div className="text-center py-12 text-[var(--color-ink)]/50">載入中...</div>
        )}

        {!loading && items.length === 0 && isFirebaseAvailable() && (
          <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-[var(--color-ink)]/15 text-center">
            <div className="text-6xl mb-3">📭</div>
            <p className="text-lg font-bold mb-2">還沒有任何歷史紀錄</p>
            <p className="text-sm text-[var(--color-ink)]/60 mb-5">
              建立班級房間，學生玩完後按「結束會議」這場活動就會自動存進來
            </p>
            <Link
              href="/teacher/new"
              className="btn-3d inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-500 text-white font-black hover:bg-violet-600"
            >
              <span>🎓</span>
              <span>建立第一個班級房間</span>
            </Link>
          </div>
        )}

        {/* 趨勢圖 (≥2 場才顯示) */}
        {trends.length >= 2 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 mb-6 shadow-sm">
            <h2 className="text-xl font-black mb-3 flex items-center gap-2">
              <span>📊</span> 四軸趨勢
            </h2>
            <p className="text-xs text-[var(--color-ink)]/60 mb-4">
              每場活動全班偏 E/N/F/P 的比例（vs I/S/T/J）— 看班級個性隨時間的變化
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TrendChart label="E 外向 %" color="#ff8364" data={trends.map((t) => ({ x: t.date, y: t.ePct }))} />
              <TrendChart label="N 直覺 %" color="#a3d8f4" data={trends.map((t) => ({ x: t.date, y: t.nPct }))} />
              <TrendChart label="F 情感 %" color="#ff6b9d" data={trends.map((t) => ({ x: t.date, y: t.fPct }))} />
              <TrendChart label="P 感知 %" color="#ffd93d" data={trends.map((t) => ({ x: t.date, y: t.pPct }))} />
            </div>
          </section>
        )}

        {/* 歷史列表 */}
        <div className="space-y-3">
          {items.map((it, i) => (
            <motion.article
              key={it.sessionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border-2 border-[var(--color-ink)]/10 overflow-hidden"
            >
              <button
                onClick={() => {
                  playSound("tap");
                  setExpanded(expanded === it.sessionId ? null : it.sessionId);
                }}
                className="w-full text-left p-4 sm:p-5 hover:bg-[var(--color-cream)]/50 transition flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-black text-base sm:text-lg mb-1 flex items-center gap-2 flex-wrap">
                    {/* O2: SEL / MBTI mode badge */}
                    {it.snapshot.mode === "sel" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 border border-violet-300 text-violet-800 font-bold">
                        🌧️ SEL
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold">
                        🎒 MBTI
                      </span>
                    )}
                    <span>{it.snapshot.sessionLabel ?? "活動"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink)]/60">
                    <span>📅 {new Date(it.snapshot.endedAt).toLocaleString("zh-TW")}</span>
                    <span className="opacity-50">·</span>
                    <span>🏷️ 房號 {it.snapshot.roomCode}</span>
                    <span className="opacity-50">·</span>
                    <span>👥 {it.snapshot.completedCount} 人完成 / 共 {it.snapshot.totalCount} 人</span>
                  </div>

                  {/* SEL session 預覽 (4 風格) */}
                  {it.snapshot.mode === "sel" && it.snapshot.selStyleDistribution && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {Object.entries(it.snapshot.selStyleDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([style, count]) => {
                          const info = getSelStyleInfo(style as SelStyle);
                          return (
                            <span
                              key={style}
                              className="text-xs px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800 font-bold"
                            >
                              {info.emoji} {info.nickname} ×{count}
                            </span>
                          );
                        })}
                    </div>
                  )}

                  {/* MBTI session 預覽 (Top 3 型) */}
                  {it.snapshot.mode !== "sel" && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {Object.entries(it.snapshot.typeDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([type, count]) => {
                        const info = getMBTIInfo(type as MBTIType);
                        return (
                          <span
                            key={type}
                            className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-cream)] border border-[var(--color-ink)]/10 font-bold"
                          >
                            {info.emoji} {type} ×{count}
                          </span>
                        );
                      })}
                  </div>
                  )}
                </div>
                <span className="text-2xl text-[var(--color-ink)]/30 shrink-0">
                  {expanded === it.sessionId ? "▾" : "▸"}
                </span>
              </button>

              {/* 展開內容 */}
              {expanded === it.sessionId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t-2 border-dashed border-[var(--color-ink)]/10 p-4 sm:p-5 bg-[var(--color-cream)]/30 space-y-4"
                >
                  {/* 16 型分布條 */}
                  <div>
                    <h3 className="text-sm font-black mb-2">16 型完整分布</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ALL_TYPES.map((t) => {
                        const count = it.snapshot.typeDistribution[t] ?? 0;
                        const info = getMBTIInfo(t);
                        return (
                          <div
                            key={t}
                            className={`text-center p-2 rounded-xl border ${
                              count > 0
                                ? "bg-white border-[var(--color-coral)]/30"
                                : "bg-white/40 border-transparent opacity-40"
                            }`}
                          >
                            <div className="text-lg">{info.emoji}</div>
                            <div className="text-[10px] font-black tracking-wider">{t}</div>
                            <div className="text-xs font-bold text-[var(--color-coral)]">
                              {count > 0 ? `×${count}` : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 軸總人數 */}
                  <div>
                    <h3 className="text-sm font-black mb-2">4 軸偏好（全班總數）</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <AxisPair label="E↔I" left={it.snapshot.axisCount.E} right={it.snapshot.axisCount.I} leftLabel="E" rightLabel="I" />
                      <AxisPair label="S↔N" left={it.snapshot.axisCount.S} right={it.snapshot.axisCount.N} leftLabel="S" rightLabel="N" />
                      <AxisPair label="T↔F" left={it.snapshot.axisCount.T} right={it.snapshot.axisCount.F} leftLabel="T" rightLabel="F" />
                      <AxisPair label="J↔P" left={it.snapshot.axisCount.J} right={it.snapshot.axisCount.P} leftLabel="J" rightLabel="P" />
                    </div>
                  </div>

                  {/* 學生名單 */}
                  <div>
                    <h3 className="text-sm font-black mb-2">學生名單 ({it.snapshot.students.length})</h3>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {it.snapshot.students.map((s, i) => {
                        const info = getMBTIInfo(s.finalType as MBTIType);
                        return (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-full bg-white border border-[var(--color-ink)]/10 font-bold"
                          >
                            {info?.emoji} {s.name} <span className="opacity-50 font-mono">{s.finalType}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 動作 */}
                  <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
                    {/* W1 AI 班級洞察報告 */}
                    <ClassInsightReport sessionId={it.sessionId} snapshot={it.snapshot} />
                    <Link
                      href={`/class-stats?from=${it.snapshot.roomCode}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border-2 border-violet-300 text-violet-700 font-bold hover:bg-violet-50"
                      onClick={() => {
                        const roster = it.snapshot.students.map((s) => `${s.name} ${s.finalType}`).join("\n");
                        try {
                          sessionStorage.setItem(`mbti-class-roster-${it.snapshot.roomCode}`, roster);
                        } catch {}
                      }}
                    >
                      📊 看詳細統計
                    </Link>
                    <SoundButton
                      sound="toggleOff"
                      onClick={() => onDelete(it.sessionId)}
                      className="text-xs px-3 py-1.5 rounded-full bg-rose-50 border-2 border-rose-300 text-rose-700 font-bold hover:bg-rose-100"
                    >
                      🗑️ 刪除
                    </SoundButton>
                  </div>
                </motion.div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 簡易 axis pair bar (左右兩端比例) */
function AxisPair({
  label,
  left,
  right,
  leftLabel,
  rightLabel,
}: {
  label: string;
  left: number;
  right: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const total = left + right;
  const leftPct = total > 0 ? (left / total) * 100 : 50;
  return (
    <div className="text-center">
      <p className="text-[10px] text-[var(--color-ink)]/50 mb-1">{label}</p>
      <div className="bg-[var(--color-ink)]/10 rounded-full h-6 relative overflow-hidden flex items-center text-[10px] font-bold">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-300 to-amber-400"
          style={{ width: `${leftPct}%` }}
        />
        <div className="relative z-10 w-full flex items-center justify-between px-1.5 text-[var(--color-ink)]">
          <span>{leftLabel} {left}</span>
          <span className="text-[var(--color-ink)]/60">{right} {rightLabel}</span>
        </div>
      </div>
    </div>
  );
}

/** 迷你折線圖 (SVG，不裝 chart lib) */
function TrendChart({
  label,
  color,
  data,
}: {
  label: string;
  color: string;
  data: Array<{ x: string; y: number }>;
}) {
  const W = 220;
  const H = 80;
  const padTop = 8;
  const padBottom = 18;
  const padX = 8;
  const usableH = H - padTop - padBottom;
  const usableW = W - padX * 2;
  const step = data.length > 1 ? usableW / (data.length - 1) : 0;
  const points = data
    .map((d, i) => {
      const x = padX + i * step;
      const y = padTop + (1 - d.y / 100) * usableH;
      return `${x},${y}`;
    })
    .join(" ");
  const latest = data[data.length - 1]?.y ?? 0;

  return (
    <div className="bg-[var(--color-cream)]/40 rounded-2xl p-3 border border-[var(--color-ink)]/10">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-sm font-black" style={{ color }}>
          {latest}%
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* 50% 中線 */}
        <line
          x1={padX}
          x2={W - padX}
          y1={padTop + usableH / 2}
          y2={padTop + usableH / 2}
          stroke="rgba(0,0,0,0.08)"
          strokeDasharray="3 3"
        />
        {/* 線 */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 點 */}
        {data.map((d, i) => {
          const x = padX + i * step;
          const y = padTop + (1 - d.y / 100) * usableH;
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
        {/* X 軸日期 (只顯示首尾) */}
        {data.length > 0 && (
          <>
            <text x={padX} y={H - 4} fontSize="9" fill="rgba(0,0,0,0.5)">
              {data[0].x}
            </text>
            {data.length > 1 && (
              <text x={W - padX} y={H - 4} fontSize="9" fill="rgba(0,0,0,0.5)" textAnchor="end">
                {data[data.length - 1].x}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
