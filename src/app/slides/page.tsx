"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeToButton from "@/components/HomeToButton";
import SoundLink from "@/components/SoundLink";
import { playSound } from "@/lib/sound";
import { MBTI_GROUPS, getMBTIInfo } from "@/lib/mbti";
import appConfig from "../../../app.config";
import type { MBTIType } from "@/lib/types";

interface SlideMeta {
  num: string;
  brand?: string;
  /** True 把標題往中間靠 (開場 / 結束張) */
  centerY?: boolean;
  bgNum?: string;
  render: () => React.ReactNode;
}

function SlideOpening() {
  return (
    <>
      <div className="tape-deck" style={{ marginBottom: 40 }}>▸ 今天的課程 · OPENING ◂</div>

      <div
        className="f-hand"
        style={{
          fontSize: "clamp(28px, 4vw, 56px)",
          color: "var(--coral)",
          transform: "rotate(-2deg)",
          marginBottom: 48,
        }}
      >
        歡迎來到開學第一天 ✦
      </div>

      <h1 className="h-mega-deck" style={{ marginBottom: 28 }}>
        校園<span style={{ color: "var(--coral)" }}>奇</span>遇記
      </h1>

      <p className="body-xl-deck" style={{ maxWidth: 1100, marginBottom: 36 }}>
        玩一場校園 RPG，
        <b style={{ color: "var(--coral)" }}>10 分鐘</b>
        認識自己的人格類型 — 從開學第一天到校慶大結局，每個選擇都會分支出你的專屬結局。
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div className="hud-deck" style={{ letterSpacing: 6 }}>MBTI · CAMPUS · ADVENTURE</div>
        <div
          style={{
            height: 3,
            flex: 1,
            maxWidth: 240,
            background:
              "repeating-linear-gradient(90deg, var(--coral) 0 12px, transparent 12px 24px)",
          }}
        ></div>
        <div className="f-mono" style={{ fontSize: "clamp(14px, 1.6vw, 22px)", color: "var(--muted)" }}>
          vol.01 · 2026
        </div>
      </div>
    </>
  );
}

function SlideGoals() {
  return (
    <>
      <div className="tape-deck sky" style={{ marginBottom: 18 }}>▸ STEP 01 · 今天要學什麼？</div>
      <h2 className="h-big-deck" style={{ marginBottom: 36 }}>
        今天的<br />
        <span style={{ color: "var(--sky)" }}>學習目標</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div className="goal-li">
          <div className="emoji-big">✨</div>
          <div>
            <div className="lbl">GOAL · 01 · SELF</div>
            <div className="text">
              <b>認識自己</b> — 知道我是怎麼想事情、怎麼跟人相處
            </div>
          </div>
        </div>
        <div className="goal-li">
          <div className="emoji-big">🤝</div>
          <div>
            <div className="lbl">GOAL · 02 · DIVERSITY</div>
            <div className="text">
              <b>尊重多元</b> — 別人跟我不一樣，那是「不同」不是「不好」
            </div>
          </div>
        </div>
        <div className="goal-li">
          <div className="emoji-big">💡</div>
          <div>
            <div className="lbl">GOAL · 03 · REFLECT</div>
            <div className="text">
              <b>練習反思</b> — 玩完想想「我最像哪部分？我想改善什麼？」
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SlideMBTIIntro() {
  return (
    <>
      <div className="tape-deck plum" style={{ marginBottom: 36 }}>▸ STEP 02 · 概念說明</div>
      <h2 className="h-big-deck" style={{ marginBottom: 30 }}>
        <span style={{ color: "var(--plum)" }}>MBTI</span>
        <br />
        是什麼？
      </h2>

      <div
        style={{
          background: "#fff",
          border: "3px solid var(--ink)",
          boxShadow: "10px 10px 0 var(--ink)",
          padding: "clamp(22px, 3vw, 40px) clamp(28px, 3.5vw, 48px)",
          maxWidth: 1100,
          marginBottom: 24,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -18,
            left: 32,
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "6px 18px",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: "clamp(12px, 1.4vw, 20px)",
            letterSpacing: 3,
          }}
        >
          ✦ DEFINITION
        </div>
        <p className="body-xl-deck" style={{ margin: "8px 0 0", lineHeight: 1.55 }}>
          MBTI 是一個
          <b style={{ color: "var(--coral)" }}>「看你怎麼想事情」</b>
          的工具，
          <br />
          把人分成{" "}
          <b style={{ color: "var(--coral)", fontFamily: "var(--font-mono)" }}>16 種</b>
          不同風格。
        </p>
      </div>

      <div
        style={{
          background: "var(--paper-warm)",
          borderLeft: "8px solid var(--coral)",
          padding: "clamp(18px, 2.4vw, 28px) clamp(22px, 2.8vw, 36px)",
          maxWidth: 1100,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}>⚠️</span>
          <div className="body-lg-deck">
            <b style={{ color: "var(--coral)" }}>很重要</b>
            ：MBTI <b>不是</b>分類「好」或「壞」，
            <br />
            而是看「你比較喜歡哪種方式」。
            <b style={{ color: "var(--coral)" }}>每一種都很棒，也都會變化！</b>
          </div>
        </div>
      </div>
    </>
  );
}

function SlideDimensions() {
  const dims: Array<{ color: string; corner: string; cornerBg: string; cornerColor: string; left: string; right: string; desc: React.ReactNode }> = [
    {
      color: "var(--coral)",
      corner: "EXTRAVERSION",
      cornerBg: "var(--tape-sunny)",
      cornerColor: "#5a4500",
      left: "E",
      right: "I",
      desc: (
        <>
          <b>外向</b>　跟人互動充電 · <b>內向</b>　獨處充電
        </>
      ),
    },
    {
      color: "var(--sky)",
      corner: "SENSING",
      cornerBg: "var(--tape-sky)",
      cornerColor: "#1e4a6a",
      left: "S",
      right: "N",
      desc: (
        <>
          <b>實感</b>　看眼前細節 · <b>直覺</b>　想像可能性
        </>
      ),
    },
    {
      color: "var(--rose)",
      corner: "THINKING",
      cornerBg: "var(--tape-rose)",
      cornerColor: "#6a1f3a",
      left: "T",
      right: "F",
      desc: (
        <>
          <b>思考</b>　用邏輯判斷 · <b>情感</b>　看人的感受
        </>
      ),
    },
    {
      color: "var(--mint)",
      corner: "JUDGING",
      cornerBg: "var(--tape-mint)",
      cornerColor: "#1f5a3f",
      left: "J",
      right: "P",
      desc: (
        <>
          <b>計畫</b>　事先安排 · <b>開放</b>　隨機應變
        </>
      ),
    },
  ];
  return (
    <>
      <div className="tape-deck mint" style={{ marginBottom: 18 }}>▸ STEP 03 · DIMENSIONS · 4 軸</div>
      <h2 className="h-big-deck" style={{ marginBottom: 32 }}>
        MBTI 的<br />
        <span style={{ color: "var(--mint)" }}>4 個維度</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {dims.map((d, i) => (
          <div key={i} className="dim-card">
            <span
              className="corner-tape"
              style={{ background: d.cornerBg, color: d.cornerColor }}
            >
              {d.corner}
            </span>
            <div className="pair">
              <span className="letter" style={{ color: d.color }}>{d.left}</span>
              <span className="arrow">↔</span>
              <span className="letter" style={{ color: d.color }}>{d.right}</span>
            </div>
            <div className="desc">{d.desc}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          fontFamily: "var(--font-hand)",
          fontSize: "clamp(18px, 2vw, 28px)",
          color: "var(--muted)",
          transform: "rotate(-1deg)",
        }}
      >
        4 個維度組合 → 16 型人格 ✦
      </div>
    </>
  );
}

function Slide16Types() {
  const groupMeta: Record<string, { emoji: string; ink: string; label: string }> = {
    NT: { emoji: "🧠", ink: "var(--plum)", label: "NT · 分析家" },
    NF: { emoji: "💖", ink: "var(--rose)", label: "NF · 外交官" },
    SJ: { emoji: "🛡️", ink: "var(--mint)", label: "SJ · 守護者" },
    SP: { emoji: "🌈", ink: "var(--sunny)", label: "SP · 探險家" },
  };
  return (
    <>
      <div className="tape-deck rose" style={{ marginBottom: 36 }}>▸ STEP 04 · 16 TYPES · 全圖鑑</div>
      <h2 className="h-big-deck" style={{ marginBottom: 18 }}>
        <span style={{ color: "var(--rose)" }}>16 種</span>人格類型
      </h2>
      <p className="body-md-deck" style={{ marginBottom: 24, maxWidth: 1100 }}>
        每一種都有自己的超能力 — 沒有好壞之分，只有「適合什麼情境」的差別。
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {MBTI_GROUPS.map((g) => {
          const meta = groupMeta[g.key];
          return (
            <div key={g.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: "clamp(24px, 3vw, 36px)" }}>{meta.emoji}</span>
                <div
                  className="hud-deck"
                  style={{ color: meta.ink, fontSize: "clamp(14px, 1.5vw, 22px)" }}
                >
                  {meta.label}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {g.types.map((t: MBTIType) => {
                  const info = getMBTIInfo(t);
                  return (
                    <div key={t} className="type-chip" data-group={g.key}>
                      <div className="code">{t}</div>
                      <div className="nick">{info.nickname}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SlideStartPlaying() {
  const url = appConfig.productionUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <div className="tape-deck sunny" style={{ marginBottom: 24 }}>▸ STEP 05 · LET&apos;S PLAY!</div>
      <h2 className="h-big-deck" style={{ marginBottom: 36 }}>
        現在<br />
        <span style={{ color: "var(--sunny)" }}>開始玩</span>！
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 280px) 1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div className="qr-placeholder" style={{ borderColor: "var(--ink)", boxShadow: "8px 8px 0 var(--ink)" }}>
          <div
            style={{
              position: "relative",
              zIndex: 2,
              background: "var(--paper)",
              padding: "12px 18px",
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "clamp(14px, 1.6vw, 22px)",
              border: "2px dashed var(--coral)",
              color: "var(--coral)",
              textAlign: "center",
              letterSpacing: 2,
              lineHeight: 1.4,
            }}
          >
            QR
            <br />
            CODE
            <br />
            HERE
          </div>
        </div>
        <div>
          <div className="hud-deck" style={{ marginBottom: 14, letterSpacing: 6 }}>
            ▸ 掃 QR · 或 · 瀏覽器輸入
          </div>
          <div
            style={{
              background: "#fff",
              border: "3px solid var(--ink)",
              boxShadow: "8px 8px 0 var(--ink)",
              padding: "clamp(18px, 2.4vw, 32px) clamp(24px, 2.8vw, 40px)",
              fontFamily: "var(--font-mono)",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 56px)",
              wordBreak: "break-all",
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            {url}
          </div>
          <p className="body-md-deck">
            👉 老師若要<b>全班同步玩 + Pin 場景討論</b>：
            <br />
            <span
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "8px 18px",
                background: "var(--plum)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                fontSize: "clamp(14px, 1.6vw, 22px)",
                letterSpacing: 3,
              }}
            >
              🎓 建立班級房間
            </span>
            　拿 6 位數房號
          </p>
        </div>
      </div>
    </>
  );
}

function SlideRules() {
  const rules = [
    { num: "01", text: <><b>誠實選</b>　不要故意選「看起來酷的」</> },
    { num: "02", text: <><b>沒有對錯</b>　每個選擇都會有合適的結果</> },
    { num: "03", text: <><b>不用想太久</b>　跟著「第一直覺」走就對了</> },
    { num: "04", text: <><b>可以重玩</b>　看看不同選擇會走到哪</> },
  ];
  return (
    <>
      <div className="tape-deck mint" style={{ marginBottom: 36 }}>▸ STEP 06 · RULES · 玩的時候請記得</div>
      <h2 className="h-big-deck" style={{ marginBottom: 32 }}>
        4 件<span style={{ color: "var(--mint)" }}>要記得</span>的事
      </h2>
      <div>
        {rules.map((r) => (
          <div key={r.num} className="rule-li">
            <div className="num">{r.num}</div>
            <div className="text">{r.text}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function SlideNextSteps() {
  const cards = [
    { num: "01", emoji: "📋", title: "讀詳細介紹", desc: "看「我的超能力」「練習成長的地方」" },
    { num: "02", emoji: "🤝", title: "麻吉配對", desc: "用「麻吉配對」看跟誰最合拍 / 跟誰需要練習" },
    { num: "03", emoji: "🖨️", title: "列印學習單", desc: "帶回家給家長看，寫成長反思" },
    { num: "04", emoji: "🔄", title: "再玩一次", desc: "試試別的選擇，看結果會不會不一樣" },
  ];
  return (
    <>
      <div className="tape-deck plum" style={{ marginBottom: 18 }}>▸ STEP 07 · NEXT STEPS · 結果出來後</div>
      <h2 className="h-big-deck" style={{ marginBottom: 32 }}>
        看完結果，
        <br />
        <span style={{ color: "var(--plum)" }}>可以做什麼</span>？
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {cards.map((c) => (
          <div key={c.num} className="next-card">
            <div className="lbl">▸ NEXT · {c.num}</div>
            <div className="emoji">{c.emoji}</div>
            <div className="title">{c.title}</div>
            <div className="desc">{c.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function SlideForParents() {
  const items = [
    { emoji: "✨", body: <>MBTI <b>不是人生定型</b>，會隨著年齡和經驗變化</> },
    { emoji: "💖", body: <>問孩子「<b style={{ color: "var(--coral)" }}>你最像哪一段？</b>」勝過「你怎麼是這型？」</> },
    { emoji: "🌱", body: <>把它當作<b>「認識自己的起點」</b>，不是分類他</> },
    { emoji: "📝", body: <>跟孩子聊「<b style={{ color: "var(--coral)" }}>你想練習什麼？</b>」帶出成長型思維</> },
  ];
  return (
    <>
      <div className="tape-deck rose" style={{ marginBottom: 36 }}>▸ FOR · PARENTS · 給家長的話</div>
      <h2 className="h-big-deck" style={{ marginBottom: 24 }}>
        請<span style={{ color: "var(--rose)" }}>家長</span>記得 …
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "3px solid var(--ink)",
              boxShadow: "8px 8px 0 var(--ink)",
              padding: "clamp(16px, 2vw, 24px) clamp(22px, 2.6vw, 36px)",
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{it.emoji}</div>
            <div style={{ fontSize: "clamp(16px, 2vw, 28px)", lineHeight: 1.5 }}>{it.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function SlideEnd() {
  const url = appConfig.productionUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <div className="tape-deck sunny" style={{ marginBottom: 40 }}>▸ END · 謝謝大家</div>
      <div
        className="f-hand"
        style={{
          fontSize: "clamp(28px, 4vw, 56px)",
          color: "var(--coral)",
          transform: "rotate(-2deg)",
          marginBottom: 24,
        }}
      >
        玩得開心嗎？✨
      </div>
      <h1 className="h-mega-deck" style={{ marginBottom: 24 }}>
        你最棒的地方，
        <br />
        就是<span style={{ color: "var(--coral)" }}>你是你</span>。
      </h1>
      <p className="body-xl-deck" style={{ maxWidth: 1200, marginBottom: 28 }}>
        16 型沒有高低，沒有好壞。每一種都是世界的一塊獨特拼圖。
        <br />
        分享給朋友也來玩看看吧 ✦
      </p>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            background: "#fff",
            border: "3px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: "12px 24px",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: "clamp(16px, 1.8vw, 26px)",
          }}
        >
          {url}
        </div>
        <div className="hud-deck" style={{ letterSpacing: 6 }}>▸ THANK YOU · 謝謝</div>
      </div>
    </>
  );
}

const SLIDES: SlideMeta[] = [
  { num: "01 / 10", brand: `${appConfig.teacherName} · ${appConfig.schoolFullName} 資訊教育`, centerY: true, render: SlideOpening },
  { num: "02 / 10", brand: "學習目標", render: SlideGoals },
  { num: "03 / 10", brand: "MBTI 概念", bgNum: "?", render: SlideMBTIIntro },
  { num: "04 / 10", brand: "4 個維度", render: SlideDimensions },
  { num: "05 / 10", brand: "16 型全圖鑑", render: Slide16Types },
  { num: "06 / 10", brand: "開始遊戲", centerY: true, render: SlideStartPlaying },
  { num: "07 / 10", brand: "玩的態度", render: SlideRules },
  { num: "08 / 10", brand: "下一步", render: SlideNextSteps },
  { num: "09 / 10", brand: "給家長", render: SlideForParents },
  { num: "10 / 10", brand: "", centerY: false, render: SlideEnd },
];

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => {
      if (c < SLIDES.length - 1) {
        playSound("pageTurn");
        return c + 1;
      }
      return c;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => {
      if (c > 0) {
        playSound("pageTurn");
        return c - 1;
      }
      return c;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrent(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrent(SLIDES.length - 1);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  }

  useEffect(() => {
    function onFs() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const slide = SLIDES[current];
  const progress = ((current + 1) / SLIDES.length) * 100;

  return (
    <div
      className={`deck-stage ${fullscreen ? "" : "z-30"}`}
      style={{ color: "var(--ink)" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="deck-slide"
        >
          <div className="slide-num">{slide.num}</div>
          {slide.bgNum && <div className="big-bg-num">{slide.bgNum}</div>}
          <div
            className="slide-body-deck"
            style={{
              justifyContent: slide.centerY ? "center" : "flex-start",
            }}
          >
            {slide.render()}
          </div>
          {slide.brand && (
            <div className="slide-brand">
              <b>{slide.brand}</b>　·　校園奇遇記
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 頂部工具列 */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-3 bg-gradient-to-b from-black/40 to-transparent print:hidden"
        style={{ opacity: 0.35, transition: "opacity 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
      >
        <div className="flex items-center gap-2">
          <HomeToButton label="離開投影" />
        </div>
        <div className="text-xs font-mono opacity-90 text-white">
          {current + 1} / {SLIDES.length}
          <span className="ml-3 opacity-60">← → 翻頁 ・ F 全螢幕 ・ Home/End 跳到頭/尾</span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 rounded-full bg-white/30 hover:bg-white/50 text-sm font-bold text-white"
        >
          {fullscreen ? "⛶ 退出全螢幕" : "⛶ 全螢幕 (F)"}
        </button>
      </div>

      {/* 底部進度條 + 控制按鈕 */}
      <div className="absolute bottom-0 left-0 right-0 z-50 print:hidden">
        <div className="h-1 bg-black/20">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, var(--coral), var(--sunny), var(--plum))",
            }}
          />
        </div>
        <div
          className="flex justify-between items-center p-3 bg-gradient-to-t from-black/40 to-transparent"
          style={{ opacity: 0.35, transition: "opacity 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
        >
          <button
            onClick={prev}
            disabled={current === 0}
            className="px-5 py-2 rounded-full bg-white/30 hover:bg-white/50 font-bold disabled:opacity-30 disabled:cursor-not-allowed text-white"
          >
            ← 上一張
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  playSound("tap");
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`第 ${i + 1} 張`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="px-5 py-2 rounded-full bg-white/30 hover:bg-white/50 font-bold disabled:opacity-30 disabled:cursor-not-allowed text-white"
          >
            下一張 →
          </button>
        </div>
      </div>

      {/* 最後一張的「結束 → 回首頁」浮動按鈕 */}
      {current === SLIDES.length - 1 && (
        <SoundLink
          href="/"
          sound="click"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 btn-start"
          style={{ padding: "14px 28px" }}
        >
          🏠 回首頁 開始玩
          <span className="arrow">→</span>
        </SoundLink>
      )}
    </div>
  );
}
