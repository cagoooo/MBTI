import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import StrengthBars from "@/components/StrengthBars";
import ShareButtons from "@/components/ShareButtons";
import PrintSheet from "@/components/PrintSheet";
import PrintButton from "@/components/PrintButton";
import ResultBadgeMount from "@/components/ResultBadgeMount";
import ResultRevealMount from "@/components/ResultRevealMount";
import SoundLink from "@/components/SoundLink";
import BgmController from "@/components/BgmController";
import RubyText from "@/components/RubyText";
import PretestCompare from "@/components/PretestCompare";
import GeminiAnalysis from "@/components/GeminiAnalysis";
import TypeCelebration from "@/components/TypeCelebration";
import SiteNav from "@/components/SiteNav";

export function generateStaticParams() {
  return ALL_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase();
  if (!ALL_TYPES.includes(upper as MBTIType)) return { title: "MBTI 校園奇遇記" };
  const info = getMBTIInfo(upper as MBTIType);
  return {
    title: `你是 ${upper} · ${info.nickname} ｜ MBTI 校園奇遇記`,
    description: info.oneLiner,
  };
}

const GROUP_OF: Record<string, { key: string; ink: string; bg: string; en: string }> = {
  INTJ: { key: "NT", ink: "var(--nt-ink)", bg: "var(--nt-bg)", en: "ANALYST" },
  INTP: { key: "NT", ink: "var(--nt-ink)", bg: "var(--nt-bg)", en: "ANALYST" },
  ENTJ: { key: "NT", ink: "var(--nt-ink)", bg: "var(--nt-bg)", en: "ANALYST" },
  ENTP: { key: "NT", ink: "var(--nt-ink)", bg: "var(--nt-bg)", en: "ANALYST" },
  INFJ: { key: "NF", ink: "var(--nf-ink)", bg: "var(--nf-bg)", en: "DIPLOMAT" },
  INFP: { key: "NF", ink: "var(--nf-ink)", bg: "var(--nf-bg)", en: "DIPLOMAT" },
  ENFJ: { key: "NF", ink: "var(--nf-ink)", bg: "var(--nf-bg)", en: "DIPLOMAT" },
  ENFP: { key: "NF", ink: "var(--nf-ink)", bg: "var(--nf-bg)", en: "DIPLOMAT" },
  ISTJ: { key: "SJ", ink: "var(--sj-ink)", bg: "var(--sj-bg)", en: "SENTINEL" },
  ISFJ: { key: "SJ", ink: "var(--sj-ink)", bg: "var(--sj-bg)", en: "SENTINEL" },
  ESTJ: { key: "SJ", ink: "var(--sj-ink)", bg: "var(--sj-bg)", en: "SENTINEL" },
  ESFJ: { key: "SJ", ink: "var(--sj-ink)", bg: "var(--sj-bg)", en: "SENTINEL" },
  ISTP: { key: "SP", ink: "var(--sp-ink)", bg: "var(--sp-bg)", en: "EXPLORER" },
  ISFP: { key: "SP", ink: "var(--sp-ink)", bg: "var(--sp-bg)", en: "EXPLORER" },
  ESTP: { key: "SP", ink: "var(--sp-ink)", bg: "var(--sp-bg)", en: "EXPLORER" },
  ESFP: { key: "SP", ink: "var(--sp-ink)", bg: "var(--sp-bg)", en: "EXPLORER" },
};

const TYPE_NO: Record<string, number> = {
  INTJ: 1, INTP: 2, ENTJ: 3, ENTP: 4,
  INFJ: 5, INFP: 6, ENFJ: 7, ENFP: 8,
  ISTJ: 9, ISFJ: 10, ESTJ: 11, ESFJ: 12,
  ISTP: 13, ISFP: 14, ESTP: 15, ESFP: 16,
};

export default async function ResultPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase() as MBTIType;
  if (!ALL_TYPES.includes(upper)) notFound();

  const info = getMBTIInfo(upper);
  const group = GROUP_OF[upper];
  const no = TYPE_NO[upper];

  return (
    <div className="container-paper screen-only" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <BgmController track="result" />
      <PrintSheet info={info} />
      <SiteNav active="/result" ctaLabel="▶ 再玩一次" ctaHref="/game" />

      {/* REVEAL HERO */}
      <section style={{ padding: "60px 0 60px", position: "relative" }}>
        <div className="tape rose rotate-n2" style={{ marginBottom: 24 }}>
          ⚡ QUEST COMPLETE · 結局解鎖
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] gap-8 lg:gap-16 items-start">
          {/* LEFT: big code + nick + dimensions */}
          <div>
            <div className="hud" style={{ color: group.ink, marginBottom: 14 }}>
              ▸ YOUR RESULT · 你的結局是…
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 24,
                marginBottom: 8,
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <h1
                className="f-mono"
                style={{
                  fontWeight: 900,
                  /* mobile cap 從 70px 降到 56px, 上限從 200px 降到 140px 避免 4 字爆寬 */
                  fontSize: "clamp(56px, 13vw, 140px)",
                  letterSpacing: -2,
                  margin: 0,
                  color: group.ink,
                  lineHeight: 0.9,
                  position: "relative",
                }}
              >
                {upper}
              </h1>
              <div
                className="f-hand"
                style={{ fontSize: "clamp(28px, 4vw, 36px)", color: "var(--ink)", transform: "rotate(-3deg)" }}
              >
                就是你！
              </div>
            </div>

            <h2
              className="f-serif"
              style={{
                fontWeight: 900,
                fontSize: "clamp(48px, 8vw, 88px)",
                lineHeight: 0.95,
                margin: "0 0 24px",
                letterSpacing: -1,
              }}
            >
              <RubyText>{info.nickname}</RubyText>
              <span style={{ color: group.ink, fontStyle: "italic" }}>.</span>
            </h2>

            <p
              className="zhuyin-spaced"
              style={{ fontSize: 21, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 540, margin: "0 0 28px" }}
            >
              <RubyText>{info.oneLiner}</RubyText>
            </p>

            <p
              className="zhuyin-spaced"
              style={{ fontSize: 18, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 540, margin: 0 }}
            >
              在校園裡，你是
              <span
                style={{
                  background: `linear-gradient(transparent 60%, ${group.bg} 60%)`,
                  padding: "0 4px",
                  fontWeight: 700,
                }}
              >
                <RubyText>{info.campusRole}</RubyText>
              </span>
              的那位同學。
            </p>

            {/* Dimensions stat bars (StrengthBars 已有功能，wrap 在新設計 frame 內) */}
            <div
              style={{
                background: "#fff",
                border: `2px solid ${group.ink}`,
                padding: 28,
                position: "relative",
                marginTop: 32,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  left: 24,
                  background: group.ink,
                  color: "var(--paper)",
                  padding: "6px 16px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 3,
                }}
              >
                DIMENSIONS · 你的四維座標
              </div>
              <div style={{ marginTop: 12 }}>
                <StrengthBars />
              </div>
            </div>
          </div>

          {/* RIGHT: Character card with celebration animation */}
          <div
            style={{
              background: "#fff",
              padding: 24,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              position: "relative",
              transform: "rotate(-1.5deg)",
              minHeight: 420,
            }}
          >
            <TypeCelebration type={upper} />
            <span
              className="pin"
              style={{
                top: -10,
                width: 20,
                height: 20,
                marginLeft: -10,
                background: `radial-gradient(circle at 30% 30%, #ff8b8b, ${group.ink})`,
              }}
            ></span>
            <div
              style={{
                position: "absolute",
                top: 32,
                right: 32,
                transform: "rotate(12deg)",
                border: `3px solid ${group.ink}`,
                color: group.ink,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: 3,
                opacity: 0.9,
                background: "rgba(255,255,255,0.85)",
                zIndex: 2,
              }}
            >
              RARE ★
            </div>
            <div
              style={{
                aspectRatio: 1,
                background: `linear-gradient(135deg, ${group.bg} 0%, ${group.ink}55 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 200,
                position: "relative",
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1.5px, transparent 2px)",
                  backgroundSize: "14px 14px",
                }}
              ></div>
              <span style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.15))" }}>
                {info.emoji}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div
                className="f-mono"
                style={{ fontWeight: 900, fontSize: 28, letterSpacing: 2, color: group.ink }}
              >
                {upper}
              </div>
              <div className="f-hand" style={{ fontSize: 30 }}>{info.nickname}</div>
            </div>
            <div className="hud" style={{ marginBottom: 14 }}>校園角色 · CAMPUS ROLE</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.5, marginBottom: 18 }}>
              {info.campusRole}
            </div>
            <div
              style={{
                paddingTop: 14,
                borderTop: "1.5px dashed var(--line-strong)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="hud">NO.{String(no).padStart(2, "0")} · {group.key} · {info.nickname}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 課前/課後對照 */}
      <PretestCompare actual={upper} />

      {/* AI 個人化分析 */}
      <GeminiAnalysis type={upper} nickname={info.nickname} />

      {/* Strengths + Watch out */}
      <section style={{ padding: "40px 0" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: group.ink }}></div>
          <div className="label" style={{ color: group.ink }}>Status · 你的能力卡</div>
          <div
            className="rule"
            style={{ background: `repeating-linear-gradient(90deg, ${group.ink} 0 8px, transparent 8px 16px)` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoBlock tabBg="var(--mint)" tabText="+ STRENGTHS · 你的超能力" borderColor="var(--mint)">
            {info.strengths.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i === info.strengths.length - 1 ? "none" : "1.5px dashed var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--mint)",
                    width: 32,
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </InfoBlock>

          <InfoBlock tabBg="var(--sunny)" tabColor="#5a4500" tabText="! WATCH OUT · 要小心" borderColor="var(--sunny)">
            {info.watchOut.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i === info.watchOut.length - 1 ? "none" : "1.5px dashed var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--sunny)",
                    width: 32,
                    flexShrink: 0,
                  }}
                >
                  !
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </InfoBlock>
        </div>
      </section>

      {/* 未來職業 + 名人 */}
      <section style={{ padding: "40px 0" }}>
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
          <InfoBlock tabBg="var(--plum)" tabText="↗ FUTURE · 未來的你，可能是…" borderColor="var(--plum)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
              {info.futureJobs.map((j) => (
                <span
                  key={j}
                  className="type-pill"
                  style={{ borderColor: "var(--plum)", boxShadow: "3px 3px 0 var(--plum)" }}
                >
                  {j}
                </span>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1.5px dashed var(--line-strong)",
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              ※ 這些是傾向，不是規定。你的人生你做主 ✦
            </div>
          </InfoBlock>

          <InfoBlock tabBg="var(--sky)" tabText="★ 你的同型名人" borderColor="var(--sky)">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {info.famous.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "10px 14px",
                    background: "var(--paper-warm)",
                    borderLeft: "4px solid var(--sky)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>⭐</span>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{f}</div>
                </div>
              ))}
            </div>
          </InfoBlock>
        </div>
      </section>

      {/* 配對 */}
      <section style={{ padding: "40px 0" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--coral)" }}></div>
          <div className="label">Party · 你的麻吉配對</div>
          <div className="rule"></div>
        </div>

        <h2
          className="f-serif"
          style={{ fontWeight: 900, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1, margin: "0 0 28px" }}
        >
          在校園裡，你跟<span style={{ color: "var(--coral)" }}>這些人</span>最有火花
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoBlock tabBg="var(--coral)" tabText="💞 BEST MATCH · 最合拍" borderColor="var(--coral)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {info.bestMatches.map((m) => {
                const mi = getMBTIInfo(m);
                const mg = GROUP_OF[m];
                return (
                  <Link
                    key={m}
                    href={`/types/${m}`}
                    className="type-pill"
                    style={{ color: mg.ink, textDecoration: "none" }}
                  >
                    <span style={{ fontSize: 18 }}>{mi.emoji}</span> {m}
                    <span style={{ fontFamily: "var(--font-hand)", fontWeight: 400 }}> {mi.nickname}</span>
                  </Link>
                );
              })}
            </div>
          </InfoBlock>

          <InfoBlock tabBg="var(--sunny)" tabColor="#5a4500" tabText="🌱 GROWTH · 需要練習的人" borderColor="var(--sunny)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {info.growthPartners.map((m) => {
                const mi = getMBTIInfo(m);
                const mg = GROUP_OF[m];
                return (
                  <Link
                    key={m}
                    href={`/types/${m}`}
                    className="type-pill"
                    style={{ color: mg.ink, textDecoration: "none" }}
                  >
                    <span style={{ fontSize: 18 }}>{mi.emoji}</span> {m}
                    <span style={{ fontFamily: "var(--font-hand)", fontWeight: 400 }}> {mi.nickname}</span>
                  </Link>
                );
              })}
            </div>
          </InfoBlock>
        </div>
      </section>

      {/* 徽章牆 */}
      <section style={{ padding: "40px 0" }}>
        <ResultBadgeMount type={upper} />
      </section>

      {/* 分享 */}
      <section style={{ padding: "20px 0" }}>
        <ShareButtons type={upper} nickname={info.nickname} oneLiner={info.oneLiner} emoji={info.emoji} />
      </section>

      {/* 進入時播煙火音效 */}
      <ResultRevealMount />

      {/* 給老師家長 */}
      <section style={{ padding: "20px 0 40px" }}>
        <div
          className="card-paper"
          style={{
            background: "var(--paper-warm)",
            borderLeft: "4px solid var(--coral)",
            padding: "24px 28px",
            boxShadow: "none",
          }}
        >
          <div className="hud" style={{ color: "var(--coral)", marginBottom: 10 }}>
            💌 FOR · TEACHER · 給老師家長
          </div>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.75, fontSize: 16, margin: 0 }}>
            {info.tipForGrowth}
          </p>
        </div>
      </section>

      {/* ACTION BAR */}
      <section style={{ padding: "40px 0 80px" }}>
        <div
          style={{
            background: "#fff",
            border: "2.5px solid var(--ink)",
            boxShadow: "8px 8px 0 var(--ink)",
            padding: "36px 40px",
            position: "relative",
          }}
        >
          <div
            className="tape sunny rotate-n1"
            style={{ position: "absolute", top: -20, left: 32 }}
          >
            END OF QUEST · 下一步
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center" style={{ marginTop: 8 }}>
            <div>
              <h3
                className="f-serif"
                style={{ fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1, margin: "0 0 8px" }}
              >
                把這張角色卡<span style={{ color: "var(--coral)" }}>帶回家</span> ✦
              </h3>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
                分享給朋友比一比，列印出來貼牆上，或再玩一次解鎖不同支線的結局。
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <PrintButton />
              <SoundLink
                href="/game"
                sound="click"
                className="btn-start"
                style={{ fontSize: 18, padding: "16px 24px", boxShadow: "5px 5px 0 var(--ink)" }}
              >
                <span style={{ fontSize: 22 }}>🔄</span>
                <span>換一條支線再玩</span>
              </SoundLink>
              <SoundLink
                href="/types"
                sound="tap"
                className="btn-secondary"
                style={{ fontSize: 16, padding: "14px 24px" }}
              >
                <span style={{ fontSize: 20 }}>🔍</span> 看其他 15 型
              </SoundLink>
            </div>
          </div>
        </div>
      </section>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>
        ⚠️ MBTI 為性格傾向參考，僅供自我探索，並非心理診斷工具。
      </p>
    </div>
  );
}

function InfoBlock({
  tabBg,
  tabColor = "var(--paper)",
  tabText,
  borderColor,
  children,
}: {
  tabBg: string;
  tabColor?: string;
  tabText: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${borderColor}`,
        padding: 28,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -16,
          left: 24,
          background: tabBg,
          color: tabColor,
          padding: "6px 16px",
          fontFamily: "var(--font-mono)",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: 3,
        }}
      >
        {tabText}
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
