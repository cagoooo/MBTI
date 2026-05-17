"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SoundButton from "@/components/SoundButton";
import SoundLink from "@/components/SoundLink";
import BgmController from "@/components/BgmController";
import { computeStats, parseClassInput, type ClassEntry } from "@/lib/parse-class";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import StatsExport from "@/components/StatsExport";
import { playSound } from "@/lib/sound";
import appConfig from "../../../app.config";

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
小綠 ESFP
柏翰 ENFJ
詩涵 ESFJ
家睿 ESTP
靜宜 INFP`;

const GROUP_META: Record<string, { name: string; emoji: string; ink: string; bg: string }> = {
  NT: { name: "分析家", emoji: "🧠", ink: "var(--nt-ink)", bg: "var(--nt-bg)" },
  NF: { name: "外交官", emoji: "💖", ink: "var(--nf-ink)", bg: "var(--nf-bg)" },
  SJ: { name: "守護者", emoji: "🛡️", ink: "var(--sj-ink)", bg: "var(--sj-bg)" },
  SP: { name: "探險家", emoji: "🌈", ink: "var(--sp-ink)", bg: "var(--sp-bg)" },
};

function typeGroupKey(t: MBTIType): "NT" | "NF" | "SJ" | "SP" {
  if (t.includes("NT")) return "NT";
  if (t.includes("NF")) return "NF";
  if (t[1] === "S" && t[3] === "J") return "SJ";
  return "SP";
}

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!fromRoom) return;
    try {
      const roster = sessionStorage.getItem(`mbti-class-roster-${fromRoom}`);
      if (roster && raw === "") {
        setRaw(roster);
        setTimeout(() => setSubmitted(true), 200);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromRoom]);

  const { entries, invalidLines } = useMemo(() => parseClassInput(raw), [raw]);
  const stats = useMemo(() => computeStats(entries), [entries]);

  // 把 entry 依 type 分組 (給「點名單」用)
  const namesByType = useMemo(() => {
    const m: Record<MBTIType, string[]> = Object.fromEntries(
      ALL_TYPES.map((t) => [t, [] as string[]]),
    ) as Record<MBTIType, string[]>;
    for (const e of entries) {
      m[e.type].push(e.name ?? "(無名)");
    }
    return m;
  }, [entries]);

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

  function copyCsv() {
    const csv = ["name,type,nick"]
      .concat(entries.map((e) => `${e.name ?? ""},${e.type},${getMBTIInfo(e.type).nickname}`))
      .join("\n");
    navigator.clipboard.writeText(csv).then(() => {
      playSound("coin");
      alert("CSV 已複製到剪貼簿 ✓");
    });
  }

  // 教學洞察
  const insights = useMemo(() => {
    if (entries.length === 0) return [] as Array<{ head: string; text: string }>;
    const out: Array<{ head: string; text: string }> = [];
    const sortedGroups = [...stats.perGroup].sort((a, b) => b.count - a.count);
    if (sortedGroups[0].count > 0) {
      const g = sortedGroups[0];
      const tips: Record<string, string> = {
        NT: "這群孩子重邏輯與遠見，討論時喜歡被問「為什麼」，給點挑戰會發光。",
        NF: "這群孩子重感受與價值，做事不是為交差，是為了「對的事」，多肯定動機。",
        SJ: "這群孩子重秩序與責任，給明確規則 + 可預期的流程他們會非常可靠。",
        SP: "這群孩子重當下與行動，靜態教學坐不住，動手做的活動最能發揮。",
      };
      out.push({
        head: "主力群體",
        text: `班上以 <b>${g.name} (${g.key})</b> 居多，共 ${g.count} 人（${Math.round((g.count / stats.total) * 100)}%）。${tips[g.key] ?? ""}`,
      });
    }
    const tilts: Array<{ axes: ["E" | "I", "I" | "E"] | ["S" | "N", "N" | "S"] | ["T" | "F", "F" | "T"] | ["J" | "P", "P" | "J"]; names: [string, string] }> = [
      { axes: ["E", "I"], names: ["外向", "內向"] },
      { axes: ["S", "N"], names: ["實感", "直覺"] },
      { axes: ["T", "F"], names: ["思考", "情感"] },
      { axes: ["J", "P"], names: ["計畫", "開放"] },
    ];
    const axisTips: Record<string, string> = {
      E: "大部分學生喜歡熱鬧、互動、發言。安排小組討論、上台分享、戲劇活動效果最好。",
      I: "大部分學生需要安靜思考的空間。發問時給學生「先寫下來再說」會更有品質的回應。",
      S: "大部分學生喜歡具體、實際、看得到的東西。教學用實物、案例、步驟最有感。",
      N: "大部分學生喜歡想像、抽象、可能性。多給「如果…會怎樣」的開放題引發討論。",
      T: "大部分學生喜歡邏輯、公平、客觀。決策時可以用投票、評分量表他們接受度最高。",
      F: "大部分學生重視關係、感受、和諧。處理衝突時優先聆聽感受，再談規則。",
      J: "大部分學生喜歡規劃、明確、有結構。給課程表、作業期程他們會很安心。",
      P: "大部分學生喜歡彈性、開放、隨機應變。允許多個正確答案、給選擇權他們會更投入。",
    };
    for (const t of tilts) {
      const a = stats.axes[t.axes[0]];
      const b = stats.axes[t.axes[1]];
      const sum = a + b;
      if (sum < 5) continue;
      if (a / sum > 0.65) {
        out.push({
          head: `${t.axes[0]}/${t.axes[1]} 軸傾斜`,
          text: `班上明顯偏向 <b>${t.names[0]}（${t.axes[0]}）</b>（${Math.round((a / sum) * 100)}%）。${axisTips[t.axes[0]]}`,
        });
      } else if (b / sum > 0.65) {
        out.push({
          head: `${t.axes[0]}/${t.axes[1]} 軸傾斜`,
          text: `班上明顯偏向 <b>${t.names[1]}（${t.axes[1]}）</b>（${Math.round((b / sum) * 100)}%）。${axisTips[t.axes[1]]}`,
        });
      }
    }
    if (stats.missingTypes.length >= 4) {
      out.push({
        head: "多元提醒",
        text: `班上有 ${stats.missingTypes.length} 種人格沒有人 — 在主題討論時，老師可以特別介紹這些「缺角」類型，避免學生產生「只有某幾種人才對」的誤會。`,
      });
    }
    if (stats.mostCommon && stats.rarest && stats.mostCommon.count >= stats.rarest.count * 3) {
      out.push({
        head: "分組建議",
        text: `主流型（${stats.mostCommon.type}）與稀有型（${stats.rarest.type}）人數差距大，<b>分組時建議刻意把稀有型分散</b>到不同組，讓每組都有不同視角的學生。`,
      });
    }
    if (out.length === 0) {
      out.push({ head: "班級觀察", text: "你的班分佈很平衡 — 主題討論、分組任務都很適合。" });
    }
    return out;
  }, [entries, stats]);

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/class-stats" />
      <BgmController track="home" />

      {/* HERO */}
      <section style={{ padding: "40px 0 24px" }}>
        <SoundLink
          href="/"
          sound="tap"
          className="top-action-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#fff",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            textDecoration: "none",
            color: "var(--ink)",
            fontWeight: 800,
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          ← 回首頁
        </SoundLink>

        <div className="tape mint rotate-n2" style={{ marginBottom: 16 }}>📊 TEACHER · TOOL · 班級統計</div>

        <h1
          className="f-serif"
          style={{
            fontWeight: 900,
            fontSize: "clamp(48px, 9vw, 110px)",
            lineHeight: 0.92,
            letterSpacing: -2,
            margin: "0 0 20px",
          }}
        >
          全班<span style={{ color: "var(--coral)" }}>MBTI</span>
          <br />
          <span style={{ color: "var(--sj-ink)" }}>分佈圖</span>
        </h1>

        <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}>
          把學生玩完的結果（名字＋MBTI）貼進來，自動產出 <b>16 型分佈</b>、<b>四大群統計</b>、<b>四軸班級平衡</b>、
          <b>教學洞察</b> — 給老師備課、家長日、班會直接用。
        </p>
      </section>

      {!submitted || entries.length === 0 ? (
        /* PHASE 1: INPUT */
        <section style={{ padding: "20px 0 60px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 360px)",
              gap: 32,
              alignItems: "start",
            }}
            className="class-stats-input-grid"
          >
            <div className="roster-box">
              <div className="tab">📋 CLASS · ROSTER</div>

              <h2 className="f-serif" style={{ fontWeight: 900, fontSize: 28, lineHeight: 1, margin: "8px 0 4px" }}>
                班級名單
              </h2>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 16px" }}>
                每行一人，名字 + MBTI 類型。格式很彈性 — 「小明 INTJ」、「小明: INTJ」、「小明,INTJ」都行。
              </p>

              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                spellCheck={false}
                className="roster-textarea"
                placeholder={"小明 ENFP\n小芸: INFJ\n阿哲 INTJ\n..."}
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
                <b>💡 小提示</b>　可以從<u>班級活動歷史</u>或<u>班級房間</u>把名單複製過來，最快。
                {invalidLines.length > 0 && (
                  <div style={{ marginTop: 6, color: "#a87a16" }}>
                    ⚠️ 有 {invalidLines.length} 行無法辨識，會自動忽略。
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <SoundButton
                  sound="coin"
                  onClick={handleAnalyze}
                  disabled={entries.length === 0}
                  className="btn-start"
                  style={{ flex: 1, justifyContent: "center", padding: 18, minWidth: 220 }}
                >
                  <span style={{ fontSize: 22 }}>📊</span>
                  <span>產生班級統計</span>
                  <span className="arrow">→</span>
                </SoundButton>
                <SoundButton
                  sound="pop"
                  onClick={loadSample}
                  style={{
                    padding: "16px 22px",
                    background: "#fff",
                    border: "2.5px solid var(--ink)",
                    boxShadow: "4px 4px 0 var(--ink)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🎲 載入範例
                </SoundButton>
              </div>
            </div>

            <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  background: "#fff",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "6px 6px 0 var(--ink)",
                  padding: "20px 22px",
                }}
              >
                <div className="hud" style={{ marginBottom: 10 }}>▸ ROSTER · PREVIEW</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    className="f-serif"
                    style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: "var(--coral)" }}
                  >
                    {entries.length}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>位同學</span>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                    letterSpacing: 1.5,
                  }}
                >
                  ✓ 至少需要 3 人才能產生統計
                </div>
              </div>

              <div
                style={{
                  background: "var(--sj-bg)",
                  border: "2px dashed var(--ink)",
                  padding: "16px 20px",
                }}
              >
                <div className="hud" style={{ color: "var(--sj-ink)", marginBottom: 8 }}>🎓 教學應用</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "var(--ink-soft)" }}>
                  <li>家長日「我們班的人格地圖」</li>
                  <li>分組任務參考（避免分到同質太高）</li>
                  <li>班級輔導課素材</li>
                  <li>「缺哪一型」的多元教育引導</li>
                </ul>
              </div>

              <div
                style={{
                  background: "var(--paper-warm)",
                  border: "2px solid var(--coral)",
                  padding: "16px 20px",
                }}
              >
                <div className="hud" style={{ color: "var(--coral)", marginBottom: 8 }}>⚠️ 隱私提醒</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-soft)" }}>
                  建議用<b>暱稱</b>或<b>學號</b>，不要把真實姓名上傳到雲端。本工具完全在你的瀏覽器執行，不會送到伺服器。
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        /* PHASE 2: STATS */
        <section style={{ padding: "20px 0 80px" }}>
          {/* Top action bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 24,
            }}
            className="print-hide"
          >
            <div>
              <div className="hud" style={{ marginBottom: 4 }}>▸ CLASS · ANALYSIS</div>
              <h2
                className="f-serif"
                style={{ fontWeight: 900, fontSize: 36, lineHeight: 1, margin: 0 }}
              >
                班級 MBTI 分佈報告
              </h2>
            </div>
            <div className="top-actions">
              <SoundButton sound="tap" onClick={() => setSubmitted(false)}>
                ← 改名單
              </SoundButton>
              <button onClick={() => window.print()}>🖨 列印</button>
              <button onClick={copyCsv}>📄 複製 CSV</button>
              <SoundButton sound="whoosh" onClick={handleReset}>🔄 重新開始</SoundButton>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="summary-grid">
            <div className="stat-card">
              <div className="lbl">TOTAL · 班級人數</div>
              <div className="num" style={{ color: "var(--ink)" }}>{stats.total}</div>
              <div className="sub">位學生完成測驗</div>
            </div>

            {stats.mostCommon && (
              <div className="stat-card" style={{ borderColor: "var(--coral)", boxShadow: "5px 5px 0 var(--coral)" }}>
                <span className="stamp" style={{ color: "var(--coral)", borderColor: "var(--coral)" }}>最多</span>
                <div className="lbl" style={{ color: "var(--coral)" }}>MOST · COMMON</div>
                <div className="num" style={{ color: "var(--coral)", fontSize: 32 }}>
                  {stats.mostCommon.type} × {stats.mostCommon.count}
                </div>
                <div className="sub">
                  {getMBTIInfo(stats.mostCommon.type).nickname} {getMBTIInfo(stats.mostCommon.type).emoji}
                </div>
              </div>
            )}

            {stats.rarest && (
              <div className="stat-card" style={{ borderColor: "var(--sky)", boxShadow: "5px 5px 0 var(--sky)" }}>
                <span className="stamp" style={{ color: "var(--sky)", borderColor: "var(--sky)" }}>最稀有</span>
                <div className="lbl" style={{ color: "var(--sky)" }}>RAREST · UNIQUE</div>
                <div className="num" style={{ color: "var(--sky)", fontSize: 32 }}>
                  {stats.rarest.type} × {stats.rarest.count}
                </div>
                <div className="sub">
                  {getMBTIInfo(stats.rarest.type).nickname} {getMBTIInfo(stats.rarest.type).emoji}
                </div>
              </div>
            )}

            <div className="stat-card" style={{ borderColor: "var(--sunny)", boxShadow: "5px 5px 0 var(--sunny)" }}>
              <span className="stamp" style={{ color: "var(--sunny)", borderColor: "var(--sunny)" }}>缺角</span>
              <div className="lbl" style={{ color: "#a87a16" }}>MISSING · TYPES</div>
              <div className="num" style={{ color: "#a87a16", fontSize: 44 }}>{stats.missingTypes.length}</div>
              <div className="sub">
                {stats.missingTypes.length === 0
                  ? "16 型全有！多元滿分"
                  : "沒人是 " + stats.missingTypes.slice(0, 4).map((t) => t).join(" / ") + (stats.missingTypes.length > 4 ? " …" : "")}
              </div>
            </div>
          </div>

          {/* AXIS BALANCE */}
          <div className="section-header">
            <div className="diamond" style={{ background: "var(--coral)" }}></div>
            <div className="label">Axis Balance · 四軸班級平衡</div>
            <div className="rule"></div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "6px 6px 0 var(--ink)",
              padding: "24px 32px",
              marginBottom: 40,
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              看你的班整體偏向哪一邊。<b>偏哪邊都正常</b> — 重要的是知道自己班的特性，分組時可以刻意混合。
            </p>
            {(
              [
                { l: "I", r: "E", lname: "內向", rname: "外向" },
                { l: "S", r: "N", lname: "實感", rname: "直覺" },
                { l: "T", r: "F", lname: "思考", rname: "情感" },
                { l: "J", r: "P", lname: "計畫", rname: "開放" },
              ] as const
            ).map((p) => {
              const lc = stats.axes[p.l];
              const rc = stats.axes[p.r];
              const sum = lc + rc || 1;
              const lpct = Math.round((lc / sum) * 100);
              const rpct = 100 - lpct;
              return (
                <div key={p.l + p.r} className="axis-row">
                  <div className="left">
                    <div>
                      {p.l} · {p.lname}
                    </div>
                    <span className="small">
                      {lc} 人 · {lpct}%
                    </span>
                  </div>
                  <div className="axis-bar">
                    <div className="axis-fill-l" style={{ width: `${lpct}%` }}>
                      {lc > 0 ? lc : ""}
                    </div>
                    <div className="axis-fill-r" style={{ width: `${rpct}%` }}>
                      {rc > 0 ? rc : ""}
                    </div>
                    <div className="axis-pivot"></div>
                  </div>
                  <div className="right">
                    <div>
                      {p.r} · {p.rname}
                    </div>
                    <span className="small">
                      {rc} 人 · {rpct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4 GROUPS */}
          <div className="section-header">
            <div className="diamond" style={{ background: "var(--plum)" }}></div>
            <div className="label" style={{ color: "var(--plum)" }}>Four Groups · 四大群分佈</div>
            <div
              className="rule"
              style={{
                background: "repeating-linear-gradient(90deg, var(--plum) 0 8px, transparent 8px 16px)",
              }}
            ></div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {stats.perGroup.map((g) => {
              const meta = GROUP_META[g.key];
              const pct = stats.total ? Math.round((g.count / stats.total) * 100) : 0;
              return (
                <div
                  key={g.key}
                  className="group-tile"
                  style={{ borderColor: meta.ink, boxShadow: `5px 5px 0 ${meta.ink}` }}
                >
                  <span className="label-tag" style={{ background: meta.ink }}>
                    {g.key} · {meta.name.toUpperCase()}
                  </span>
                  <div style={{ fontSize: 40, marginTop: 6 }}>{meta.emoji}</div>
                  <div className="f-serif" style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
                    {meta.name}
                  </div>
                  <div className="big-num" style={{ color: meta.ink }}>{g.count}</div>
                  <div className="pct">{pct}% · 全班</div>
                </div>
              );
            })}
          </div>

          {/* 16 TYPE BARS */}
          <div className="section-header">
            <div className="diamond" style={{ background: "var(--mint)" }}></div>
            <div className="label" style={{ color: "var(--mint)" }}>16 Types · 完整分佈 + 點名單</div>
            <div
              className="rule"
              style={{
                background: "repeating-linear-gradient(90deg, var(--mint) 0 8px, transparent 8px 16px)",
              }}
            ></div>
          </div>
          <div
            style={{
              background: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "6px 6px 0 var(--ink)",
              padding: 24,
              marginBottom: 40,
            }}
          >
            <div className="type-bars">
              {ALL_TYPES.map((t) => {
                const count = stats.perType[t];
                const info = getMBTIInfo(t);
                const w = (count / maxCount) * 100;
                const groupColor = `var(--${typeGroupKey(t).toLowerCase()}-ink)`;
                const names = namesByType[t];
                return (
                  <Link key={t} href={`/types/${t}`} className="type-bar-row" data-zero={count === 0} style={{ textDecoration: "none", color: "var(--ink)" }}>
                    <div className="emoji">{info.emoji}</div>
                    <div>
                      <div className="code-block" style={{ color: groupColor }}>{t}</div>
                      <div className="nick">{info.nickname}</div>
                    </div>
                    <div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${w}%`, background: groupColor }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </div>
                      <div className="names-list">{names.join("、 ")}</div>
                    </div>
                    <div className="count">
                      {count} <span className="total">/ {stats.total}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="section-header">
            <div className="diamond" style={{ background: "var(--sunny)" }}></div>
            <div className="label" style={{ color: "var(--sunny)" }}>Teaching Insights · 教學洞察（自動產生）</div>
            <div
              className="rule"
              style={{
                background: "repeating-linear-gradient(90deg, var(--sunny) 0 8px, transparent 8px 16px)",
              }}
            ></div>
          </div>
          <div style={{ marginBottom: 32 }}>
            {insights.map((i, idx) => (
              <div key={idx} className="insight">
                <div className="head">▸ {i.head}</div>
                <div dangerouslySetInnerHTML={{ __html: i.text }} />
              </div>
            ))}
          </div>

          {/* 個別學生 (折疊) */}
          <details
            style={{
              background: "#fff",
              border: "2px solid var(--ink)",
              padding: 20,
              boxShadow: "4px 4px 0 var(--ink)",
              marginBottom: 32,
            }}
            className="print-hide"
          >
            <summary
              style={{
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 3,
                color: "var(--ink)",
              }}
            >
              ▸ ROSTER · 個別學生清單（{entries.length}）
            </summary>
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
              }}
            >
              {entries.map((e: ClassEntry, i) => {
                const info = getMBTIInfo(e.type);
                return (
                  <Link
                    key={i}
                    href={`/types/${e.type}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      background: "var(--paper-warm)",
                      border: "1.5px solid var(--ink)",
                      textDecoration: "none",
                      color: "var(--ink)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{info.emoji}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.name ?? "(無名)"}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 11 }}>{e.type}</span>
                  </Link>
                );
              })}
            </div>
          </details>

          {/* 匯出 / 保存 */}
          <div className="print-hide">
            <StatsExport stats={stats} />
          </div>

          <footer
            style={{
              padding: "40px 0 20px",
              borderTop: "1.5px dashed var(--line-strong)",
              marginTop: 32,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <div className="f-serif" style={{ fontWeight: 900, fontSize: 28, lineHeight: 1, marginBottom: 6 }}>
                校園<span style={{ color: "var(--coral)" }}>奇遇</span>記
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                班級 MBTI 統計 · 老師工具 © 2026 · {appConfig.teacherName} · {appConfig.schoolFullName}
              </div>
            </div>
            <div className="hud">v3.17 · class-stats</div>
          </footer>
        </section>
      )}
    </div>
  );
}
