import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import TeacherLoginButton from "@/components/TeacherLoginButton";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";

interface Props {
  /** 高亮的 nav 項目 (對應 href) */
  active?: string;
  /** 右側 CTA 文字 (預設 ▶ START，結果頁可改 ▶ 再玩一次) */
  ctaLabel?: string;
  /** 右側 CTA 連結 (預設 /game) */
  ctaHref?: string;
}

/**
 * v3.17 新設計站內 nav — 紙感 + HUD 風格
 * Logo VOL · 01 + 5 連結 + 黑底 START CTA
 *
 * 手機: hamburger 按鈕 → MobileMenuDrawer (右側滑入,含全連結 + login + CTA)
 *
 * 用法：在每個頁面 main 容器最頂部放 <SiteNav />
 */
export default function SiteNav({ active = "/", ctaLabel = "▶ START", ctaHref = "/game" }: Props) {
  const links = [
    { href: "/", label: "首頁" },
    { href: "/types", label: "16 型圖鑑" },
    { href: "/sel", label: "🌧️ SEL" },
    { href: "/guess", label: "🎲 猜朋友" },
    { href: "/journey", label: "三部曲" },
    { href: "/teacher/dashboard", label: "👩‍🏫 老師" },
  ];
  const isActive = (href: string) => {
    if (active === href) return true;
    if (href === "/") return false;
    // /teacher/dashboard 連結涵蓋所有 /teacher/* 子頁
    if (href === "/teacher/dashboard" && active.startsWith("/teacher/")) return true;
    return active.startsWith(href);
  };

  return (
    <nav className="nav-design print:hidden">
      <Link href="/" className="nav-brand" style={{ textDecoration: "none", color: "inherit" }}>
        <span className="logo-tag">VOL · 01</span>
        <span className="logo-name">
          校園<span style={{ color: "var(--coral)" }}>奇遇</span>記
        </span>
      </Link>
      {/* Desktop ≥ lg(1024px): 所有連結平鋪 — md 太低,平板會擠到變直書 */}
      <div className="nav-links hidden lg:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={
              isActive(l.href)
                ? { background: "linear-gradient(transparent 60%, var(--tape-sunny) 60%)" }
                : undefined
            }
          >
            {l.label}
          </Link>
        ))}
        <TeacherLoginButton variant="compact" />
        <SoundLink href={ctaHref} sound="click" className="nav-cta">
          {ctaLabel}
        </SoundLink>
      </div>
      {/* < lg: hamburger 開 drawer (drawer 內含所有連結 + login + CTA) */}
      <div className="flex lg:hidden items-center gap-1">
        <MobileMenuDrawer active={active} links={links} ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </div>
    </nav>
  );
}
