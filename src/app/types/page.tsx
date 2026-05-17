import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import { MBTI_GROUPS, getMBTIInfo } from "@/lib/mbti";
import BgmController from "@/components/BgmController";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  title: "16 型圖鑑 · MBTI 校園奇遇記",
  description: "完整的 16 型 MBTI 人格圖鑑 — 每種類型的特質、優勢、適合職業與相處之道。",
};

const GROUP_TOKENS: Record<string, { ink: string; bg: string }> = {
  NT: { ink: "var(--nt-ink)", bg: "var(--nt-bg)" },
  NF: { ink: "var(--nf-ink)", bg: "var(--nf-bg)" },
  SJ: { ink: "var(--sj-ink)", bg: "var(--sj-bg)" },
  SP: { ink: "var(--sp-ink)", bg: "var(--sp-bg)" },
};
const GROUP_EN: Record<string, string> = {
  NT: "ANALYST",
  NF: "DIPLOMAT",
  SJ: "SENTINEL",
  SP: "EXPLORER",
};
// 給每張卡一點輕微的旋轉，讓整體有手帳貼貼紙感
function jitter(i: number) {
  const r = ((i * 17) % 7 - 3) * 0.5;
  return r;
}

export default function TypesIndexPage() {
  // 計算每型在全部 16 個裡的編號 (NO.01 ~ NO.16)
  let counter = 0;
  return (
    <div className="container-paper" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <BgmController track="home" />
      <SiteNav active="/types" />

      {/* TITLE */}
      <section style={{ padding: "60px 0 40px" }}>
        <Link
          href="/"
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
            marginBottom: 32,
          }}
        >
          ← 回主頁
        </Link>

        <div className="tape rotate-n1" style={{ marginBottom: 20 }}>CHAPTER 02 · 16 種人格</div>

        <div
          className="f-hand"
          style={{ fontSize: 32, color: "var(--coral)", transform: "rotate(-2deg)", marginBottom: 4 }}
        >
          你會是哪一塊拼圖？✦
        </div>

        <h1
          className="f-serif"
          style={{
            fontWeight: 900,
            fontSize: "clamp(54px, 11vw, 140px)",
            lineHeight: 0.92,
            letterSpacing: -2,
            margin: "0 0 24px",
          }}
        >
          16 型<br />
          <span style={{ color: "var(--coral)" }}>校園</span>全圖鑑
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "var(--ink-soft)",
            maxWidth: 680,
            margin: "0 0 36px",
          }}
        >
          每種人格都是世界的一塊獨特拼圖，沒有高低、沒有好壞。
          <br />
          點下任何一張卡片，看完整介紹、優勢、成長建議、與校園角色設定。
        </p>

        <div className="hud" style={{ marginBottom: 40 }}>
          ▸ 共 16 種人格 · 4 大群組
        </div>
      </section>

      {/* TYPE GRID */}
      <main style={{ paddingBottom: 80 }}>
        {MBTI_GROUPS.map((g) => {
          const token = GROUP_TOKENS[g.key];
          return (
            <div key={g.key} style={{ marginBottom: 64 }} id={g.key}>
              {/* Group title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 18,
                  margin: "0 0 24px",
                  paddingBottom: 16,
                  borderBottom: `2px solid ${token.ink}`,
                  flexWrap: "wrap",
                  color: token.ink,
                }}
              >
                <span style={{ fontSize: 48 }}>{g.emoji}</span>
                <h2
                  className="f-serif"
                  style={{ fontWeight: 900, fontSize: "clamp(36px, 5vw, 54px)", margin: 0, lineHeight: 1 }}
                >
                  {g.name.replace(/\s*\([^)]*\)$/, "")}
                </h2>
                <span className="hud" style={{ color: token.ink, opacity: 0.6 }}>
                  {GROUP_EN[g.key]} · {g.key}
                </span>
                <span
                  style={{ fontSize: 14, color: "var(--ink-soft)", marginLeft: "auto" }}
                >
                  {g.desc}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {g.types.map((t) => {
                  counter++;
                  const info = getMBTIInfo(t);
                  const no = counter;
                  return (
                    <TypeCard
                      key={t}
                      type={t}
                      no={no}
                      emoji={info.emoji}
                      nick={info.nickname}
                      role={info.campusRole}
                      line={info.oneLiner}
                      ink={token.ink}
                      bg={token.bg}
                      rotateDeg={jitter(no)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* BOTTOM CTA */}
      <section
        style={{
          padding: "40px 0 80px",
          textAlign: "center",
          borderTop: "2px solid var(--ink)",
          marginTop: 40,
        }}
      >
        <div className="tape sunny rotate-2" style={{ marginBottom: 24 }}>想知道自己是哪一型？</div>
        <h2
          className="f-serif"
          style={{ fontWeight: 900, fontSize: "clamp(40px, 7vw, 64px)", lineHeight: 0.95, margin: "0 0 32px" }}
        >
          花 10 分鐘玩一場，
          <br />
          <span style={{ color: "var(--coral)" }}>親自解鎖你的結局</span>
        </h2>
        <SoundLink href="/game" sound="click" className="btn-start" style={{ fontSize: 24, padding: "24px 44px" }}>
          <span style={{ fontSize: 26 }}>🎒</span>
          <span>開始冒險</span>
          <span className="arrow">→</span>
        </SoundLink>
      </section>
    </div>
  );
}

// ────────── Type card (mini collectible) ──────────
function TypeCard({
  type,
  no,
  emoji,
  nick,
  role,
  line,
  ink,
  bg,
  rotateDeg,
}: {
  type: string;
  no: number;
  emoji: string;
  nick: string;
  role: string;
  line: string;
  ink: string;
  bg: string;
  rotateDeg: number;
}) {
  return (
    <SoundLink
      href={`/types/${type}`}
      sound="pop"
      style={{
        background: "#fff",
        padding: "18px 18px 22px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        textDecoration: "none",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transform: `rotate(${rotateDeg}deg)`,
      }}
      className="type-collectible"
    >
      <span
        className="pin"
        style={{
          top: -10,
          width: 18,
          height: 18,
          marginLeft: -9,
          background: `radial-gradient(circle at 30% 30%, ${ink}aa, ${ink})`,
        }}
      ></span>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: 1.5,
          color: "var(--muted)",
        }}
      >
        NO.{String(no).padStart(2, "0")}
      </div>
      <div
        style={{
          aspectRatio: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 84,
          marginBottom: 14,
          border: "1px solid rgba(0,0,0,0.05)",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${bg} 0%, ${ink}33 100%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)",
            backgroundSize: "8px 8px",
          }}
        ></div>
        <span
          style={{
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
          }}
        >
          {emoji}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: 1.5,
            lineHeight: 1,
            color: ink,
          }}
        >
          {type}
        </div>
        <div
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            lineHeight: 1,
            marginLeft: "auto",
          }}
        >
          {nick}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 8,
          fontFamily: "var(--font-mono)",
          letterSpacing: 1.5,
        }}
      >
        ▸ {role}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
          marginTop: 10,
          minHeight: 42,
        }}
      >
        {line}
      </p>
      <div
        style={{
          marginTop: 14,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 2,
          color: "var(--coral)",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>看完整介紹</span>
        <span>→</span>
      </div>
    </SoundLink>
  );
}
