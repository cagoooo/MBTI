"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { playSound } from "@/lib/sound";

type SoundKind = "tap" | "pop" | "click" | "whoosh" | "coin" | "toggleOn" | "toggleOff" | "unlock";

interface SoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 預設 'tap' (輕點)。重要動作用 'click'、Q 彈感用 'pop'、確認 / 完成用 'coin' */
  sound?: SoundKind;
}

/**
 * 包過 <button>，點擊時自動播音效。
 * 用法：
 *   <SoundButton onClick={...} sound="pop">確定</SoundButton>
 *   <SoundButton onClick={...}>輕點預設 tap</SoundButton>
 */
const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(function SoundButton(
  { sound = "tap", onClick, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      onClick={(e) => {
        // 播音效（不擋 onClick handler）
        try {
          playSound(sound);
        } catch {
          // ignore 音效失敗
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default SoundButton;
