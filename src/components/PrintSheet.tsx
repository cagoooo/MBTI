"use client";

import { useEffect, useState } from "react";
import type { MBTIInfo } from "@/lib/mbti";
import { strengthBars } from "@/lib/scoring";
import type { Scores } from "@/lib/types";
import appConfig from "../../app.config";

interface SavedResult {
  scores: Scores;
}

interface Props {
  info: MBTIInfo;
}

/**
 * 列印專用 A4 結果單。
 * 螢幕上看不到 (用 .print-sheet display:none)，只有 window.print() 時才顯示。
 * 排版設計：頂部姓名欄、主視覺、四軸圖、超能力、給家長的話、QR 提示。
 */
export default function PrintSheet({ info }: Props) {
  const [scores, setScores] = useState<Scores | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mbti-result");
      if (raw) {
        const parsed = JSON.parse(raw) as SavedResult;
        setScores(parsed.scores);
      }
    } catch {}
  }, []);

  const bars = scores ? strengthBars(scores) : null;

  return (
    <div className="print-sheet" style={{ fontFamily: "Noto Sans TC, sans-serif", padding: "0", color: "#000" }}>
      {/* 頂部資訊欄 (學生填寫) */}
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: 8, marginBottom: 16, fontSize: 12 }}>
        <div>
          <strong>姓名：</strong>______________
          <span style={{ marginLeft: 16 }}><strong>班級：</strong>______ 座號：____</span>
        </div>
        <div>
          <strong>日期：</strong>______ / ______ / ______
        </div>
      </div>

      {/* 標題 */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 14, letterSpacing: 4 }}>MBTI 校園奇遇記 · 我的人格類型</div>
        <div style={{ fontSize: 64, marginTop: 4 }}>{info.emoji}</div>
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>{info.type}</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{info.nickname}</div>
        <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}>『{info.oneLiner}』</div>
      </div>

      {/* 校園角色 */}
      <div style={{ background: "#f5f5f5", borderLeft: "4px solid #ff8364", padding: "10px 12px", marginBottom: 16, fontSize: 13 }}>
        <strong>🏫 在校園裡的我：</strong>{info.campusRole}
      </div>

      {/* 四軸強度 */}
      {bars && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📊 我的人格傾向</div>
          {[
            { l: "外向 E", r: "I 內向", lp: bars.E, rp: bars.I },
            { l: "實感 S", r: "N 直覺", lp: bars.S, rp: bars.N },
            { l: "思考 T", r: "F 情感", lp: bars.T, rp: bars.F },
            { l: "判斷 J", r: "P 感知", lp: bars.J, rp: bars.P },
          ].map((a, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
                <span>{a.l} {a.lp}%</span>
                <span>{a.rp}% {a.r}</span>
              </div>
              <div style={{ height: 8, border: "1px solid #888", display: "flex" }}>
                <div style={{ width: `${a.lp}%`, background: "#333" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 兩欄: 超能力 + 練習 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, border: "2px solid #22a06b", padding: 10, fontSize: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 6, color: "#22a06b" }}>💪 我的超能力</div>
          <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.7 }}>
            {info.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div style={{ flex: 1, border: "2px solid #d4a017", padding: 10, fontSize: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 6, color: "#b87900" }}>🌱 我想練習</div>
          <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.7 }}>
            {info.watchOut.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* 適合方向 + 同類名人 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, fontSize: 11 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>🚀 未來方向</div>
          <div>{info.futureJobs.join(" · ")}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>⭐ 同類名人</div>
          <div>{info.famous.join(" · ")}</div>
        </div>
      </div>

      {/* 配對 */}
      <div style={{ marginBottom: 16, fontSize: 11 }}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>🤝 我的相處夥伴</div>
        <div>💖 最合拍：{info.bestMatches.join(" · ")} ｜ 🌱 多點耐心：{info.growthPartners.join(" · ")}</div>
      </div>

      {/* 給家長的話 */}
      <div style={{ background: "#faf5ff", border: "2px solid #c8a8e9", padding: 12, marginBottom: 14, fontSize: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>💌 給家長的話</div>
        <div>{info.tipForGrowth}</div>
      </div>

      {/* 反思區 */}
      <div style={{ border: "1px dashed #888", padding: 12, fontSize: 11, marginBottom: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>✍️ 給自己的話 (學生填寫)</div>
        <div style={{ marginBottom: 12 }}>讀完上面這份結果，我覺得最像我的部分是：</div>
        <div style={{ height: 32, borderBottom: "1px solid #888", marginBottom: 16 }}></div>
        <div style={{ marginBottom: 12 }}>我想從這學期開始練習的一件事：</div>
        <div style={{ height: 32, borderBottom: "1px solid #888" }}></div>
      </div>

      {/* 頁腳 */}
      <div style={{ borderTop: "1px solid #ccc", paddingTop: 6, fontSize: 9, color: "#666", display: "flex", justifyContent: "space-between" }}>
        <span>{appConfig.siteName} · {appConfig.schoolFullName} · {appConfig.teacherName}</span>
        <span>{appConfig.productionUrl.replace(/^https?:\/\//, "")}/</span>
      </div>
    </div>
  );
}
