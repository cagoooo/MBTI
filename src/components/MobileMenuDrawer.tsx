"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import TeacherLoginButton from "@/components/TeacherLoginButton";
import { playSound } from "@/lib/sound";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  active: string;
  links: NavLink[];
  ctaHref: string;
  ctaLabel: string;
}

/**
 * 手機端側拉選單 (drawer)
 *
 * - SiteNav 在 ≥ md 才顯示所有連結；< md 由本元件提供 hamburger 按鈕 + slide-from-right drawer
 * - 內含全部主連結 + Teacher login + CTA
 * - 點背景遮罩 / 按 ESC / 點任一連結都關閉
 * - body scroll lock during open
 */
export default function MobileMenuDrawer({ active, links, ctaHref, ctaLabel }: Props) {
  const [open, setOpen] = useState(false);

  // ESC 關 + body scroll lock
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open]);

  const isActive = (href: string) => {
    if (active === href) return true;
    if (href === "/") return false;
    if (href === "/teacher/dashboard" && active.startsWith("/teacher/")) return true;
    return active.startsWith(href);
  };

  return (
    <>
      {/* Hamburger button — 只在 mobile 顯示 */}
      <button
        type="button"
        onClick={() => {
          playSound("tap");
          setOpen(true);
        }}
        className="md:hidden tap-target"
        aria-label="開啟主選單"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          background: "transparent",
          border: "2px solid var(--ink)",
          borderRadius: 0,
          cursor: "pointer",
          marginRight: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 20,
            height: 14,
            position: "relative",
          }}
        >
          <span style={hamburgerLine(0)} />
          <span style={hamburgerLine(6)} />
          <span style={hamburgerLine(12)} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.45)",
                zIndex: 80,
              }}
            />

            {/* Drawer 本體 — 右側滑入 */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="主選單"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(86vw, 360px)",
                background: "var(--paper)",
                borderLeft: "2.5px solid var(--ink)",
                boxShadow: "-8px 0 0 var(--ink)",
                zIndex: 90,
                display: "flex",
                flexDirection: "column",
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px 16px",
                  borderBottom: "1.5px dashed var(--line-strong)",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: 3,
                      color: "var(--muted)",
                      fontWeight: 700,
                    }}
                  >
                    VOL · 01
                  </div>
                  <div
                    className="f-serif"
                    style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}
                  >
                    校園<span style={{ color: "var(--coral)" }}>奇遇</span>記
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="關閉選單"
                  className="tap-target"
                  style={{
                    width: 44,
                    height: 44,
                    background: "transparent",
                    border: "none",
                    fontSize: 28,
                    fontWeight: 900,
                    cursor: "pointer",
                    color: "var(--ink)",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* 連結列表 */}
              <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
                {links.map((l) => {
                  const a = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => {
                        playSound("tap");
                        setOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 16px",
                        fontSize: 17,
                        fontWeight: 800,
                        color: "var(--ink)",
                        textDecoration: "none",
                        background: a ? "var(--tape-sunny)" : "transparent",
                        borderRadius: 8,
                        marginBottom: 4,
                        minHeight: 48,
                      }}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              {/* 底部 — Teacher login + CTA */}
              <div
                style={{
                  padding: "12px 20px 0",
                  borderTop: "1.5px dashed var(--line-strong)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <TeacherLoginButton variant="compact" />
                </div>
                <Link
                  href={ctaHref}
                  onClick={() => {
                    playSound("click");
                    setOpen(false);
                  }}
                  className="nav-cta"
                  style={{
                    textAlign: "center",
                    padding: "14px 20px",
                    fontSize: 16,
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ctaLabel}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function hamburgerLine(top: number): React.CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top,
    width: 20,
    height: 2.5,
    background: "var(--ink)",
    borderRadius: 1,
  };
}
