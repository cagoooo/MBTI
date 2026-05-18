"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import {
  WEEKLY_LESSONS,
  CASEL_SKILLS,
  TOTAL_WEEKS,
  getAllCurriculumAreas,
  getAllSdgs,
  getAllCaselSkills,
  type WeeklyLesson,
} from "@/lib/curriculum";

export default function CurriculumPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const allCurriculum = getAllCurriculumAreas();
  const allSdgs = getAllSdgs();
  const allCasel = getAllCaselSkills();

  function handlePrint() {
    playSound("tap");
    // 展開所有週次再列印
    setExpanded(-1); // -1 = 全部展開模式
    setTimeout(() => window.print(), 200);
  }

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/teacher/curriculum" />
      <BgmController track="home" />

      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-6 print:hidden">
          <span
            className="inline-block tape"
            style={{ background: "var(--tape-sunny)", transform: "rotate(-2deg)" }}
          >
            👩‍🏫 TEACHER · CURRICULUM · 6 週教案
          </span>
        </div>

        <h1
          className="f-serif text-center"
          style={{
            fontWeight: 900,
            fontSize: "clamp(36px, 8vw, 60px)",
            lineHeight: 1.1,
            margin: "16px 0 12px",
          }}
        >
          §次講長 <span style={{ color: "var(--coral)" }}>6 週</span>教案
        </h1>
        <p
          className="f-hand text-center"
          style={{
            fontSize: "clamp(18px, 4vw, 24px)",
            color: "var(--coral)",
            transform: "rotate(-1deg)",
            marginBottom: 16,
          }}
        >
          108 課綱 + SDG + CASEL 三方對應 · 一鍵備課 ✨
        </p>

        {/* 整體對應規範 */}
        <section
          className="print:hidden"
          style={{
            background: "linear-gradient(135deg, var(--paper-warm), #fff)",
            border: "2.5px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div className="hud hud-coral" style={{ marginBottom: 12 }}>
            ◆ FRAMEWORK · 對應教學規範
          </div>

          {/* 108 課綱 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
              📘 108 課綱核心素養 ({allCurriculum.length} 項)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allCurriculum.map((c) => (
                <span
                  key={c}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    background: "#fff",
                    border: "1.5px solid var(--ink)",
                    fontWeight: 700,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* SDG */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
              🌐 聯合國永續發展目標 ({allSdgs.length} 項)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allSdgs.map((s) => (
                <span
                  key={s.number}
                  className={`bg-gradient-to-r ${s.color} text-white`}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    fontWeight: 700,
                    borderRadius: 12,
                  }}
                >
                  SDG {s.number} · {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* CASEL */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
              💝 CASEL 5 大社會情緒能力 ({allCasel.length} 項)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allCasel.map((c) => (
                <span
                  key={c.key}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    background: "var(--tape-mint)",
                    border: "1.5px solid var(--ink)",
                    fontWeight: 700,
                  }}
                  title={c.desc}
                >
                  {c.zh}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 列印按鈕 */}
        <div className="text-center mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ padding: "12px 24px", fontSize: 15 }}
          >
            <span>🖨️</span>
            <span>列印整份 6 週教案 PDF</span>
          </button>
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            另存 PDF 即可帶回家或印給家長
          </p>
        </div>

        {/* 6 週教案卡片 grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {WEEKLY_LESSONS.map((lesson) => {
            const isExpanded = expanded === lesson.week || expanded === -1;
            return (
              <article
                key={lesson.week}
                style={{
                  background: "#fff",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "6px 6px 0 var(--ink)",
                  position: "relative",
                }}
              >
                {/* 第 X 週 tag */}
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: 18,
                    background: "var(--coral)",
                    color: "#fff",
                    padding: "4px 14px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: 3,
                    fontWeight: 800,
                  }}
                >
                  WEEK · {String(lesson.week).padStart(2, "0")} / {String(TOTAL_WEEKS).padStart(2, "0")}
                </div>

                {/* Header */}
                <button
                  onClick={() => {
                    playSound("tap");
                    setExpanded(isExpanded ? null : lesson.week);
                  }}
                  className="print:hidden"
                  style={{
                    width: "100%",
                    padding: "24px 20px 16px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div style={{ fontSize: 48, flexShrink: 0 }}>{lesson.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      className="f-serif"
                      style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 900, marginBottom: 4 }}
                    >
                      {lesson.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                      {lesson.subtitle}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 8,
                        flexWrap: "wrap",
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "var(--tape-sunny)",
                          fontWeight: 700,
                          color: "#5a4500",
                        }}
                      >
                        ⏱ {lesson.duration}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "var(--tape-sky)",
                          fontWeight: 700,
                        }}
                      >
                        🎯 {lesson.appName}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 24,
                      color: "var(--muted)",
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* 永遠展開的列印版 (隱藏在螢幕但 print 顯示) */}
                <div className="hidden print:block" style={{ padding: "24px 20px 16px" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
                    Week {lesson.week} · {lesson.emoji} {lesson.title}
                  </h2>
                  <p style={{ fontSize: 13 }}>{lesson.subtitle}</p>
                </div>

                {/* Expanded 詳細內容 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <LessonDetail lesson={lesson} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>

        {/* 結語 */}
        <section
          className="print:hidden"
          style={{
            background: "linear-gradient(135deg, var(--tape-coral), var(--tape-sunny))",
            border: "2.5px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: 24,
            marginTop: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎓</div>
          <h2 className="f-serif" style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            6 週後,你的學生會擁有...
          </h2>
          <ul
            style={{
              textAlign: "left",
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 2,
              fontSize: 15,
            }}
          >
            <li>✨ 完整的自我認識 (MBTI 人格 + SEL 情緒風格 + 家庭因應 + 數位素養)</li>
            <li>🛠️ 4 套工具箱 (情緒急救卡 / 數位安全 SOP / 家庭情緒地圖 / NPC 認識)</li>
            <li>📊 6 份反思學習單 (記錄成長軌跡)</li>
            <li>🌟 完成證書 + 三部曲徽章</li>
            <li>👥 對「同學的多元」更敏感、更包容</li>
            <li>🎯 對「數位 / 家庭 / 公民議題」的初步意識</li>
          </ul>
        </section>

        {/* 入口連結 */}
        <div
          className="print:hidden"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          <Link href="/teacher/dashboard" className="btn-secondary" style={{ padding: "10px 20px" }}>
            ← 回老師 dashboard
          </Link>
          <Link href="/teacher/new" className="btn-start" style={{ padding: "10px 20px" }}>
            🎓 建立第一週班級房間 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function LessonDetail({ lesson }: { lesson: WeeklyLesson }) {
  return (
    <div style={{ padding: "0 20px 24px", lineHeight: 1.8 }}>
      <hr style={{ border: "1px dashed var(--line)", margin: "0 0 20px" }} />

      {/* 對應規範 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <FrameworkBlock title="📘 108 課綱" items={lesson.curriculum108} />
        <FrameworkBlock
          title="🌐 SDG"
          items={lesson.sdgs.map((s) => `${s.number}. ${s.name}`)}
        />
        <FrameworkBlock
          title="💝 CASEL"
          items={lesson.caselSkills.map((k) => CASEL_SKILLS[k].zh)}
        />
      </div>

      {/* 主要 app */}
      <div
        style={{
          background: "var(--paper-warm)",
          padding: 12,
          border: "1.5px dashed var(--line-strong)",
          marginBottom: 16,
        }}
      >
        <span className="hud hud-coral">◆ 本週使用</span>
        <div style={{ marginTop: 4, fontSize: 15 }}>
          🚀 <b>{lesson.appName}</b> ·{" "}
          <Link
            href={lesson.appPath}
            style={{
              color: "var(--coral)",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            {lesson.appPath}
          </Link>
        </div>
      </div>

      {/* 課前準備 */}
      <Section title="📋 課前準備">
        <ul style={{ paddingLeft: 24 }}>
          {lesson.beforeClass.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </Section>

      {/* 暖場 */}
      <Section title={`🔥 暖場 (${lesson.warmUp.time})`}>
        <div style={{ marginBottom: 8 }}>
          <b>老師講稿:</b>
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            {lesson.warmUp.teacher.map((t, i) => (
              <li key={i} style={{ fontStyle: "italic" }}>「{t}」</li>
            ))}
          </ul>
        </div>
        <div>
          <b>活動:</b> {lesson.warmUp.activity}
        </div>
      </Section>

      {/* 主活動 */}
      <Section title={`🎯 主活動 (${lesson.mainActivity.time})`}>
        <div style={{ marginBottom: 8 }}>
          <b>老師引導:</b>
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            {lesson.mainActivity.teacher.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>學生任務:</b> {lesson.mainActivity.studentTask}
        </div>
        <div
          style={{
            background: "rgba(255, 131, 100, 0.08)",
            borderLeft: "3px solid var(--coral)",
            padding: "10px 14px",
            marginTop: 10,
          }}
        >
          <b style={{ color: "var(--coral)" }}>💡 教學小提示:</b>
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            {lesson.mainActivity.tips.map((t, i) => (
              <li key={i} style={{ fontSize: 14 }}>{t}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 反思 */}
      <Section title={`💭 反思 (${lesson.reflection.time})`}>
        <div style={{ marginBottom: 8 }}>
          <b>給學生的反思題:</b>
          <ol style={{ paddingLeft: 24, marginTop: 4 }}>
            {lesson.reflection.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
        <div>
          <b>老師引導:</b>
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            {lesson.reflection.teacher.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 跨週銜接 */}
      <Section title="🔗 跨週銜接">
        <ul style={{ paddingLeft: 24 }}>
          {lesson.connectsTo.map((c, i) => (
            <li key={i}>
              <b>Week {c.week}:</b> {c.how}
            </li>
          ))}
        </ul>
      </Section>

      {/* 配套 */}
      <Section title="🎁 配套資源">
        <div style={{ marginBottom: 8 }}>
          <b>📋 學習單:</b> {lesson.worksheetTips}
        </div>
        <div
          style={{
            background: "var(--tape-rose)",
            padding: 12,
            border: "1.5px solid var(--ink)",
            marginTop: 10,
          }}
        >
          <b>📩 給家長的聯絡簿摘要 (可直接複製):</b>
          <p style={{ marginTop: 6, fontStyle: "italic" }}>「{lesson.parentNote}」</p>
        </div>
      </Section>
    </div>
  );
}

function FrameworkBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        background: "var(--paper-2)",
        padding: 10,
        border: "1.5px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", marginBottom: 6 }}>
        {title}
      </div>
      <ul style={{ paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          background: "var(--ink)",
          color: "#fff",
          padding: "6px 12px",
          fontWeight: 800,
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 4 }}>{children}</div>
    </div>
  );
}
