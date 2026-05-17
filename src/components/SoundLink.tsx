"use client";

import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type ReactNode, forwardRef } from "react";
import { playSound } from "@/lib/sound";

type SoundKind = "tap" | "pop" | "click" | "whoosh" | "coin";

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
  /** 預設 'whoosh' (page navigation 過場感) */
  sound?: SoundKind;
  children?: ReactNode;
};

/**
 * 包過 next/link，點擊時自動播 navigation 音效。
 * 預設 'whoosh' — 適合 page-to-page 跳轉。
 * 重要 CTA 用 'click'，輕量 nav 用 'tap'。
 */
const SoundLink = forwardRef<HTMLAnchorElement, Props>(function SoundLink(
  { sound = "whoosh", onClick, children, ...rest },
  ref,
) {
  return (
    <Link
      {...rest}
      ref={ref}
      onClick={(e) => {
        try {
          playSound(sound);
        } catch {}
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
});

export default SoundLink;
