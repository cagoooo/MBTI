"use client";

import { useEffect, useState } from "react";
import { getZhuyin, isCjk } from "@/lib/zhuyin";
import { isZhuyinOn } from "@/lib/settings";

interface Props {
  children: string;
  /** 是否強制顯示注音（不受全域 toggle 控制） */
  always?: boolean;
}

/**
 * 中文字自動加注音（ruby 標籤）
 *
 * 規則：
 *   - 全域 isZhuyinOn() 為 true 才作用（除非 always 強制）
 *   - 逐字判斷：是 CJK 漢字才查 zhuyin map 套 ruby
 *   - 非漢字（標點、英文、數字、emoji）保持原樣
 *   - 找不到的字（map 沒有）保持原樣顯示
 *
 * 注意：傳入必須是 string，不能是 JSX。
 *       上層若有 markup 須拆開分別包。
 */
export default function RubyText({ children, always = false }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function refresh() {
      setEnabled(always || isZhuyinOn());
    }
    refresh();
    window.addEventListener("storage", refresh);
    // 1.5s polling for same-tab setting change
    const iv = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(iv);
    };
  }, [always]);

  // SSR / 還沒 mount / 沒開 → 直接吐原字串避免 hydration mismatch
  if (!mounted || !enabled) {
    return <>{children}</>;
  }

  // 逐字渲染
  const parts: React.ReactNode[] = [];
  const text = children;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isCjk(ch)) {
      const z = getZhuyin(ch);
      if (z) {
        parts.push(
          <ruby key={i} className="ruby-char">
            {ch}
            <rt className="ruby-rt">{z}</rt>
          </ruby>,
        );
        continue;
      }
    }
    parts.push(<span key={i}>{ch}</span>);
  }
  return <>{parts}</>;
}
