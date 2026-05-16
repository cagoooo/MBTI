"use client";

import { useEffect, useState } from "react";
import type { MBTIType } from "@/lib/types";

interface Props {
  type: MBTIType;
  nickname: string;
  oneLiner: string;
  emoji: string;
}

export default function ShareButtons({ type, nickname, oneLiner, emoji }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  // 分享文案（LINE 預覽會直接顯示這段）
  const shareText = `${emoji} 我玩 MBTI 校園奇遇記，結果是「${type} ${nickname}」！\n「${oneLiner}」\n你也來玩玩看 ✨`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = `${shareText}\n${url}`;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2500); } finally { document.body.removeChild(ta); }
    }
  }

  function shareToLine() {
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineShareUrl, "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: `MBTI ${type} ${nickname}`,
        text: shareText,
        url,
      });
    } catch (e) {
      // user cancelled or unsupported — silent
    }
  }

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
      <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
        <span>📸</span> 分享你的結果
      </h3>
      <p className="text-sm text-[var(--color-ink)]/60 mb-5">
        把你的 MBTI 類型秀給同學看，看看誰跟你最合拍！
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* LINE 分享 */}
        <button
          onClick={shareToLine}
          className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#06C755] text-white font-black text-base hover:opacity-95"
        >
          <span className="text-xl">💬</span>
          <span>分享到 LINE</span>
        </button>

        {/* 複製連結 */}
        <button
          onClick={copyLink}
          className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black text-base hover:opacity-95"
        >
          <span className="text-xl">{copied ? "✓" : "🔗"}</span>
          <span>{copied ? "已複製！" : "複製連結"}</span>
        </button>

        {/* 系統分享 (手機可叫起 IG / FB / 訊息) */}
        {canNativeShare ? (
          <button
            onClick={nativeShare}
            className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-ink)] text-white font-black text-base hover:opacity-95"
          >
            <span className="text-xl">📤</span>
            <span>更多分享方式</span>
          </button>
        ) : (
          <a
            href={`mailto:?subject=${encodeURIComponent(`MBTI 校園奇遇記 - ${type} ${nickname}`)}&body=${encodeURIComponent(`${shareText}\n${url}`)}`}
            className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-ink)] text-white font-black text-base hover:opacity-95"
          >
            <span className="text-xl">✉️</span>
            <span>用 Email 分享</span>
          </a>
        )}
      </div>

      <details className="mt-4 text-sm text-[var(--color-ink)]/60">
        <summary className="cursor-pointer hover:text-[var(--color-coral)]">📋 分享文案預覽</summary>
        <pre className="mt-2 p-3 bg-[var(--color-cream)] rounded-xl whitespace-pre-wrap font-sans text-xs leading-relaxed">
          {shareText}
          {"\n"}
          {url || "(網址會在分享時自動帶入)"}
        </pre>
      </details>

      <p className="mt-4 text-xs text-[var(--color-ink)]/50 text-center">
        💡 小提醒：也可以直接截圖整頁分享，連同你的傾向強度圖一起秀出來！
      </p>
    </section>
  );
}
