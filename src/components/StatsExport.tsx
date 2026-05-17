"use client";

import { useState } from "react";
import type { ClassStats } from "@/lib/parse-class";
import { ALL_TYPES } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import SoundButton from "@/components/SoundButton";

interface Props {
  stats: ClassStats;
  className?: string;
}

function buildTextReport(stats: ClassStats, label: string): string {
  const date = new Date().toLocaleDateString("zh-TW");
  const lines: string[] = [];
  lines.push(`📊 ${label || "全班"} MBTI 分布報告`);
  lines.push(`日期：${date}`);
  lines.push(`總人數：${stats.total} 位`);
  lines.push("");
  lines.push("【16 型分布 (依人數排序)】");
  const sorted = ALL_TYPES.slice().sort((a, b) => stats.perType[b] - stats.perType[a]);
  sorted.forEach((t) => {
    const info = getMBTIInfo(t);
    const c = stats.perType[t];
    if (c > 0) {
      const bar = "█".repeat(Math.min(c, 20));
      lines.push(`  ${t} ${info.nickname.padEnd(6, "　")} ${c} 位 ${bar}`);
    }
  });
  lines.push("");
  lines.push("【沒出現的型】" + (stats.missingTypes.length > 0 ? stats.missingTypes.join(", ") : "(全部都有！)"));
  lines.push("");
  lines.push("【四大群分布】");
  stats.perGroup.forEach((g) => {
    const pct = stats.total === 0 ? 0 : Math.round((g.count / stats.total) * 100);
    lines.push(`  ${g.name}: ${g.count} 位 (${pct}%)`);
  });
  lines.push("");
  lines.push("【四軸班級平衡】");
  lines.push(`  外向 E ${stats.axes.E} ↔ 內向 I ${stats.axes.I}`);
  lines.push(`  實感 S ${stats.axes.S} ↔ 直覺 N ${stats.axes.N}`);
  lines.push(`  思考 T ${stats.axes.T} ↔ 情感 F ${stats.axes.F}`);
  lines.push(`  判斷 J ${stats.axes.J} ↔ 感知 P ${stats.axes.P}`);
  if (stats.mostCommon) {
    lines.push("");
    lines.push(`👑 人數最多：${stats.mostCommon.type} ${getMBTIInfo(stats.mostCommon.type).nickname} (${stats.mostCommon.count} 位)`);
  }
  if (stats.rarest && stats.rarest.type !== stats.mostCommon?.type) {
    lines.push(`🌟 最稀有：${stats.rarest.type} ${getMBTIInfo(stats.rarest.type).nickname} (${stats.rarest.count} 位)`);
  }
  lines.push("");
  lines.push("---");
  lines.push("製作工具：MBTI 校園奇遇記 https://cagoooo.github.io/MBTI/");
  lines.push("by 阿凱老師 @ 桃園市龍潭區石門國小");
  return lines.join("\n");
}

export default function StatsExport({ stats, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildTextReport(stats, className);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2500); } finally { document.body.removeChild(ta); }
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 print-hide">
      <h3 className="text-xl font-black mb-3 flex items-center gap-2">
        <span>📥</span> 匯出 / 保存
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SoundButton
          sound="coin"
          onClick={handlePrint}
          className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-500 text-white font-black hover:bg-violet-600"
        >
          <span className="text-xl">🖨️</span>
          <span>列印 / 另存 PDF</span>
        </SoundButton>
        <SoundButton
          sound="pop"
          onClick={handleCopy}
          className="btn-3d flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 text-white font-black hover:bg-sky-600"
        >
          <span className="text-xl">{copied ? "✓" : "📋"}</span>
          <span>{copied ? "已複製文字版！" : "複製文字版"}</span>
        </SoundButton>
      </div>
      <details className="mt-3 text-sm text-[var(--color-ink)]/60">
        <summary className="cursor-pointer hover:text-[var(--color-coral)]">💡 想要 PNG 圖檔？</summary>
        <p className="mt-2 leading-relaxed">
          按「列印 / 另存 PDF」後在列印視窗的「目的地」選「另存為 PDF」，存下來再用任何工具截圖；
          或用瀏覽器內建的截圖工具（Chrome: <kbd>Ctrl+Shift+P</kbd> → Capture full size screenshot）。
        </p>
      </details>
    </section>
  );
}
