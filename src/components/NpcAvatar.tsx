"use client";

/**
 * NPC SVG 大頭貼 — 取代純 emoji，提升角色辨識度
 *
 * 設計原則:
 *   - 純 SVG 內聯，零外部資源 (1KB/角色 vs 7KB PNG)
 *   - 用 currentColor + CSS var 上色，可以套主題
 *   - 每個角色獨特：髮型 + 配件 + 表情，一眼能認
 *   - 不像真人，是 Q 版色塊插畫
 *
 * 8 個主角:
 *   小芸 ENFP 🌸 黃馬尾活潑
 *   阿哲 INTJ 🤓 眼鏡冷靜
 *   小傑 ESTP ⚡ 短髮運動
 *   雅雯 INFJ 🌙 長黑髮溫柔
 *   宇航 ISFP 🎨 戴帽創作
 *   凱莉 ENTJ 👑 馬尾氣勢
 *   小宇 INTP 📚 西瓜頭書呆
 *   婷婷 ESFJ 🍰 包包頭熱情
 */

import { useId, type ReactElement } from "react";

interface Props {
  name: string;
  size?: number;
  className?: string;
}

type NpcKey =
  | "小芸"
  | "阿哲"
  | "小傑"
  | "雅雯"
  | "宇航"
  | "凱莉"
  | "小宇"
  | "婷婷";

const KNOWN: NpcKey[] = ["小芸", "阿哲", "小傑", "雅雯", "宇航", "凱莉", "小宇", "婷婷"];

export default function NpcAvatar({ name, size = 64, className = "" }: Props) {
  const id = useId();
  if (!KNOWN.includes(name as NpcKey)) {
    // 不在主角列表內，退回簡易圓圈 + 第一字
    return (
      <div
        className={`rounded-full bg-[var(--color-cream)] border-2 border-white flex items-center justify-center font-black text-[var(--color-coral)] ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name[0] ?? "?"}
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label={name}
    >
      <defs>
        {/* 共用：臉的漸層 */}
        <radialGradient id={`face-${id}`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#fff1e0" />
          <stop offset="100%" stopColor="#fcd9b3" />
        </radialGradient>
      </defs>
      {renderNpc(name as NpcKey, id)}
    </svg>
  );
}

function renderNpc(name: NpcKey, id: string): ReactElement {
  switch (name) {
    case "小芸": // ENFP 黃馬尾活潑
      return (
        <g>
          {/* 馬尾 */}
          <ellipse cx="76" cy="48" rx="10" ry="20" fill="#fbbf24" />
          {/* 頭髮頂 */}
          <path d="M 22,44 Q 22,18 50,18 Q 78,18 78,44 L 78,55 Q 60,40 50,42 Q 40,40 22,55 Z" fill="#fbbf24" />
          {/* 臉 */}
          <ellipse cx="50" cy="55" rx="26" ry="28" fill={`url(#face-${id})`} />
          {/* 瀏海 */}
          <path d="M 25,42 Q 32,32 50,34 Q 68,32 75,42 Q 65,42 50,44 Q 35,42 25,42 Z" fill="#f59e0b" />
          {/* 眼睛 (彎彎笑眼) */}
          <path d="M 38,52 Q 41,49 44,52" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 56,52 Q 59,49 62,52" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 腮紅 */}
          <circle cx="36" cy="62" r="3.5" fill="#fda4af" opacity="0.7" />
          <circle cx="64" cy="62" r="3.5" fill="#fda4af" opacity="0.7" />
          {/* 嘴 */}
          <path d="M 44,67 Q 50,72 56,67" stroke="#dc2626" strokeWidth="2" fill="#fda4af" strokeLinecap="round" />
          {/* 髮夾 */}
          <circle cx="32" cy="36" r="3" fill="#ec4899" />
        </g>
      );

    case "阿哲": // INTJ 眼鏡冷靜
      return (
        <g>
          {/* 頭髮 (整齊短直) */}
          <path d="M 22,42 Q 22,20 50,20 Q 78,20 78,42 L 78,48 Q 60,32 50,34 Q 40,32 22,48 Z" fill="#3730a3" />
          {/* 臉 */}
          <ellipse cx="50" cy="55" rx="26" ry="28" fill={`url(#face-${id})`} />
          {/* 瀏海 */}
          <path d="M 28,40 L 50,38 L 72,40 L 70,46 Q 50,44 30,46 Z" fill="#3730a3" />
          {/* 眼鏡框 */}
          <circle cx="38" cy="55" r="7" fill="none" stroke="#1f2937" strokeWidth="2" />
          <circle cx="62" cy="55" r="7" fill="none" stroke="#1f2937" strokeWidth="2" />
          <line x1="45" y1="55" x2="55" y2="55" stroke="#1f2937" strokeWidth="2" />
          {/* 眼睛 */}
          <circle cx="38" cy="55" r="2" fill="#1f2937" />
          <circle cx="62" cy="55" r="2" fill="#1f2937" />
          {/* 嘴 (一條直線酷酷) */}
          <line x1="44" y1="70" x2="56" y2="70" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case "小傑": // ESTP 短髮運動
      return (
        <g>
          {/* 頭髮 (蓬鬆短毛) */}
          <path d="M 22,42 Q 22,16 50,16 Q 78,16 78,42 L 78,50 Q 70,38 65,42 Q 60,32 50,38 Q 40,32 35,42 Q 30,38 22,50 Z" fill="#7c2d12" />
          {/* 臉 */}
          <ellipse cx="50" cy="56" rx="26" ry="28" fill={`url(#face-${id})`} />
          {/* 髮絲 */}
          <path d="M 30,44 L 36,48 M 44,40 L 48,46 M 56,40 L 52,46 M 64,42 L 60,48 M 70,46 L 64,50" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          {/* 眼睛 (大眼活力) */}
          <circle cx="38" cy="55" r="3.5" fill="#1f2937" />
          <circle cx="62" cy="55" r="3.5" fill="#1f2937" />
          <circle cx="39" cy="54" r="1.2" fill="white" />
          <circle cx="63" cy="54" r="1.2" fill="white" />
          {/* 嘴 (大開心笑) */}
          <path d="M 40,68 Q 50,78 60,68" stroke="#7c2d12" strokeWidth="2" fill="#fef3c7" strokeLinecap="round" />
          {/* 牙齒 (露 1 顆) */}
          <rect x="48" y="70" width="4" height="3" fill="white" />
          {/* 頭帶 */}
          <rect x="22" y="34" width="56" height="5" rx="2" fill="#ef4444" />
        </g>
      );

    case "雅雯": // INFJ 長黑髮溫柔
      return (
        <g>
          {/* 長髮垂肩 */}
          <path d="M 18,52 Q 18,18 50,18 Q 82,18 82,52 L 84,90 Q 70,82 60,80 L 60,60 Q 40,60 40,80 L 40,80 Q 30,82 16,90 Z" fill="#1f2937" />
          {/* 臉 */}
          <ellipse cx="50" cy="56" rx="25" ry="27" fill={`url(#face-${id})`} />
          {/* 瀏海 (旁分) */}
          <path d="M 25,42 Q 40,34 60,40 Q 75,42 75,48 L 70,46 Q 56,42 45,46 Q 35,42 25,48 Z" fill="#1f2937" />
          {/* 眼睛 (溫柔半閉) */}
          <path d="M 36,55 Q 40,58 44,55" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 56,55 Q 60,58 64,55" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 睫毛 */}
          <line x1="36" y1="52" x2="36" y2="49" stroke="#1f2937" strokeWidth="1.2" />
          <line x1="64" y1="52" x2="64" y2="49" stroke="#1f2937" strokeWidth="1.2" />
          {/* 嘴 (溫柔微笑) */}
          <path d="M 44,68 Q 50,71 56,68" stroke="#9d174d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* 髮飾月亮 */}
          <path d="M 30,28 Q 32,24 36,26 Q 34,30 30,28 Z" fill="#e0e7ff" />
        </g>
      );

    case "宇航": // ISFP 戴帽創作
      return (
        <g>
          {/* 髮 (短捲) */}
          <path d="M 22,42 Q 22,18 50,18 Q 78,18 78,42 L 78,50 Q 60,46 50,48 Q 40,46 22,50 Z" fill="#7e22ce" />
          {/* 帽子 (扁帽 / 貝雷) */}
          <ellipse cx="50" cy="22" rx="30" ry="8" fill="#be185d" />
          <ellipse cx="50" cy="20" rx="22" ry="6" fill="#9f1239" />
          <circle cx="62" cy="18" r="3" fill="#fbbf24" />
          {/* 臉 */}
          <ellipse cx="50" cy="58" rx="25" ry="27" fill={`url(#face-${id})`} />
          {/* 瀏海 */}
          <path d="M 28,44 Q 42,38 50,40 Q 58,38 72,44 Q 60,46 50,46 Q 40,46 28,44 Z" fill="#7e22ce" />
          {/* 眼睛 (專注藝術家) */}
          <ellipse cx="38" cy="56" rx="2.5" ry="3" fill="#1f2937" />
          <ellipse cx="62" cy="56" rx="2.5" ry="3" fill="#1f2937" />
          <circle cx="38" cy="55" r="0.8" fill="white" />
          <circle cx="62" cy="55" r="0.8" fill="white" />
          {/* 嘴 (淡淡微笑) */}
          <path d="M 45,70 Q 50,72 55,70" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* 畫筆插耳邊 */}
          <line x1="80" y1="50" x2="86" y2="44" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="86" cy="44" r="2" fill="#dc2626" />
        </g>
      );

    case "凱莉": // ENTJ 馬尾氣勢
      return (
        <g>
          {/* 高馬尾 */}
          <ellipse cx="74" cy="36" rx="6" ry="20" fill="#991b1b" transform="rotate(20 74 36)" />
          {/* 頭髮 (緊俐落) */}
          <path d="M 22,42 Q 22,18 50,18 Q 75,18 75,42 L 75,50 Q 60,40 50,42 Q 40,40 22,50 Z" fill="#991b1b" />
          {/* 臉 */}
          <ellipse cx="50" cy="56" rx="25" ry="27" fill={`url(#face-${id})`} />
          {/* 瀏海 (中分) */}
          <path d="M 28,42 Q 42,38 50,40 Q 58,38 72,42 Q 70,46 60,44 L 50,42 L 40,44 Q 30,46 28,42 Z" fill="#991b1b" />
          {/* 眼睛 (銳利) */}
          <path d="M 35,55 L 42,55" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 58,55 L 65,55" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          {/* 眼線 */}
          <path d="M 33,52 L 42,53" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 67,52 L 58,53" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          {/* 嘴 (自信淡笑) */}
          <path d="M 44,68 Q 50,70 56,68" stroke="#9f1239" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 王冠頂飾 */}
          <path d="M 44,18 L 47,12 L 50,18 L 53,12 L 56,18 Z" fill="#fbbf24" />
        </g>
      );

    case "小宇": // INTP 西瓜頭書呆
      return (
        <g>
          {/* 頭髮 (西瓜頭) */}
          <ellipse cx="50" cy="34" rx="32" ry="22" fill="#0c4a6e" />
          {/* 臉 */}
          <ellipse cx="50" cy="58" rx="25" ry="27" fill={`url(#face-${id})`} />
          {/* 瀏海 (滿瀏海) */}
          <ellipse cx="50" cy="38" rx="30" ry="10" fill="#0c4a6e" />
          <path d="M 22,42 L 78,42 L 76,48 Q 60,44 50,46 Q 40,44 24,48 Z" fill="#0c4a6e" />
          {/* 眼睛 (圓圓好奇) */}
          <circle cx="38" cy="56" r="3" fill="#1f2937" />
          <circle cx="62" cy="56" r="3" fill="#1f2937" />
          <circle cx="38" cy="55" r="1" fill="white" />
          <circle cx="62" cy="55" r="1" fill="white" />
          {/* 嘴 (O 型驚訝) */}
          <ellipse cx="50" cy="70" rx="2" ry="3" fill="#7c2d12" />
          {/* 額頭一綹呆毛 */}
          <path d="M 48,18 Q 50,12 52,18" stroke="#0c4a6e" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );

    case "婷婷": // ESFJ 包包頭熱情
      return (
        <g>
          {/* 兩個包包頭 */}
          <circle cx="24" cy="28" r="11" fill="#db2777" />
          <circle cx="76" cy="28" r="11" fill="#db2777" />
          {/* 頭髮主體 */}
          <path d="M 22,44 Q 22,20 50,20 Q 78,20 78,44 L 78,50 Q 60,40 50,42 Q 40,40 22,50 Z" fill="#db2777" />
          {/* 臉 */}
          <ellipse cx="50" cy="58" rx="25" ry="27" fill={`url(#face-${id})`} />
          {/* 瀏海 (鋸齒可愛) */}
          <path d="M 28,40 L 34,46 L 40,40 L 46,46 L 50,40 L 54,46 L 60,40 L 66,46 L 72,40 L 72,50 Q 50,46 28,50 Z" fill="#db2777" />
          {/* 眼睛 (大圓亮亮) */}
          <ellipse cx="38" cy="58" rx="3.5" ry="4" fill="#1f2937" />
          <ellipse cx="62" cy="58" rx="3.5" ry="4" fill="#1f2937" />
          <circle cx="39" cy="57" r="1.4" fill="white" />
          <circle cx="63" cy="57" r="1.4" fill="white" />
          {/* 腮紅 (大圓圓) */}
          <circle cx="34" cy="66" r="4.5" fill="#fda4af" opacity="0.75" />
          <circle cx="66" cy="66" r="4.5" fill="#fda4af" opacity="0.75" />
          {/* 嘴 (大笑露齒) */}
          <path d="M 40,70 Q 50,80 60,70" stroke="#9f1239" strokeWidth="2" fill="#fda4af" strokeLinecap="round" />
          <rect x="46" y="72" width="8" height="3" fill="white" rx="0.5" />
          {/* 蝴蝶結 */}
          <path d="M 18,28 L 14,24 L 14,32 Z" fill="#fbbf24" />
          <path d="M 30,28 L 34,24 L 34,32 Z" fill="#fbbf24" />
        </g>
      );

    default:
      return <text x="50" y="55" textAnchor="middle" fontSize="40">?</text>;
  }
}
