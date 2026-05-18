"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import {
  FAMILY_SCENARIOS,
  FAMILY_STYLES,
  calcFamilyStyle,
  calcFlagScore,
  initialFamilyScores,
  EMERGENCY_RESOURCES,
  type FamilyScores,
  type FamilyChoice,
} from "@/lib/family";

type Phase = "consent" | "intro" | "scene" | "result";

export default function FamilyPage() {
  const [phase, setPhase] = useState<Phase>("consent");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [scores, setScores] = useState<FamilyScores>(initialFamilyScores);
  const [pickedChoices, setPickedChoices] = useState<FamilyChoice[]>([]);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);

  const scene = FAMILY_SCENARIOS[sceneIdx];
  const totalScenes = FAMILY_SCENARIOS.length;
  const finalStyle = useMemo(() => calcFamilyStyle(scores), [scores]);
  const styleInfo = FAMILY_STYLES[finalStyle];
  const flagScore = useMemo(() => calcFlagScore(pickedChoices), [pickedChoices]);

  function handleEnter() {
    playSound("tap");
    setPhase("intro");
  }

  function handleStart() {
    playSound("coin");
    setPhase("scene");
    setSceneIdx(0);
    setScores(initialFamilyScores);
    setPickedChoices([]);
  }

  function handleChoice(choiceIdx: number) {
    const c = scene.choices[choiceIdx];
    playSound("pop");
    setScores((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(c.delta)) {
        next[k as keyof FamilyScores] += v as number;
      }
      return next;
    });
    setPickedChoices((prev) => [...prev, c]);
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
    setPhase("consent");
    setSceneIdx(0);
    setScores(initialFamilyScores);
    setPickedChoices([]);
    setShowFollowUp(null);
  }

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/family" />
      <BgmController track="home" />

      <div className="max-w-3xl mx-auto">
        {/* ─── Consent / 同意 phase (家庭議題敏感,先確認) ─── */}
        {phase === "consent" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-6">
              <span
                className="inline-block tape"
                style={{ background: "var(--tape-rose)", transform: "rotate(-2deg)" }}
              >
                🏡 STATION · 05 · 家庭篇
              </span>
            </div>

            <h1
              className="f-serif text-center"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 8vw, 60px)",
                lineHeight: 1.2,
                margin: "16px 0 20px",
              }}
            >
              在開始之前 ✨
            </h1>

            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 24,
                marginBottom: 20,
                lineHeight: 1.8,
              }}
            >
              <p style={{ fontSize: 16, marginBottom: 16 }}>
                這個 Story Pack 會聊一些家裡的事 — 像是<b>爸媽吵架</b>、<b>被責罵</b>、<b>家人生病</b>、<b>搬家</b> 等。
              </p>
              <p style={{ fontSize: 16, marginBottom: 16, color: "var(--ink-soft)" }}>
                有些情境可能會讓你想起最近發生的事。如果你覺得不舒服,<b>可以隨時停止</b>。
              </p>
              <div
                style={{
                  background: "var(--paper-warm)",
                  borderLeft: "4px solid var(--coral)",
                  padding: "14px 16px",
                  fontSize: 14,
                }}
              >
                <p style={{ fontWeight: 800, marginBottom: 6 }}>📌 重要提醒</p>
                <p style={{ color: "var(--ink-soft)" }}>
                  你的選擇<b>不會被傳給老師 / 家長</b>,完全私密。但如果你選了一些「需要關心」的選項,
                  結束時我們會告訴你「可以找誰聊」 — 因為你不該一個人扛。
                </p>
              </div>
            </div>

            <button
              onClick={handleEnter}
              className="btn-start"
              style={{
                fontSize: 18,
                padding: "14px 28px",
                margin: "0 auto",
                display: "flex",
              }}
            >
              <span>我準備好了</span>
              <span className="arrow">→</span>
            </button>
            <p style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
              全程 ~ 6 分鐘 · 可隨時離開
            </p>
          </motion.section>
        )}

        {/* ─── Intro phase ─── */}
        {phase === "intro" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1
              className="f-serif"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 8vw, 60px)",
                lineHeight: 1.2,
                margin: "20px 0 16px",
              }}
            >
              你怎麼<span style={{ color: "var(--coral)" }}>接住自己</span>?
            </h1>
            <p
              className="f-hand"
              style={{
                fontSize: "clamp(18px, 4vw, 24px)",
                color: "var(--coral)",
                transform: "rotate(-1deg)",
                marginBottom: 24,
              }}
            >
              每個家都不一樣,每個你也不一樣 💕
            </p>

            <div
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--ink)",
                padding: 24,
                marginBottom: 24,
                textAlign: "left",
                lineHeight: 1.8,
              }}
            >
              <p>
                <b>4 種「家庭因應風格」:</b>
              </p>
              <ul style={{ paddingLeft: 24, marginTop: 8, fontSize: 15 }}>
                <li>🌸 <b>表達者</b> — 把情緒說出來、寫出來、畫出來</li>
                <li>🧠 <b>思考者</b> — 想清楚再行動、找原因</li>
                <li>🧘 <b>安撫者</b> — 靜下來、做喜歡的事</li>
                <li>🫂 <b>連結者</b> — 找信任的人聊、求助</li>
              </ul>
              <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
                沒有對錯 · 沒有最好的方法 · 認識自己就是力量
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
              <span style={{ fontSize: 26 }}>🏡</span>
              <span>開始 6 個情境</span>
              <span className="arrow">→</span>
            </button>
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
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{c.emoji}</span>
                    <span>{c.text}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence>
              {showFollowUp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "linear-gradient(135deg, var(--tape-rose), #fff)",
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
              <p className="hud" style={{ color: "rgba(0,0,0,0.6)", marginBottom: 8 }}>
                ◆ YOUR FAMILY COPING STYLE
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
                style={{ fontSize: "clamp(18px, 4vw, 24px)", marginBottom: 20 }}
              >
                {styleInfo.oneLiner}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.85, textAlign: "left" }}>
                {styleInfo.description}
              </p>
            </div>

            {/* ⚠️ Flag 警示 — flagScore >= 3 才顯示緊急資源 */}
            {flagScore >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  background: "linear-gradient(135deg, #fff5f5, #ffe8e8)",
                  border: "2.5px solid var(--coral)",
                  boxShadow: "6px 6px 0 var(--coral)",
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>🫂</span>
                  <div>
                    <div className="f-serif" style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                      你似乎遇到比較重的事
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>
                      聽到你選的一些選項,我們有點擔心你。<b>家裡的重擔不是你一個人的責任</b>。
                      找一個信任的大人聊聊很重要 — 他們會幫你想辦法。
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px dashed var(--coral)",
                    padding: 14,
                    marginTop: 12,
                  }}
                >
                  <div className="hud hud-coral" style={{ marginBottom: 10 }}>
                    ◆ 你可以找這些大人 (24 小時都有人接)
                  </div>
                  {EMERGENCY_RESOURCES.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: i < EMERGENCY_RESOURCES.length - 1 ? "1px dashed var(--line)" : "none",
                      }}
                    >
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{r.emoji}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>
                          {r.name}{" "}
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--coral)",
                              marginLeft: 4,
                            }}
                          >
                            {r.number}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                          {r.who}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                ◆ TOOLBOX · 你的家庭情緒工具箱
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

            {/* Growth */}
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

            {/* For teachers / parents (always shown) */}
            <details
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
              <summary
                style={{ cursor: "pointer", fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}
              >
                💬 給老師 / 家長的話 (點開看)
              </summary>
              <p style={{ marginTop: 12 }}>
                這個 Story Pack 是<b>輔導課用</b>的家庭議題探索 — 不要把學生選擇拿來「評斷」或「對號入座」。
              </p>
              <p style={{ marginTop: 8 }}>
                重點是「<b>讓孩子認識自己的因應風格</b>」 + 「<b>學習其他風格的工具</b>」。
              </p>
              <p style={{ marginTop: 8 }}>
                如果學生在使用過程中流淚 / 不想完成 — 是正常的,代表觸動了真實的情緒。請陪伴,不要追問。
              </p>
              {flagScore >= 3 && (
                <p style={{ marginTop: 8, color: "var(--coral)", fontWeight: 700 }}>
                  ⚠️ 這位學生的選擇出現「需要關心」的訊號 — 請主動關心他的家庭狀況。
                </p>
              )}
            </details>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleRestart}
                className="btn-secondary"
                style={{ padding: "12px 24px", fontSize: 14 }}
              >
                <span>🔄</span>
                <span>再玩一次</span>
              </button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
