"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import {
  DIGITAL_SCENARIOS,
  DIGITAL_STYLES,
  calcDigitalStyle,
  initialDigitalScores,
  type DigitalScores,
} from "@/lib/digital";

type Phase = "intro" | "scene" | "result";

export default function DigitalPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [scores, setScores] = useState<DigitalScores>(initialDigitalScores);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);

  const scene = DIGITAL_SCENARIOS[sceneIdx];
  const totalScenes = DIGITAL_SCENARIOS.length;

  const finalStyle = useMemo(() => calcDigitalStyle(scores), [scores]);
  const styleInfo = DIGITAL_STYLES[finalStyle];

  function handleStart() {
    playSound("coin");
    setPhase("scene");
    setSceneIdx(0);
    setScores(initialDigitalScores);
  }

  function handleChoice(choiceIdx: number) {
    const c = scene.choices[choiceIdx];
    playSound("pop");
    setScores((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(c.delta)) {
        next[k as keyof DigitalScores] += v as number;
      }
      return next;
    });
    setShowFollowUp(c.followUp);
  }

  function handleNext() {
    setShowFollowUp(null);
    if (sceneIdx < totalScenes - 1) {
      setSceneIdx(sceneIdx + 1);
      playSound("whoosh");
    } else {
      setPhase("result");
      playSound("reveal");
    }
  }

  function handleRestart() {
    playSound("tap");
    setPhase("intro");
    setSceneIdx(0);
    setScores(initialDigitalScores);
    setShowFollowUp(null);
  }

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/digital" />
      <BgmController track="home" />

      <div className="max-w-3xl mx-auto">
        {/* ─── Intro phase ─── */}
        {phase === "intro" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <span
                className="inline-block tape"
                style={{ background: "var(--tape-sky)", transform: "rotate(-2deg)" }}
              >
                📱 STATION · 04 · 數位素養特別篇
              </span>
            </div>

            <h1
              className="f-serif"
              style={{
                fontWeight: 900,
                fontSize: "clamp(40px, 9vw, 72px)",
                lineHeight: 1.1,
                margin: "16px 0 12px",
              }}
            >
              你是哪種<span style={{ color: "var(--coral)" }}>數位公民</span>?
            </h1>

            <p
              className="f-hand"
              style={{
                fontSize: "clamp(20px, 4vw, 26px)",
                color: "var(--coral)",
                transform: "rotate(-1deg)",
                marginBottom: 20,
              }}
            >
              網路是你的工具,還是你的主人? ✨
            </p>

            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: "24px",
                margin: "24px 0",
                textAlign: "left",
                lineHeight: 1.8,
              }}
            >
              <p style={{ marginBottom: 12 }}>
                <b>2026 年的國小生面對的真實數位日常:</b>
              </p>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li>🤖 AI 工具(ChatGPT / Gemini)幫寫作業</li>
                <li>📰 群組瘋傳假訊息</li>
                <li>📱 短影音 1 小時停不下來</li>
                <li>💬 班級群組玩笑變傷害</li>
                <li>🔒 不小心拍到家門口被陌生人追蹤</li>
                <li>🤝 線上遊戲認識的「朋友」要約見面</li>
              </ul>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                6 個情境 · 沒有對錯答案 · 跟著直覺選 · 看見自己的數位風格
              </p>
            </div>

            <button
              onClick={handleStart}
              className="btn-start"
              style={{
                fontSize: 20,
                padding: "16px 32px",
                margin: "0 auto",
              }}
            >
              <span style={{ fontSize: 26 }}>📱</span>
              <span>開始 6 個情境</span>
              <span className="arrow">→</span>
            </button>

            <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
              全程 ~ 6 分鐘 · 結果不會傳給老師 / 家長,只給你自己看 ✨
            </p>
          </motion.section>
        )}

        {/* ─── Scene phase ─── */}
        {phase === "scene" && (
          <motion.section
            key={sceneIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="hud" style={{ marginBottom: 12 }}>
              ◆ SCENE {sceneIdx + 1} / {totalScenes}
            </div>

            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: "24px 20px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 56, textAlign: "center", marginBottom: 12 }}>{scene.emoji}</div>
              <h2
                className="f-serif"
                style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {scene.title}
              </h2>
              {scene.text.map((t, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 16,
                    lineHeight: 1.85,
                    marginBottom: 8,
                    color: "var(--ink-soft)",
                  }}
                >
                  {t}
                </p>
              ))}
            </div>

            {/* 選項 */}
            {!showFollowUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scene.choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(i)}
                    className="choice-option"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px 16px",
                      background: "#fff",
                      border: "2.5px solid var(--ink)",
                      textAlign: "left",
                      fontSize: 15,
                      lineHeight: 1.6,
                      cursor: "pointer",
                      minHeight: 56,
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{c.emoji}</span>
                    <span>{c.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* followUp */}
            <AnimatePresence>
              {showFollowUp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "linear-gradient(135deg, var(--tape-sky), #fff)",
                    border: "2.5px solid var(--ink)",
                    boxShadow: "4px 4px 0 var(--ink)",
                    padding: 20,
                    marginTop: 16,
                  }}
                >
                  <div className="hud hud-coral" style={{ marginBottom: 8 }}>
                    ◆ RESPONSE
                  </div>
                  <p style={{ fontSize: 16, lineHeight: 1.75, marginBottom: 16 }}>{showFollowUp}</p>
                  <button
                    onClick={handleNext}
                    className="btn-3d"
                    style={{
                      padding: "12px 24px",
                      background: "var(--coral)",
                      color: "#fff",
                      border: "2.5px solid var(--ink)",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                      width: "100%",
                      minHeight: 48,
                    }}
                  >
                    {sceneIdx < totalScenes - 1 ? "下一個情境 →" : "✨ 看我的結果"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* ─── Result phase ─── */}
        {phase === "result" && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 24 }}
          >
            <div className="text-center mb-6">
              <span
                className="inline-block tape"
                style={{ background: "var(--tape-sunny)", transform: "rotate(2deg)" }}
              >
                ⚡ QUEST COMPLETE
              </span>
            </div>

            <div
              className={`bg-gradient-to-br ${styleInfo.color}`}
              style={{
                border: "2.5px solid var(--ink)",
                boxShadow: "8px 8px 0 var(--ink)",
                padding: "32px 24px",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 96, marginBottom: 12 }}>{styleInfo.emoji}</div>
              <p
                className="hud"
                style={{ color: "rgba(0,0,0,0.6)", marginBottom: 8 }}
              >
                ◆ YOUR DIGITAL STYLE
              </p>
              <h1
                className="f-serif"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(40px, 8vw, 64px)",
                  margin: "8px 0 12px",
                }}
              >
                {styleInfo.name}
              </h1>
              <p
                className="f-hand"
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  marginBottom: 20,
                }}
              >
                {styleInfo.oneLiner}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.85, textAlign: "left" }}>
                {styleInfo.description}
              </p>
            </div>

            {/* Strengths */}
            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div className="hud hud-coral" style={{ marginBottom: 12 }}>
                ◆ STRENGTHS · 你的超能力
              </div>
              <ul style={{ paddingLeft: 24, lineHeight: 1.8 }}>
                {styleInfo.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Toolbox */}
            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div className="hud hud-coral" style={{ marginBottom: 12 }}>
                ◆ TOOLBOX · 你的數位工具箱
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {styleInfo.toolbox.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 14px",
                      background: "var(--paper-warm)",
                      border: "1.5px solid var(--line)",
                    }}
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{t.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
                        {t.how}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth areas */}
            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div className="hud hud-coral" style={{ marginBottom: 12 }}>
                ◆ GROW · 也試試看
              </div>
              <ul style={{ paddingLeft: 24, lineHeight: 1.8 }}>
                {styleInfo.growthAreas.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Complement */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--tape-sunny), #fff)",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div className="hud hud-coral" style={{ marginBottom: 8 }}>
                ◆ COMPLEMENT · 最互補的夥伴
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 12,
                }}
              >
                <span style={{ fontSize: 56 }}>
                  {DIGITAL_STYLES[styleInfo.complement.style].emoji}
                </span>
                <div>
                  <div className="f-serif" style={{ fontSize: 22, fontWeight: 900 }}>
                    {DIGITAL_STYLES[styleInfo.complement.style].name}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
                    {styleInfo.complement.why}
                  </div>
                </div>
              </div>
            </div>

            {/* For adults */}
            <div
              style={{
                background: "var(--paper-warm)",
                border: "1.5px dashed var(--line-strong)",
                padding: 16,
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              <span className="hud" style={{ color: "var(--ink)", marginBottom: 6, display: "block" }}>
                💬 給老師 / 家長
              </span>
              {styleInfo.forAdults}
            </div>

            {/* Restart */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleRestart}
                className="btn-secondary"
                style={{ padding: "12px 24px", fontSize: 14 }}
              >
                <span>🔄</span>
                <span>再玩一次看會不會不一樣</span>
              </button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
