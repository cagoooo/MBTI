import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import BgmController from "@/components/BgmController";
import SiteNav from "@/components/SiteNav";

export default function HomePage() {
  return (
    <div className="container-paper" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <BgmController track="home" />

      <SiteNav active="/" />

      {/* ═══════════════════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 60px", position: "relative" }}>
        {/* Postage stamp in top right (hide on mobile) */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: 60,
            right: 40,
            transform: "rotate(6deg)",
            zIndex: 3,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 10,
              border: "2px dashed var(--line-strong)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: 150,
                height: 180,
                background: "linear-gradient(135deg, #ffd6c0 0%, #ffe9a3 50%, #b8e0d2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                position: "relative",
              }}
            >
              🏫
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "#5a4a2a",
                  letterSpacing: 1,
                }}
              >
                NT$5 · 開學號
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-hand)",
                fontSize: 18,
                marginTop: 8,
                color: "var(--ink)",
              }}
            >
              第一天
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              padding: "4px 8px",
              transform: "rotate(12deg)",
              borderRadius: "50%",
            }}
          >
            EST.
            <br />
            2026
          </div>
        </div>

        {/* Washi tape eyebrow */}
        <div style={{ marginBottom: 24 }}>
          <span className="tape rotate-n2">▸ 不是無聊問卷，是一場校園冒險 ◂</span>
        </div>

        {/* Handwritten kicker */}
        <div
          className="f-hand anim-pop"
          style={{ fontSize: 28, color: "var(--coral)", transform: "rotate(-1.5deg)", marginBottom: 8 }}
        >
          新學期，新故事，新的你 ✦
        </div>

        {/* Big serif title */}
        <h1
          className="f-serif"
          style={{
            fontWeight: 900,
            fontSize: "clamp(54px, 11vw, 168px)",
            lineHeight: 0.92,
            letterSpacing: -2,
            margin: "0 0 12px",
            color: "var(--ink)",
            maxWidth: 900,
          }}
        >
          校園
          <span style={{ color: "var(--coral)", position: "relative" }}>
            奇
            <svg
              style={{ position: "absolute", bottom: -18, left: -4, width: "140%", height: 24 }}
              viewBox="0 0 140 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0 12 Q 30 4, 70 10 T 140 8"
                stroke="var(--coral)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
          遇
          <br />
          記
          <span
            className="f-serif"
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              fontSize: "0.42em",
              marginLeft: 18,
              color: "var(--muted)",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            — MBTI ·
          </span>
        </h1>

        {/* Sub copy */}
        <p
          style={{
            fontSize: 21,
            lineHeight: 1.75,
            color: "var(--ink-soft)",
            maxWidth: 640,
            margin: "28px 0 12px",
          }}
        >
          背起書包走進校園，從<b>開學第一天</b>到<b>校慶大結局</b>。
          <br />
          每個選擇都會分支出你專屬的故事，最後揭曉你的
          <span style={{ background: "linear-gradient(transparent 60%, var(--tape-sunny) 60%)", padding: "0 4px" }}>
            16 型人格
          </span>
          與隱藏校園角色 ✨
        </p>

        {/* CTAs row — mobile 1 欄全寬, ≥sm 自動 wrap */}
        <div className="home-cta-row">
          <SoundLink href="/game" sound="click" className="btn-start">
            <span style={{ fontSize: 26 }}>🎒</span>
            <span>開始冒險</span>
            <span className="arrow">→</span>
            <span className="btn-sticker">10 分鐘</span>
          </SoundLink>
          <SoundLink href="/types" sound="tap" className="btn-secondary">
            <span style={{ fontSize: 22 }}>🔍</span>
            16 型圖鑑
          </SoundLink>
          <SoundLink href="/match" sound="tap" className="btn-secondary">
            <span style={{ fontSize: 22 }}>🤝</span>
            麻吉配對
          </SoundLink>
        </div>

        {/* ─── HUD stats strip ─── */}
        <div
          className="home-stats-strip"
          style={{
            marginTop: 80,
            background: "#fff",
            border: "2.5px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -14,
              left: 24,
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "4px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            ◆ SAVE 01 · CAMPUS.SAV
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCell label="TIME" value="~10" unit="分鐘" fillPct={35} color="" />
            <StatCell label="SCENES" value="30" unit="+ 場景" fillPct={75} color="mint" />
            <StatCell label="BRANCHES" value="×4" unit="條支線" fillPct={50} color="sky" />
            <StatCell label="ENDINGS" value="16" unit="種結局" fillPct={100} color="sunny" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           QUEST LOG · 怎麼玩？
           ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 40px" }}>
        <div className="section-header">
          <div className="diamond"></div>
          <div className="label">Quest Log · 怎麼玩？</div>
          <div className="rule"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end" style={{ marginBottom: 40 }}>
          <h2
            className="f-serif"
            style={{ fontWeight: 900, fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 0.95, margin: 0, letterSpacing: -1 }}
          >
            三個步驟，
            <br />
            <span style={{ color: "var(--coral)" }}>玩成你自己</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.75, margin: 0, maxWidth: 480 }}>
            沒有對錯、沒有評分。跟著直覺走，系統會悄悄統計你在四個維度的傾向，最後拼出你的人格座標 + 校園角色卡。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuestCard idx="01" emoji="📖" title="讀故事" desc="進入校園情境，跟著主角體驗開學週。台詞自動加上注音，低年級也讀得順。" colorVar="--coral" exp={1} barColor="" />
          <QuestCard idx="02" emoji="✋" title="做選擇" desc="每個情境有 3–4 個選項，沒有正解。系統默默記錄你在四個維度的傾向。" colorVar="--mint" exp={2} barColor="mint" />
          <QuestCard idx="03" emoji="✨" title="看結果" desc="16 種結局，搭配優勢分析、成長建議、校園角色卡。可分享、可列印貼牆上。" colorVar="--sunny" exp={3} barColor="sunny" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           4 BRANCHES · 四條支線
           ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 40px" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--mint)" }}></div>
          <div className="label" style={{ color: "var(--mint)" }}>Branch · 四條支線</div>
          <div className="rule" style={{ background: "repeating-linear-gradient(90deg, var(--mint) 0 8px, transparent 8px 16px)" }}></div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 40,
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <h2
            className="f-serif"
            style={{ fontWeight: 900, fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 0.95, margin: 0, letterSpacing: -1 }}
          >
            社團博覽會：
            <br />
            你會走<span style={{ color: "var(--coral)" }}>哪一條路</span>？
          </h2>
          <div className="sticker rotate-2" style={{ background: "var(--paper)", padding: "8px 16px" }}>
            ▶ 第二週 · 重大選擇
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <BranchPolaroid emoji="🏃" cap="校隊組" sub="SPORTS · 汗水與勝負" gradient="linear-gradient(135deg, #ffd9b0, #ff8c5a)" pinClass="" rotateClass="rotate-n2" marginTop={0} />
          <BranchPolaroid emoji="🎨" cap="藝術組" sub="ART · 創作與表達" gradient="linear-gradient(135deg, #ffd6e3, #ff6b9d)" pinClass="sky" rotateClass="rotate-2" marginTop={20} />
          <BranchPolaroid emoji="📚" cap="學術組" sub="SCHOLAR · 好奇與發現" gradient="linear-gradient(135deg, #c6e7f5, #4a9fd4)" pinClass="mint" rotateClass="rotate-n1" marginTop={0} />
          <BranchPolaroid emoji="🤝" cap="友誼組" sub="FRIEND · 陪伴與成長" gradient="linear-gradient(135deg, #bce4d4, #3f8a6e)" pinClass="sunny" rotateClass="rotate-3" marginTop={20} />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            color: "var(--muted)",
            transform: "rotate(-1deg)",
          }}
        >
          你選哪條路，就會看到不一樣的校園日子 →
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           16 TYPES PREVIEW · CHARACTER SELECT
           ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 40px", position: "relative" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--plum)" }}></div>
          <div className="label" style={{ color: "var(--plum)" }}>Character Select · 16 型一覽</div>
          <div className="rule" style={{ background: "repeating-linear-gradient(90deg, var(--plum) 0 8px, transparent 8px 16px)" }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end" style={{ marginBottom: 40 }}>
          <div>
            <div className="f-hand" style={{ fontSize: 28, color: "var(--coral)", transform: "rotate(-2deg)", marginBottom: 6 }}>
              你會解鎖哪一隻？
            </div>
            <h2
              className="f-serif"
              style={{ fontWeight: 900, fontSize: "clamp(48px, 8vw, 80px)", lineHeight: 0.92, margin: 0, letterSpacing: -1 }}
            >
              16 種人格
              <br />
              16 種<span style={{ color: "var(--coral)", fontStyle: "italic" }}>校園身份</span>
            </h2>
          </div>
          <div
            style={{
              background: "#fff",
              padding: "20px 24px",
              border: "2px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
              transform: "rotate(1deg)",
              maxWidth: 380,
            }}
          >
            <div className="f-hand" style={{ fontSize: 20, lineHeight: 1.6 }}>
              「每個人都是世界的一塊獨特拼圖。」
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginTop: 8,
                fontFamily: "var(--font-mono)",
                letterSpacing: 2,
              }}
            >
              — 阿凱老師
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <GroupBand
            code="NT · ANALYST · 分析家"
            emoji="🧠"
            name="分析家"
            tagline="用邏輯與遠見看世界的策略派"
            bg="var(--nt-bg)"
            ink="var(--nt-ink)"
            border="rgba(124,94,194,0.2)"
            types={[
              { code: "INTJ", emoji: "♟️", nick: "戰略家" },
              { code: "INTP", emoji: "🔬", nick: "邏輯學者" },
              { code: "ENTJ", emoji: "👑", nick: "指揮官" },
              { code: "ENTP", emoji: "💡", nick: "辯論家" },
            ]}
          />
          <GroupBand
            code="NF · DIPLOMAT · 外交官"
            emoji="💖"
            name="外交官"
            tagline="重視價值與情感的理想派"
            bg="var(--nf-bg)"
            ink="var(--nf-ink)"
            border="rgba(196,77,117,0.2)"
            types={[
              { code: "INFJ", emoji: "🌙", nick: "提倡者" },
              { code: "INFP", emoji: "🦄", nick: "調停者" },
              { code: "ENFJ", emoji: "🌞", nick: "主人公" },
              { code: "ENFP", emoji: "🎉", nick: "競選者" },
            ]}
          />
          <GroupBand
            code="SJ · SENTINEL · 守護者"
            emoji="🛡️"
            name="守護者"
            tagline="守護秩序與責任的可靠派"
            bg="var(--sj-bg)"
            ink="var(--sj-ink)"
            border="rgba(63,138,110,0.2)"
            types={[
              { code: "ISTJ", emoji: "📋", nick: "物流師" },
              { code: "ISFJ", emoji: "🕊️", nick: "守護者" },
              { code: "ESTJ", emoji: "📊", nick: "總經理" },
              { code: "ESFJ", emoji: "🍰", nick: "執政官" },
            ]}
          />
          <GroupBand
            code="SP · EXPLORER · 探險家"
            emoji="🌈"
            name="探險家"
            tagline="享受當下與行動的自由派"
            bg="var(--sp-bg)"
            ink="var(--sp-ink)"
            border="rgba(168,122,22,0.2)"
            types={[
              { code: "ISTP", emoji: "🔧", nick: "鑑賞家" },
              { code: "ISFP", emoji: "🎨", nick: "探險家" },
              { code: "ESTP", emoji: "⚡", nick: "企業家" },
              { code: "ESFP", emoji: "🎤", nick: "表演者" },
            ]}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link
            href="/types"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--coral)",
              fontWeight: 800,
              fontSize: 18,
              textDecoration: "none",
              padding: "8px 0",
              borderBottom: "2.5px solid var(--coral)",
            }}
          >
            翻開完整 16 型圖鑑 <span style={{ fontSize: 22 }}>→</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           SEL + JOURNEY
           ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 40px" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--rose)" }}></div>
          <div className="label" style={{ color: "var(--rose)" }}>More · 不只是 16 型</div>
          <div className="rule" style={{ background: "repeating-linear-gradient(90deg, var(--rose) 0 8px, transparent 8px 16px)" }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <FeatureCard
            href="/sel"
            tagBg="var(--rose)"
            tagColor="#fff"
            tagText="🌧️ SPECIAL · EPISODE"
            cornerEmoji="🌧️"
            kicker="當情緒下雨的時候 ☂"
            kickerColor="var(--rose)"
            title={<>SEL 逆境<br /><span style={{ color: "var(--rose)" }}>特別篇</span></>}
            desc={<>被誤會、失敗、被排擠 — 你會怎麼接住自己？<br />6 個情境探索你的「情緒因應風格」與專屬工具箱。</>}
            chips={[
              { text: "🌸 表達", bg: "var(--nf-bg)", color: "var(--rose)", border: "var(--rose)" },
              { text: "🧠 思考", bg: "#d6ecf5", color: "var(--sky)", border: "var(--sky)" },
              { text: "🧘 安撫", bg: "var(--sj-bg)", color: "var(--mint)", border: "var(--mint)" },
              { text: "🫂 連結", bg: "var(--sp-bg)", color: "var(--sp-ink)", border: "var(--sp-ink)" },
            ]}
            footer="▸ 約 8 分鐘 · 6 個情境"
            footerColor="var(--rose)"
          />
          <FeatureCard
            href="/journey"
            tagBg="var(--sunny)"
            tagColor="#5a4500"
            tagText="🎒 COURSE · PACK"
            cornerEmoji="🎒"
            kicker="一節輔導課完整跑完 ✦"
            kickerColor="var(--coral)"
            title={<>自我探索<br /><span style={{ color: "var(--coral)" }}>三部曲</span></>}
            desc={<>MBTI（性格）＋ SEL（情緒）＋ 猜朋友（友誼），<br />串成 45 分鐘的完整輔導課，跑完拿綜合報告。</>}
            bg="linear-gradient(135deg, var(--sp-bg) 0%, var(--paper-warm) 100%)"
            stamps={["1", "2", "3"]}
            footer="▸ 45 分鐘 · 3 站任務 · 1 張報告"
            footerColor="var(--coral)"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "var(--paper-warm)",
              border: "1.5px dashed var(--ink)",
              fontSize: 13,
              color: "var(--ink-soft)",
            }}
          >
            💡 SEL（社會情緒學習）基於 <b style={{ marginLeft: 4 }}>CASEL 5 大能力</b> + 兒福聯盟兒少情緒指標設計
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           TEACHER FOLDER
           ═══════════════════════════════════════════════════════════ */}
      <section id="teacher" style={{ padding: "80px 0 40px" }}>
        <div className="section-header">
          <div className="diamond" style={{ background: "var(--sj-ink)" }}></div>
          <div className="label" style={{ color: "var(--sj-ink)" }}>For Teacher · 給老師家長</div>
          <div className="rule" style={{ background: "repeating-linear-gradient(90deg, var(--sj-ink) 0 8px, transparent 8px 16px)" }}></div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "2px solid var(--ink)",
            boxShadow: "8px 8px 0 var(--ink)",
            padding: 0,
            position: "relative",
          }}
        >
          {/* Folder tab */}
          <div
            style={{
              position: "absolute",
              top: -22,
              left: 40,
              background: "#fff",
              padding: "6px 24px 8px",
              border: "2px solid var(--ink)",
              borderBottom: "none",
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 3,
            }}
          >
            📁 TEACHER · TOOLS
          </div>
          {/* Red stamp */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              transform: "rotate(8deg)",
              border: "3px solid var(--coral)",
              color: "var(--coral)",
              padding: "6px 16px",
              fontFamily: "var(--font-mono)",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: 3,
              opacity: 0.85,
            }}
          >
            APPROVED ✓
          </div>

          <div style={{ padding: "48px 40px 36px" }}>
            <h2
              className="f-serif"
              style={{ fontWeight: 900, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1, margin: "0 0 14px", maxWidth: 600 }}
            >
              把 MBTI 變成
              <br />
              <span style={{ color: "var(--coral)" }}>輔導課 / 班會</span>的引導素材
            </h2>
            <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.75, maxWidth: 680, margin: "0 0 32px" }}>
              不必抽象問卷，學生在故事情境裡做選擇就能認識自己的人格傾向。
              適合班級活動、自我認識主題課程、家長日伴讀。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5" style={{ marginBottom: 14 }}>
              <ToolLink href="/teacher/dashboard" emoji="🎓" title="老師 dashboard" sub="一頁看完班級" bg="var(--nt-bg)" color="var(--nt-ink)" />
              <ToolLink href="/teacher/new" emoji="🏠" title="建立班級房間" sub="全班同步玩" bg="var(--nt-bg)" color="var(--nt-ink)" />
              <ToolLink href="/class-stats" emoji="📊" title="班級 MBTI 統計" sub="看全班分佈" bg="var(--nt-bg)" color="var(--nt-ink)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <ToolLink href="/teacher/history" emoji="📈" title="班級活動歷史" sub="過去紀錄 + AI 報告" bg="var(--nf-bg)" color="var(--nf-ink)" />
              <ToolLink href="/join" emoji="🚪" title="學生加入房間" sub="輸入房號" bg="var(--sp-bg)" color="var(--sp-ink)" />
              <ToolLink href="/me" emoji="📓" title="我的學習歷程冊" sub="跨次成長軌跡" bg="var(--sp-bg)" color="var(--sp-ink)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5" style={{ marginTop: 14 }}>
              <ToolLink href="/slides" emoji="🎬" title="10 張教學投影片" sub="備課直接投影" bg="var(--sj-bg)" color="var(--sj-ink)" />
              <ToolLink href="/worksheet" emoji="📋" title="A4 反思學習單" sub="列印給學生" bg="var(--sj-bg)" color="var(--sj-ink)" />
              <ToolLink href="/guess" emoji="🎲" title="猜朋友 MBTI 遊戲" sub="班級互動" bg="var(--sj-bg)" color="var(--sj-ink)" />
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "14px 18px",
                background: "var(--paper-warm)",
                borderLeft: "4px solid var(--coral)",
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              <b>⚠️ 教學提醒</b>　MBTI 為性格傾向參考，並非心理診斷工具。請以開放、好奇的態度引導孩子探索。
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           FINAL CTA
           ═══════════════════════════════════════════════════════════ */}
      <section id="start" style={{ padding: "100px 0 60px", textAlign: "center", position: "relative" }}>
        <div className="hidden md:block">
          <div style={{ position: "absolute", left: 80, top: 60, transform: "rotate(-12deg)", fontSize: 64, opacity: 0.5 }} className="anim-float">🎒</div>
          <div style={{ position: "absolute", right: 120, top: 80, transform: "rotate(15deg)", fontSize: 56, opacity: 0.5, animationDelay: "0.4s" }} className="anim-float">✏️</div>
          <div style={{ position: "absolute", left: 200, bottom: 40, transform: "rotate(8deg)", fontSize: 48, opacity: 0.4, animationDelay: "0.8s" }} className="anim-float">🌈</div>
          <div style={{ position: "absolute", right: 200, bottom: 60, transform: "rotate(-10deg)", fontSize: 52, opacity: 0.5, animationDelay: "1.2s" }} className="anim-float">⚽</div>
        </div>

        <div className="tape rotate-n1" style={{ marginBottom: 32 }}>READY · PLAYER · 01</div>

        <h2
          className="f-serif"
          style={{ fontWeight: 900, fontSize: "clamp(48px, 9vw, 96px)", lineHeight: 0.95, margin: "0 0 24px", letterSpacing: -2 }}
        >
          準備好了，
          <br />
          <span style={{ color: "var(--coral)", position: "relative" }}>
            開始你的奇遇 ?
            <svg
              style={{ position: "absolute", bottom: -12, left: 0, right: 0, width: "100%", height: 18 }}
              viewBox="0 0 600 18"
              preserveAspectRatio="none"
            >
              <path
                d="M0 12 Q 150 2, 300 8 T 600 6"
                stroke="var(--coral)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
        </h2>

        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            position: "relative",
            marginTop: 40,
          }}
        >
          <SoundLink href="/game" sound="click" className="btn-start" style={{ fontSize: 32, padding: "28px 56px" }}>
            <span style={{ fontSize: 32 }}>🎒</span>
            <span>PRESS START</span>
            <span className="arrow">▶</span>
          </SoundLink>
          <div className="hud anim-blink" style={{ marginTop: 8 }}>▷ ▷ INSERT COIN TO CONTINUE ◁ ◁</div>
        </div>
      </section>
    </div>
  );
}

// ─────────── Subcomponents ───────────

function StatCell({
  label,
  value,
  unit,
  fillPct,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  fillPct: number;
  color: string;
}) {
  return (
    <div>
      <div className="hud" style={{ marginBottom: 6 }}>{label}</div>
      <div
        className="f-serif"
        style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, color: "var(--ink)" }}
      >
        {value}
        <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 400, marginLeft: 4 }}>{unit}</span>
      </div>
      <div className="stat-bar" style={{ marginTop: 8 }}>
        <div className={`stat-fill ${color}`} style={{ width: `${fillPct}%` }}></div>
      </div>
    </div>
  );
}

function QuestCard({
  idx,
  emoji,
  title,
  desc,
  colorVar,
  exp,
  barColor,
}: {
  idx: string;
  emoji: string;
  title: string;
  desc: string;
  colorVar: string;
  exp: number;
  barColor: string;
}) {
  return (
    <div
      className="bracket-frame"
      style={{ background: "#fff", border: "1px solid var(--line)", padding: "32px 28px" }}
    >
      <span className="bl"></span><span className="br"></span>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 6 }}>
        <span className="hud hud-coral">QUEST · {idx}</span>
        <span className="hud">{idx === "01" ? "READ()" : idx === "02" ? "CHOOSE()" : "REVEAL()"}</span>
      </div>
      <div
        className="f-serif"
        style={{ fontSize: "clamp(64px, 16vw, 96px)", fontWeight: 900, lineHeight: 0.9, color: `var(${colorVar})`, marginBottom: 8 }}
      >
        {idx}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <span style={{ fontSize: 42 }}>{emoji}</span>
        <h3 style={{ fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 900, margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75, margin: "0 0 16px" }}>{desc}</p>
      <div className="stat-row">
        <span className="stat-label">EXP</span>
        <div className="stat-bar"><div className={`stat-fill ${barColor}`} style={{ width: `${(exp / 3) * 100}%` }}></div></div>
        <span className="stat-value">{exp}/3</span>
      </div>
    </div>
  );
}

function BranchPolaroid({
  emoji,
  cap,
  sub,
  gradient,
  pinClass,
  rotateClass,
  marginTop,
}: {
  emoji: string;
  cap: string;
  sub: string;
  gradient: string;
  pinClass: string;
  rotateClass: string;
  marginTop: number;
}) {
  return (
    <div
      className={`polaroid ${rotateClass}`}
      style={{ width: "100%", padding: "14px 14px 30px", marginTop }}
    >
      <div className={`pin ${pinClass}`}></div>
      <div className="photo" style={{ background: gradient, aspectRatio: 1 }}>{emoji}</div>
      <div className="cap">{cap}</div>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          letterSpacing: 1,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function GroupBand({
  code,
  emoji,
  name,
  tagline,
  bg,
  ink,
  border,
  types,
}: {
  code: string;
  emoji: string;
  name: string;
  tagline: string;
  bg: string;
  ink: string;
  border: string;
  types: Array<{ code: string; emoji: string; nick: string }>;
}) {
  return (
    <div
      style={{
        background: bg,
        padding: "24px 28px",
        border: `1px solid ${border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -16,
          left: 24,
          background: ink,
          color: "#fff",
          padding: "6px 16px",
          fontFamily: "var(--font-mono)",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 3,
          boxShadow: "3px 3px 0 rgba(0,0,0,0.15)",
        }}
      >
        {code}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          margin: "8px 0 18px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 36 }}>{emoji}</span>
        <h3 className="f-serif" style={{ fontSize: 32, margin: 0, fontWeight: 900, color: ink }}>
          {name}
        </h3>
        <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500 }}>{tagline}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {types.map((t) => (
          <Link key={t.code} href={`/types/${t.code}`} className="type-mini">
            <div className="emoji">{t.emoji}</div>
            <div className="code" style={{ color: ink }}>{t.code}</div>
            <div className="nick">{t.nick}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  tagBg,
  tagColor,
  tagText,
  cornerEmoji,
  kicker,
  kickerColor,
  title,
  desc,
  chips,
  stamps,
  bg,
  footer,
  footerColor,
}: {
  href: string;
  tagBg: string;
  tagColor: string;
  tagText: string;
  cornerEmoji: string;
  kicker: string;
  kickerColor: string;
  title: React.ReactNode;
  desc: React.ReactNode;
  chips?: Array<{ text: string; bg: string; color: string; border: string }>;
  stamps?: string[];
  bg?: string;
  footer: string;
  footerColor: string;
}) {
  return (
    <Link
      href={href}
      className="feature-card"
      style={{ background: bg ?? "#fff" }}
    >
      <div
        style={{
          position: "absolute",
          top: -16,
          left: 24,
          background: tagBg,
          color: tagColor,
          padding: "6px 16px",
          fontFamily: "var(--font-mono)",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: 3,
        }}
      >
        {tagText}
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          fontSize: 80,
          opacity: 0.7,
          transform: cornerEmoji === "🌧️" ? "rotate(8deg)" : "rotate(-8deg)",
        }}
      >
        {cornerEmoji}
      </div>

      <div
        className="f-hand"
        style={{ fontSize: 24, color: kickerColor, transform: "rotate(-2deg)", marginBottom: 6, marginTop: 8 }}
      >
        {kicker}
      </div>
      <h3
        className="f-serif"
        style={{
          fontWeight: 900,
          fontSize: "clamp(36px, 5vw, 48px)",
          lineHeight: 0.95,
          margin: "0 0 16px",
          letterSpacing: -1,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75, margin: "0 0 18px", maxWidth: 420 }}>
        {desc}
      </p>

      {chips && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {chips.map((c, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: c.bg,
                color: c.color,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                border: `1.5px solid ${c.border}`,
              }}
            >
              {c.text}
            </span>
          ))}
        </div>
      )}

      {stamps && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {stamps.map((n, i) => {
            const colors = ["var(--coral)", "var(--rose)", "var(--sunny)"];
            const textColors = ["#fff", "#fff", "#5a4500"];
            const rotations = ["-6deg", "4deg", "-3deg"];
            return (
              <span key={n} style={{ display: "contents" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "2.5px solid var(--ink)",
                    background: colors[i],
                    color: textColors[i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 800,
                    boxShadow: "2px 2px 0 var(--ink)",
                    transform: `rotate(${rotations[i]})`,
                  }}
                >
                  {n}
                </div>
                {i < stamps.length - 1 && (
                  <div style={{ width: 32, height: 3, background: "var(--ink)", borderRadius: 2 }}></div>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          borderTop: "1.5px dashed var(--line-strong)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="hud" style={{ color: footerColor }}>{footer}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: footerColor }}>→</span>
      </div>
    </Link>
  );
}

function ToolLink({
  href,
  emoji,
  title,
  sub,
  bg,
  color,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  bg: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="tool-link"
      style={{ background: bg, color, borderColor: color }}
    >
      <span className="emoji">{emoji}</span>
      <div>
        <div className="t">{title}</div>
        <div className="s">{sub}</div>
      </div>
      <span className="arr">→</span>
    </Link>
  );
}
