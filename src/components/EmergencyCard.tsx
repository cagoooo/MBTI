"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SelStyle } from "@/lib/sel";
import { getSelStyleInfo } from "@/lib/sel";
import { playSound } from "@/lib/sound";
import appConfig from "../../app.config";

interface Props {
  style: SelStyle;
}

/**
 * 情緒急救卡 — 信用卡大小可印可放錢包
 *
 * 設計：
 *   - 一張 A4 紙上印 2 張同樣的卡 (前+後) 學生可剪下來
 *   - 標準信用卡尺寸 85.6mm x 53.98mm (CR80)
 *   - 用 @media print + @page A4 + .emergency-card-sheet 控制
 *   - 學生填名字、聯絡人後可塑封
 *
 * 用瀏覽器原生 window.print() → 「另存 PDF」就 OK
 * 不裝額外 PDF lib (vs jsPDF +200KB bundle)
 */
export default function EmergencyCard({ style }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const info = getSelStyleInfo(style);
  // 取工具箱前 5 個短版 (移除冗長描述)
  const shortTools = info.toolbox.map((t) => {
    // 把括弧內的小字去掉、最多 18 字
    return t.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").slice(0, 18);
  });

  function handlePrint() {
    playSound("coin");
    setShowPreview(true);
    // 等 DOM 更新後 print
    setTimeout(() => {
      window.print();
    }, 100);
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm relative overflow-hidden print-hide screen-only"
      >
        <div className="absolute -top-4 -right-4 text-7xl opacity-10">🆘</div>
        <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-amber-900 mb-2">
          <span>🆘</span>
          <span>下載我的情緒急救卡</span>
        </h3>
        <p className="text-sm text-amber-800/80 mb-4">
          錢包 / 鉛筆盒大小，列印剪下塑封 — 遇到難過時拿出來看，提醒自己有這些工具可以用 ✨
        </p>

        {/* 螢幕預覽迷你版 */}
        <div className="bg-white rounded-2xl p-5 border-2 border-amber-200 max-w-sm mx-auto mb-5 shadow-md">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 text-center">
            🆘 我的情緒急救卡
          </p>
          <div className={`bg-gradient-to-br ${info.gradient} rounded-xl p-3 text-white text-center mb-3 shadow`}>
            <div className="text-3xl">{info.emoji}</div>
            <p className="font-black text-lg leading-tight">{info.nickname}</p>
          </div>
          <p className="text-[11px] font-bold text-amber-900 mb-1">💡 我的 5 個情緒工具：</p>
          <ul className="text-[11px] text-amber-800/90 space-y-1 leading-relaxed">
            {shortTools.map((t, i) => (
              <li key={i} className="flex gap-1.5"><span>{i + 1}.</span> <span>{t}</span></li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-amber-200">
            <p className="text-[10px] text-amber-700/70">📞 我的聯絡人 (請自己填)：________________</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="btn-3d w-full py-3 rounded-2xl bg-amber-500 text-white font-black text-base hover:bg-amber-600 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🖨️</span>
          <span>列印 / 另存 PDF</span>
        </button>
        <p className="text-xs text-amber-700/60 text-center mt-2 leading-relaxed">
          💡 列印對話框選「另存 PDF」就能存到電腦 / 手機 · 印出來剪一剪 + 塑封超耐用
        </p>
      </motion.section>

      {/* 列印用 sheet — 螢幕看不見，print 時才顯示 */}
      <div className="emergency-card-sheet">
        {/* 2 張一樣的卡 (前面 + 背面，學生可剪下黏一起或對折) */}
        {[0, 1].map((idx) => (
          <div key={idx} className="ec-card">
            {/* 正面 */}
            <div className="ec-front">
              <div className="ec-header">🆘 情緒急救卡</div>
              <div className="ec-style-block" style={{ background: gradientCss(style) }}>
                <div className="ec-emoji">{info.emoji}</div>
                <div className="ec-style-name">{info.nickname}</div>
              </div>
              <p className="ec-oneliner">{info.oneLiner}</p>
              <div className="ec-footer">
                <span>by {appConfig.teacherName}</span>
                <span>{appConfig.schoolShortName}</span>
              </div>
            </div>
            {/* 背面 */}
            <div className="ec-back">
              <p className="ec-tools-title">💡 我的 5 個情緒工具</p>
              <ol className="ec-tools-list">
                {shortTools.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
              <div className="ec-contacts">
                <p className="ec-contacts-title">📞 緊急聯絡 (請自己填)：</p>
                <p>家人：__________________</p>
                <p>朋友：__________________</p>
                <p>老師：__________________</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .emergency-card-sheet {
          display: none;
        }

        @media print {
          /* 隱藏其他所有東西 */
          :global(body > *) {
            visibility: hidden;
          }
          .emergency-card-sheet,
          .emergency-card-sheet * {
            visibility: visible;
          }
          .emergency-card-sheet {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 20mm;
            font-family: "Noto Sans TC", sans-serif;
            color: #000;
          }
        }

        @page {
          size: A4;
          margin: 0;
        }

        .ec-card {
          display: flex;
          gap: 4mm;
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }

        .ec-front,
        .ec-back {
          width: 85.6mm;
          height: 53.98mm;
          border: 2px dashed #ccc;
          border-radius: 3mm;
          padding: 3mm 4mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          background: white;
        }

        .ec-header {
          font-size: 9pt;
          font-weight: 900;
          color: #b45309;
          letter-spacing: 0.5pt;
          text-align: center;
          margin-bottom: 2mm;
        }

        .ec-style-block {
          flex: 1;
          border-radius: 2mm;
          padding: 2mm;
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .ec-emoji {
          font-size: 18pt;
          line-height: 1;
        }

        .ec-style-name {
          font-size: 14pt;
          font-weight: 900;
          margin-top: 1mm;
        }

        .ec-oneliner {
          font-size: 7.5pt;
          color: #44403c;
          line-height: 1.3;
          margin: 2mm 0 0;
          text-align: center;
        }

        .ec-footer {
          display: flex;
          justify-content: space-between;
          font-size: 6pt;
          color: #78716c;
          margin-top: auto;
        }

        .ec-tools-title {
          font-size: 8pt;
          font-weight: 900;
          color: #b45309;
          margin: 0 0 1mm;
        }

        .ec-tools-list {
          margin: 0;
          padding-left: 4mm;
          font-size: 7.5pt;
          line-height: 1.5;
          color: #292524;
          flex: 1;
        }

        .ec-tools-list li {
          margin-bottom: 0.5mm;
        }

        .ec-contacts {
          border-top: 0.5pt solid #d6d3d1;
          padding-top: 1.5mm;
          margin-top: 1.5mm;
        }

        .ec-contacts-title {
          font-size: 7pt;
          font-weight: 700;
          color: #b45309;
          margin: 0 0 0.5mm;
        }

        .ec-contacts p {
          font-size: 7pt;
          color: #57534e;
          margin: 0.3mm 0;
        }
      `}</style>
    </>
  );
}

/** 從 Tailwind gradient class 取 CSS (印不出 Tailwind 在 inline style) */
function gradientCss(style: SelStyle): string {
  const colors: Record<SelStyle, string> = {
    express: "linear-gradient(135deg, #f9a8d4 0%, #fda4af 50%, #f0abfc 100%)",
    solve: "linear-gradient(135deg, #7dd3fc 0%, #60a5fa 50%, #818cf8 100%)",
    calm: "linear-gradient(135deg, #6ee7b7 0%, #5eead4 50%, #67e8f9 100%)",
    connect: "linear-gradient(135deg, #fcd34d 0%, #fdba74 50%, #fda4af 100%)",
  };
  return colors[style];
}
