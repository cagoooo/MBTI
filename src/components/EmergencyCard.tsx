"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SelStyle } from "@/lib/sel";
import { getSelStyleInfo } from "@/lib/sel";
import { playSound } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speak as speakTts, stop as stopTts } from "@/lib/tts";
import appConfig from "../../app.config";

interface Props {
  style: SelStyle;
}

/**
 * 情緒急救卡 — 信用卡 / 錢包大小可印 PDF
 *
 * 設計 (依 emergency-card.html):
 *   - 一張 A4 印 4 張同樣的卡 (2x2 grid，學生剪下分享)
 *   - 卡：✂ 角剪 + SOS banner (黑底 mono) + style hero (gradient bg)
 *        + oneliner (paper-warm 引言塊) + tools list + contacts blanks + 學校 footer
 *   - 用 @media print + @page A4 + body.printing-card class 控制
 *   - 學生填名字/聯絡人後可塑封
 */
export default function EmergencyCard({ style }: Props) {
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const info = getSelStyleInfo(style);
  // 工具箱前 5 個短版 (去除括弧內冗長註)
  const shortTools = info.toolbox.map((t) =>
    t.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").slice(0, 22),
  );

  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    const refresh = () => setTtsEnabled(isTtsAvailable() && isTtsOn());
    window.addEventListener("storage", refresh);
    window.addEventListener("mbti-settings-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("mbti-settings-change", refresh);
    };
  }, []);

  function handlePrint() {
    playSound("coin");
    document.body.classList.add("printing-card");
    setTimeout(() => {
      window.print();
      // 列印 dialog 關閉後移除 class (用 setTimeout 確保 paint 完)
      setTimeout(() => document.body.classList.remove("printing-card"), 1000);
    }, 100);
  }

  function speakCard() {
    playSound("tap");
    speakTts(
      [
        `我是 ${info.nickname}。`,
        info.oneLiner,
        "我的 5 個情緒工具：",
        ...shortTools.map((t, i) => `第 ${i + 1} 個：${t}`),
        "緊急時別忘了找家人、朋友、或老師。",
      ].join("。"),
      { rate: 1.0, pitch: 1.05 },
    );
  }

  function stopReading() {
    playSound("toggleOff");
    stopTts();
  }

  const dateLabel = new Date().toLocaleDateString("zh-TW");

  return (
    <>
      {/* ON-SCREEN PROMO BLOCK */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="ecard-toolbar print:hidden"
        style={{ marginTop: 48, marginBottom: 24 }}
      >
        <div className="tab">🆘 EMERGENCY · CARD · 口袋大小</div>
        <h3
          className="f-serif"
          style={{
            margin: "8px 0 4px",
            fontWeight: 900,
            fontSize: 24,
          }}
        >
          下載我的情緒急救卡
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            margin: "0 0 16px",
            lineHeight: 1.6,
          }}
        >
          錢包 / 鉛筆盒大小的口袋卡，列印剪下塑封 — 遇到難過時拿出來看，提醒自己有這些工具可以用 ✨
          一張 A4 印 <b>4 張</b>，剪下後給朋友也行。
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch" }}>
          <button
            onClick={handlePrint}
            className="btn-start"
            style={{ flex: 1, minWidth: 200, fontSize: 18, padding: "16px 24px", justifyContent: "center" }}
          >
            <span style={{ fontSize: 22 }}>🖨️</span>
            <span>列印 / 另存 PDF</span>
          </button>
          {ttsEnabled && (
            <>
              <button
                onClick={speakCard}
                title="念出我的急救卡內容"
                className="btn-secondary"
                style={{ padding: "16px 18px", fontSize: 14, justifyContent: "center" }}
              >
                <span style={{ fontSize: 18 }}>🔊</span>
                <span className="hidden sm:inline">唸給我聽</span>
              </button>
              <button
                onClick={stopReading}
                title="停止朗讀"
                className="btn-secondary"
                style={{ padding: "16px 14px", fontSize: 14, justifyContent: "center" }}
              >
                ⏸
              </button>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            background: "var(--paper-warm)",
            borderLeft: "4px solid var(--coral)",
            fontSize: 13,
            color: "var(--ink-soft)",
            lineHeight: 1.7,
          }}
        >
          <b>💡 列印小提示</b>
          <br />
          ① 列印對話框選「另存 PDF」就能存到電腦／手機
          <br />
          ② 印出來後沿著虛線剪下 4 張卡
          <br />
          ③ 塑封（去文具店有便宜的）— 放錢包／鉛筆盒帶在身上
          <br />
          ④ 多印一份送好朋友也很 OK
        </div>
      </motion.section>

      {/* A4 PRINT SHEET — 螢幕也顯示 1:1 預覽，print 時自動撐滿一頁 */}
      <div className="print:hidden" style={{ textAlign: "center", marginTop: 16, marginBottom: 12 }}>
        <span className="hud">▼ A4 列印預覽 · 1:1 真實大小 ▼</span>
      </div>

      <div style={{ overflow: "auto", padding: "0 0 20px" }}>
        <div className="a4-sheet">
          {/* Header */}
          <div className="a4-head">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🆘</span>
                <div className="title">
                  情緒急救卡 ·{" "}
                  <span style={{ color: "var(--coral)" }}>{info.nickname}</span>
                </div>
              </div>
              <div className="sub">SEL 因應風格 · 口袋大小 · 4 cards per A4</div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--coral)",
                textAlign: "right",
              }}
            >
              ✂ CUT ALONG DASHED LINE
              <br />
              {dateLabel}
            </div>
          </div>

          {/* Card 2x2 grid */}
          <div className="a4-card-grid">
            {[0, 1, 2, 3].map((idx) => (
              <SingleECard
                key={idx}
                style={style}
                info={info}
                shortTools={shortTools}
                idx={idx + 1}
              />
            ))}
          </div>

          {/* A4 footer */}
          <div
            style={{
              position: "absolute",
              bottom: "8mm",
              left: "14mm",
              right: "14mm",
              paddingTop: "4mm",
              borderTop: "1.5px dashed #c8b89e",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: 2,
              color: "#999",
            }}
          >
            <span>
              {appConfig.siteName} · by {appConfig.teacherName} @ {appConfig.schoolShortName}
            </span>
            <span>v2026 · 印 4 張，剪下塑封最耐用</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ───────── Single card sub-component ─────────
function SingleECard({
  style,
  info,
  shortTools,
  idx,
}: {
  style: SelStyle;
  info: ReturnType<typeof getSelStyleInfo>;
  shortTools: string[];
  idx: number;
}) {
  return (
    <div className="ecard">
      {/* SOS banner */}
      <div className="ecard-banner">
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          🆘 SOS · 我的情緒工具
        </span>
        <span className="right">CARD · {String(idx).padStart(2, "0")}/04</span>
      </div>

      {/* Style hero */}
      <div className={`ecard-hero ${style}`}>
        <span className="big-e">{info.emoji}</span>
        <div className="text">
          <div className="nick">{info.nickname}</div>
          <div className="code">SEL · STYLE · {style.toUpperCase()}</div>
        </div>
      </div>

      {/* Oneliner */}
      <div className="ecard-oneliner">「{info.oneLiner}」</div>

      {/* Tools */}
      <div className="ecard-tools-head">💡 MY · 5 · TOOLS</div>
      <ul className="ecard-tools">
        {shortTools.map((t, i) => (
          <li key={i}>
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      {/* Contacts */}
      <div className="ecard-contacts">
        <div className="head">📞 EMERGENCY · CONTACTS</div>
        <div className="row">
          <span className="lbl">家人</span>
          <span className="blank"></span>
        </div>
        <div className="row">
          <span className="lbl">朋友</span>
          <span className="blank"></span>
        </div>
        <div className="row">
          <span className="lbl">老師</span>
          <span className="blank"></span>
        </div>
      </div>

      {/* Footer */}
      <div className="ecard-foot">
        <span className="school">@ {appConfig.schoolShortName}</span>
        <span>FOLD · CUT · LAMINATE</span>
      </div>
    </div>
  );
}
