"use client";

/**
 * 場景背景 SVG — 取代純色漸層 + 角落大 emoji
 *
 * 設計:
 *   - 純 SVG 內聯 (zero asset request)
 *   - 用 location 字串關鍵字判斷場景類型
 *   - 5 種模板覆蓋大部分場景: classroom / hallway / outdoor / artroom / hall
 *   - 半透明放在卡片底，不影響文字閱讀
 *   - 配合卡片整體配色，柔和淡雅
 */

interface Props {
  location?: string;
  bgEmoji?: string;
  className?: string;
}

type SceneTemplate = "classroom" | "hallway" | "outdoor" | "artroom" | "sports" | "hall" | "library";

function detectTemplate(location?: string, bgEmoji?: string): SceneTemplate {
  const text = `${location ?? ""} ${bgEmoji ?? ""}`;
  if (/教室|黑板|座位|門口/.test(text) || /🏫|✏️|🪑|📚/.test(text)) return "classroom";
  if (/操場|體育館|跑道|球場|練習場|宿舍/.test(text) || /🏃|🏟️|⚽|🏀|🏅|🆚|🤕/.test(text)) return "sports";
  if (/美術|畫|社團/.test(text) || /🎨|🖼️|🎭/.test(text)) return "artroom";
  if (/走廊|餐廳|福利社|轉角|樓梯/.test(text) || /🔔|🍱/.test(text)) return "hallway";
  if (/禮堂|司令台|舞台|博覽會|閉幕|開幕/.test(text) || /🎪|🎉|🎊|🌅|🌟/.test(text)) return "hall";
  if (/圖書館|科學|書桌|實驗/.test(text) || /🔬|📰|📊|🧮/.test(text)) return "library";
  return "outdoor";
}

export default function SceneBackground({ location, bgEmoji, className = "" }: Props) {
  const tpl = detectTemplate(location, bgEmoji);
  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-40">
        {renderTemplate(tpl)}
      </svg>
    </div>
  );
}

import type { ReactElement } from "react";

function renderTemplate(tpl: SceneTemplate): ReactElement {
  switch (tpl) {
    case "classroom":
      return (
        <g>
          {/* 牆 */}
          <rect width="400" height="160" fill="#fef3c7" />
          {/* 地板 */}
          <rect y="160" width="400" height="80" fill="#fde68a" />
          <line x1="0" y1="160" x2="400" y2="160" stroke="#f59e0b" strokeWidth="1" />
          {/* 黑板 */}
          <rect x="60" y="30" width="280" height="70" rx="4" fill="#065f46" />
          <rect x="60" y="30" width="280" height="70" rx="4" fill="none" stroke="#92400e" strokeWidth="3" />
          {/* 黑板上的字 (粉筆痕) */}
          <line x1="80" y1="55" x2="180" y2="55" stroke="#fef3c7" strokeWidth="2" opacity="0.7" />
          <line x1="80" y1="70" x2="220" y2="70" stroke="#fef3c7" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="85" x2="160" y2="85" stroke="#fef3c7" strokeWidth="2" opacity="0.5" />
          {/* 課桌椅 (兩排) */}
          {[40, 140, 240, 340].map((x) => (
            <g key={`d1-${x}`}>
              <rect x={x - 30} y="160" width="50" height="12" fill="#a16207" />
              <rect x={x - 28} y="172" width="6" height="20" fill="#92400e" />
              <rect x={x + 14} y="172" width="6" height="20" fill="#92400e" />
            </g>
          ))}
          {[40, 140, 240, 340].map((x) => (
            <g key={`d2-${x}`}>
              <rect x={x - 30} y="200" width="50" height="10" fill="#a16207" />
              <rect x={x - 28} y="210" width="6" height="20" fill="#92400e" />
              <rect x={x + 14} y="210" width="6" height="20" fill="#92400e" />
            </g>
          ))}
          {/* 窗戶 (兩扇) */}
          <rect x="10" y="40" width="40" height="80" fill="#a3d8f4" stroke="#92400e" strokeWidth="2" />
          <line x1="30" y1="40" x2="30" y2="120" stroke="#92400e" strokeWidth="1" />
          <line x1="10" y1="80" x2="50" y2="80" stroke="#92400e" strokeWidth="1" />
          <rect x="350" y="40" width="40" height="80" fill="#a3d8f4" stroke="#92400e" strokeWidth="2" />
          <line x1="370" y1="40" x2="370" y2="120" stroke="#92400e" strokeWidth="1" />
          <line x1="350" y1="80" x2="390" y2="80" stroke="#92400e" strokeWidth="1" />
        </g>
      );

    case "sports":
      return (
        <g>
          {/* 天空 */}
          <rect width="400" height="120" fill="#a3d8f4" />
          {/* 雲 */}
          <ellipse cx="80" cy="40" rx="35" ry="12" fill="white" opacity="0.85" />
          <ellipse cx="280" cy="60" rx="40" ry="14" fill="white" opacity="0.85" />
          {/* 地 (操場土黃) */}
          <rect y="120" width="400" height="120" fill="#fde68a" />
          {/* 跑道 (橘色橢圓) */}
          <ellipse cx="200" cy="200" rx="180" ry="50" fill="none" stroke="#fb923c" strokeWidth="20" opacity="0.6" />
          <ellipse cx="200" cy="200" rx="180" ry="50" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
          {/* 籃球架 */}
          <line x1="60" y1="80" x2="60" y2="150" stroke="#7c2d12" strokeWidth="4" />
          <rect x="40" y="80" width="40" height="25" fill="white" stroke="#7c2d12" strokeWidth="2" />
          <circle cx="60" cy="105" r="8" fill="none" stroke="#ea580c" strokeWidth="2" />
          {/* 籃球 */}
          <circle cx="120" cy="180" r="10" fill="#ea580c" />
          <line x1="110" y1="180" x2="130" y2="180" stroke="#7c2d12" strokeWidth="1" />
          <path d="M 120,170 Q 125,180 120,190" stroke="#7c2d12" strokeWidth="1" fill="none" />
          {/* 球門/旗 */}
          <line x1="340" y1="90" x2="340" y2="160" stroke="#7c2d12" strokeWidth="3" />
          <path d="M 340,90 L 370,100 L 340,110 Z" fill="#ef4444" />
        </g>
      );

    case "artroom":
      return (
        <g>
          {/* 牆 */}
          <rect width="400" height="240" fill="#fef2f2" />
          {/* 地 */}
          <rect y="180" width="400" height="60" fill="#fecaca" />
          {/* 畫架 */}
          <g transform="translate(60,80)">
            <line x1="0" y1="100" x2="20" y2="20" stroke="#92400e" strokeWidth="3" />
            <line x1="40" y1="100" x2="20" y2="20" stroke="#92400e" strokeWidth="3" />
            <rect x="-5" y="20" width="50" height="60" fill="white" stroke="#92400e" strokeWidth="2" />
            {/* 畫上的色塊 */}
            <circle cx="10" cy="40" r="8" fill="#fbbf24" />
            <rect x="22" y="35" width="14" height="14" fill="#a3d8f4" />
            <path d="M 8,55 Q 20,68 32,55 L 32,75 L 8,75 Z" fill="#86efac" />
          </g>
          {/* 顏料管 */}
          <rect x="200" y="170" width="40" height="14" rx="2" fill="#ef4444" />
          <rect x="245" y="170" width="40" height="14" rx="2" fill="#22c55e" />
          <rect x="290" y="170" width="40" height="14" rx="2" fill="#3b82f6" />
          <rect x="335" y="170" width="40" height="14" rx="2" fill="#facc15" />
          {/* 畫筆 */}
          <line x1="270" y1="120" x2="320" y2="60" stroke="#92400e" strokeWidth="3" />
          <ellipse cx="270" cy="120" rx="6" ry="4" fill="#fbbf24" transform="rotate(40 270 120)" />
          {/* 牆上掛畫 */}
          <rect x="240" y="40" width="60" height="40" fill="white" stroke="#92400e" strokeWidth="2" />
          <path d="M 250,55 Q 270,40 290,55 L 290,75 L 250,75 Z" fill="#86efac" />
          <circle cx="280" cy="50" r="4" fill="#fbbf24" />
        </g>
      );

    case "hallway":
      return (
        <g>
          {/* 牆 */}
          <rect width="400" height="160" fill="#fef9f3" />
          {/* 地 (透視磚) */}
          <rect y="160" width="400" height="80" fill="#fed7aa" />
          {/* 磚紋透視 */}
          <line x1="0" y1="160" x2="400" y2="160" stroke="#fb923c" strokeWidth="2" />
          <line x1="0" y1="190" x2="400" y2="190" stroke="#fb923c" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="220" x2="400" y2="220" stroke="#fb923c" strokeWidth="1" opacity="0.3" />
          <line x1="200" y1="160" x2="100" y2="240" stroke="#fb923c" strokeWidth="1" opacity="0.4" />
          <line x1="200" y1="160" x2="300" y2="240" stroke="#fb923c" strokeWidth="1" opacity="0.4" />
          {/* 公告欄 (右側牆) */}
          <rect x="280" y="40" width="80" height="60" fill="#86efac" stroke="#15803d" strokeWidth="2" />
          <line x1="290" y1="55" x2="350" y2="55" stroke="#15803d" strokeWidth="1" opacity="0.5" />
          <line x1="290" y1="70" x2="340" y2="70" stroke="#15803d" strokeWidth="1" opacity="0.5" />
          <line x1="290" y1="85" x2="345" y2="85" stroke="#15803d" strokeWidth="1" opacity="0.5" />
          {/* 燈 */}
          <rect x="40" y="0" width="60" height="10" fill="#fbbf24" />
          <rect x="170" y="0" width="60" height="10" fill="#fbbf24" />
          <rect x="300" y="0" width="60" height="10" fill="#fbbf24" />
        </g>
      );

    case "hall":
      return (
        <g>
          {/* 舞台地板 */}
          <rect width="400" height="240" fill="#fef3c7" />
          {/* 紅色舞台地毯 */}
          <rect y="160" width="400" height="80" fill="#fca5a5" />
          {/* 簾幕 (兩側) */}
          <path d="M 0,0 L 0,180 Q 30,170 60,175 L 60,0 Z" fill="#dc2626" />
          <path d="M 400,0 L 400,180 Q 370,170 340,175 L 340,0 Z" fill="#dc2626" />
          {/* 簾幕褶皺 */}
          <line x1="20" y1="20" x2="20" y2="170" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.4" />
          <line x1="40" y1="20" x2="40" y2="170" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.4" />
          <line x1="360" y1="20" x2="360" y2="170" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.4" />
          <line x1="380" y1="20" x2="380" y2="170" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.4" />
          {/* 上方紅幕 */}
          <rect width="400" height="30" fill="#dc2626" />
          {/* 中央聚光燈 */}
          <ellipse cx="200" cy="200" rx="120" ry="20" fill="white" opacity="0.5" />
          {/* 燈泡 */}
          {[80, 140, 200, 260, 320].map((x) => (
            <circle key={x} cx={x} cy="40" r="5" fill="#fbbf24" />
          ))}
          {/* 紙花/彩帶 */}
          <circle cx="100" cy="80" r="3" fill="#ec4899" />
          <circle cx="300" cy="100" r="3" fill="#3b82f6" />
          <circle cx="150" cy="120" r="3" fill="#22c55e" />
          <circle cx="280" cy="60" r="3" fill="#fbbf24" />
          <circle cx="200" cy="90" r="3" fill="#a78bfa" />
        </g>
      );

    case "library":
      return (
        <g>
          {/* 牆 */}
          <rect width="400" height="240" fill="#f0f9ff" />
          {/* 地 */}
          <rect y="180" width="400" height="60" fill="#bae6fd" />
          {/* 書櫃 (3 排) */}
          {[20, 280].map((x) => (
            <g key={`shelf-${x}`}>
              <rect x={x} y="30" width="100" height="150" fill="#92400e" />
              {[0, 1, 2].map((row) => (
                <g key={row}>
                  <rect x={x + 5} y={45 + row * 45} width="90" height="3" fill="#7c2d12" />
                  {/* 書本 */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const colors = ["#ef4444", "#22c55e", "#3b82f6", "#fbbf24", "#a78bfa", "#ec4899", "#0ea5e9", "#f97316"];
                    return (
                      <rect
                        key={i}
                        x={x + 7 + i * 11}
                        y={50 + row * 45 - 25}
                        width={9}
                        height={28}
                        fill={colors[(i + row + x) % colors.length]}
                      />
                    );
                  })}
                </g>
              ))}
            </g>
          ))}
          {/* 書桌 (中央) */}
          <rect x="150" y="170" width="100" height="10" fill="#a16207" />
          <rect x="155" y="180" width="6" height="40" fill="#92400e" />
          <rect x="239" y="180" width="6" height="40" fill="#92400e" />
          {/* 桌上書 */}
          <rect x="170" y="155" width="30" height="15" fill="#22c55e" />
          <rect x="205" y="160" width="25" height="10" fill="#ef4444" />
          {/* 抬燈 */}
          <line x1="160" y1="170" x2="160" y2="130" stroke="#1f2937" strokeWidth="2" />
          <path d="M 160,130 L 175,115 L 180,125 Z" fill="#fbbf24" />
        </g>
      );

    case "outdoor":
    default:
      return (
        <g>
          {/* 天空漸層 */}
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3d8f4" />
              <stop offset="100%" stopColor="#fef9f3" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky)" />
          {/* 草地 */}
          <rect y="180" width="400" height="60" fill="#86efac" />
          {/* 山 (遠處) */}
          <path d="M 0,180 L 100,100 L 180,150 L 260,80 L 360,140 L 400,120 L 400,180 Z" fill="#86efac" opacity="0.6" />
          {/* 雲 */}
          <ellipse cx="60" cy="40" rx="35" ry="12" fill="white" opacity="0.9" />
          <ellipse cx="80" cy="45" rx="25" ry="10" fill="white" opacity="0.9" />
          <ellipse cx="280" cy="60" rx="40" ry="14" fill="white" opacity="0.85" />
          {/* 太陽 */}
          <circle cx="340" cy="40" r="20" fill="#fbbf24" opacity="0.8" />
          {/* 樹 (兩棵) */}
          <g transform="translate(40,140)">
            <rect x="10" y="20" width="6" height="30" fill="#7c2d12" />
            <circle cx="13" cy="20" r="20" fill="#15803d" />
            <circle cx="3" cy="14" r="12" fill="#16a34a" />
            <circle cx="22" cy="14" r="12" fill="#16a34a" />
          </g>
          <g transform="translate(330,150)">
            <rect x="10" y="20" width="6" height="25" fill="#7c2d12" />
            <circle cx="13" cy="18" r="17" fill="#15803d" />
            <circle cx="5" cy="14" r="10" fill="#16a34a" />
          </g>
          {/* 花朵 */}
          <circle cx="150" cy="210" r="3" fill="#ec4899" />
          <circle cx="180" cy="220" r="3" fill="#fbbf24" />
          <circle cx="220" cy="215" r="3" fill="#a78bfa" />
          <circle cx="260" cy="225" r="3" fill="#ec4899" />
        </g>
      );
  }
}
