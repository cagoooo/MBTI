import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import { notFound } from "next/navigation";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import BgmController from "@/components/BgmController";
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
    title: `${upper} · ${info.nickname} · 完整介紹 ｜ MBTI 校園奇遇記`,
    description: info.oneLiner,
  };
}

// 群組查找
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

export default async function TypeDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase() as MBTIType;
  if (!ALL_TYPES.includes(upper)) notFound();

  const info = getMBTIInfo(upper);
  const group = GROUP_OF[upper];
  const no = TYPE_NO[upper];

  return (
    <div className="container-paper" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <BgmController track="home" />
      <SiteNav active="/types" ctaLabel="▶ 玩故事" ctaHref="/game" />

      {/* HERO with character card */}
      <section style={{ padding: "60px 0 60px" }}>
        <Link
          href="/types"
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
            marginBottom: 24,
          }}
        >
          ← 回 16 型總覽
        </Link>

        <div className="tape rotate-n2" style={{ marginBottom: 24 }}>
          CHAPTER 02 · 型別介紹
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">
          {/* LEFT: code + nick + description */}
          <div>
            <div className="hud" style={{ color: group.ink, marginBottom: 14 }}>
              ▸ {group.en} · {group.key} · 圖鑑 NO.{String(no).padStart(2, "0")}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 8, flexWrap: "wrap" }}>
              <h1
                className="f-mono"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(70px, 14vw, 200px)",
                  letterSpacing: -2,
                  margin: 0,
                  color: group.ink,
                  lineHeight: 0.9,
                }}
              >
                {upper}
              </h1>
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
              {info.nickname}
              <span style={{ color: group.ink, fontStyle: "italic" }}>.</span>
            </h2>

            <p style={{ fontSize: 21, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 540, margin: "0 0 28px" }}>
              {info.oneLiner}
            </p>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 540, margin: 0 }}>
              在校園裡，你是
              <span
                style={{
                  background: `linear-gradient(transparent 60%, ${group.bg} 60%)`,
                  padding: "0 4px",
                  fontWeight: 700,
                }}
              >
                {info.campusRole}
              </span>
              的那位同學。
            </p>
          </div>

          {/* RIGHT: character card */}
          <div
            style={{
              background: "#fff",
              padding: 24,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              position: "relative",
              transform: "rotate(-1.5deg)",
            }}
          >
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

      {/* 描述細節 */}
      <section style={{ padding: "40px 0" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: group.ink }}></div>
          <div className="label" style={{ color: group.ink }}>About · 個性介紹</div>
          <div
            className="rule"
            style={{ background: `repeating-linear-gradient(90deg, ${group.ink} 0 8px, transparent 8px 16px)` }}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {info.description.map((p, i) => (
            <div
              key={i}
              className="card-paper zhuyin-spaced"
              style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink-soft)" }}
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* Strengths + Watch out */}
      <section style={{ padding: "40px 0" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--coral)" }}></div>
          <div className="label">Status · 能力卡</div>
          <div className="rule"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoBlock tabBg="var(--mint)" tabText="+ STRENGTHS · 你的超能力" borderColor="var(--mint)">
            {info.strengths.map((s, i) => (
              <div
                key={i}
                className="feat-item"
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

      {/* Future jobs + Famous */}
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
      <section style={{ padding: "40px 0 60px" }}>
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

      {/* CTA */}
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
            想玩看看自己是哪型？
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center" style={{ marginTop: 8 }}>
            <div>
              <h3
                className="f-serif"
                style={{ fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1, margin: "0 0 8px" }}
              >
                花 10 分鐘玩一場 <br className="md:hidden" />
                <span style={{ color: "var(--coral)" }}>親自驗證看看</span> ✦
              </h3>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
                MBTI 校園奇遇記用情境選擇代替問卷，國小生也讀得懂。
              </p>
            </div>
            <SoundLink
              href="/game"
              sound="click"
              className="btn-start"
              style={{ fontSize: 18, padding: "18px 28px" }}
            >
              <span style={{ fontSize: 22 }}>🎒</span>
              <span>開始冒險</span>
              <span className="arrow">→</span>
            </SoundLink>
          </div>
        </div>
      </section>
    </div>
  );
}

// ────────── 子元件 ──────────

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
