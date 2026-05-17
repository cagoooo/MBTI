"use client";

import { useState } from "react";
import Link from "next/link";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import { playSound } from "@/lib/sound";
import appConfig from "../../../app.config";

type WorksheetStyle = "personal" | "group";

export default function WorksheetPage() {
  const [style, setStyle] = useState<WorksheetStyle>("personal");

  function handlePrint() {
    playSound("coin");
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      {/* 螢幕版工具列 (列印時隱藏) */}
      <div className="max-w-3xl mx-auto print-hide">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <HomeToButton />
          <Link
            href="/teacher/new"
            className="text-xs sm:text-sm text-violet-700 hover:underline"
          >
            🎓 開班級房間
          </Link>
        </div>

        <header className="text-center mb-6">
          <p className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 border-2 border-emerald-300 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
            📋 老師專用 ・ A4 學習單
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            <span className="shimmer-text">MBTI 反思學習單</span>
          </h1>
          <p className="text-[var(--color-ink)]/70">
            學生玩完遊戲後填寫，引導自我覺察與多元尊重。
            <br />
            點下方按鈕**列印 / 另存 PDF** 發給全班。
          </p>
        </header>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[var(--color-ink)]/10 mb-6">
          <h3 className="font-black text-sm mb-3">📝 選擇學習單版本</h3>
          <div className="grid grid-cols-2 gap-3">
            <SoundButton
              sound="pop"
              onClick={() => setStyle("personal")}
              className={`p-4 rounded-2xl border-2 text-left transition ${
                style === "personal"
                  ? "border-[var(--color-coral)] bg-[var(--color-cream)] shadow-md"
                  : "border-[var(--color-ink)]/15 hover:border-[var(--color-coral)]/40"
              }`}
            >
              <div className="text-2xl mb-1">🧒</div>
              <div className="font-black">個人版</div>
              <div className="text-xs text-[var(--color-ink)]/60 mt-1">
                學生玩完帶回家寫，跟家長分享
              </div>
            </SoundButton>
            <SoundButton
              sound="pop"
              onClick={() => setStyle("group")}
              className={`p-4 rounded-2xl border-2 text-left transition ${
                style === "group"
                  ? "border-[var(--color-coral)] bg-[var(--color-cream)] shadow-md"
                  : "border-[var(--color-ink)]/15 hover:border-[var(--color-coral)]/40"
              }`}
            >
              <div className="text-2xl mb-1">👥</div>
              <div className="font-black">小組討論版</div>
              <div className="text-xs text-[var(--color-ink)]/60 mt-1">
                3-4 人小組討論用，含團隊反思題
              </div>
            </SoundButton>
          </div>
          <SoundButton
            sound="coin"
            onClick={handlePrint}
            className="btn-3d mt-4 w-full px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-lg hover:bg-emerald-600"
          >
            🖨️ 列印 / 另存 PDF
          </SoundButton>
          <p className="mt-3 text-xs text-[var(--color-ink)]/50 text-center">
            列印時 toolbar 與導覽會自動隱藏，紙張用 A4 直式
          </p>
        </div>

        <details className="bg-white rounded-3xl p-5 border-2 border-[var(--color-ink)]/10">
          <summary className="font-bold cursor-pointer">💡 老師建議使用方式</summary>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-sm text-[var(--color-ink)]/80">
            <li>學生玩完遊戲（10 分鐘）拿到 MBTI 結果</li>
            <li>發學習單給每位學生（A4 一張）</li>
            <li>個人版：學生自己寫 → 帶回家給家長簽名</li>
            <li>小組版：4 人一組，每人寫自己 + 互相討論</li>
            <li>下節課回收看反饋，做小型班會分享</li>
            <li>學期末做成「我的人格成長軌跡」檔案夾</li>
          </ol>
        </details>
      </div>

      {/* 列印用 A4 學習單本體 */}
      <div className="print-sheet" style={{ fontFamily: "Noto Sans TC, sans-serif", color: "#000" }}>
        <WorksheetA4 style={style} />
      </div>
    </div>
  );
}

/**
 * A4 學習單本體（依 skill `pdf-export-print-best-practice`：window.print + @media print）
 */
function WorksheetA4({ style }: { style: WorksheetStyle }) {
  const isGroup = style === "group";

  return (
    <div style={{ padding: "0" }}>
      {/* 頂部 — 學校 + 學生資訊 */}
      <div style={{ borderBottom: "3px solid #ff8364", paddingBottom: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: 2 }}>
              {appConfig.schoolFullName} ・ 班級輔導活動
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2 }}>
              {appConfig.siteName} · {isGroup ? "小組討論" : "個人反思"}學習單
            </div>
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>姓名：</strong>______________
            <span style={{ marginLeft: 16 }}>
              <strong>班級：</strong>____ 座號：____
            </span>
          </div>
        </div>
      </div>

      {/* 結果填寫區 */}
      <Section title="🎯 我的 MBTI 結果">
        <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 8 }}>
          <FillBox label="我的人格類型 (4 個英文字)" width={120} />
          <FillBox label="人格類型暱稱" width={200} />
          <FillBox label="遊戲日期" width={120} />
        </div>
      </Section>

      <Section title="✨ 看完結果，我覺得「最像我」的部分是...">
        <Lines count={3} />
      </Section>

      <Section title="🤔 看完結果，我覺得「最不像我」的部分是...">
        <Lines count={2} />
      </Section>

      <Section title="🤝 跟班上誰最合拍？為什麼？">
        <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 8 }}>
          <FillBox label="同學名字" width={200} />
          <FillBox label="他/她的 MBTI" width={100} />
        </div>
        <Lines count={2} placeholder="因為..." />
      </Section>

      {isGroup ? (
        <Section title="👥 小組討論：我們組內的「人格地圖」">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 6 }}>
            <thead>
              <tr style={{ background: "#fef9f3" }}>
                <th style={cell}>姓名</th>
                <th style={cell}>MBTI</th>
                <th style={cell}>暱稱</th>
                <th style={cell}>一個我的特色</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td style={cell}>&nbsp;</td>
                  <td style={cell}>&nbsp;</td>
                  <td style={cell}>&nbsp;</td>
                  <td style={cell}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      {isGroup && (
        <Section title="🤔 小組討論題（請寫下大家的想法）">
          <div style={{ fontSize: 11, marginBottom: 6 }}>
            <strong>Q1.</strong> 我們組裡誰跟誰最像？為什麼？
          </div>
          <Lines count={2} />
          <div style={{ fontSize: 11, marginBottom: 6, marginTop: 10 }}>
            <strong>Q2.</strong> 如果要一起辦校慶活動，怎麼分工最好？
          </div>
          <Lines count={2} />
        </Section>
      )}

      <Section title="🌱 我這學期想練習的一件事">
        <Lines count={2} placeholder="例：我想練習多聽朋友說話 / 練習有計畫地寫作業..." />
      </Section>

      <Section title="🎁 我學到 / 我的疑問 / 想告訴老師家長的話">
        <Lines count={3} />
      </Section>

      {/* 家長簽名（個人版） */}
      {!isGroup && (
        <div style={{ marginTop: 18, padding: 10, border: "1px dashed #888", fontSize: 11 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>💌 家長回饋 (選填)</div>
          <div style={{ marginBottom: 6 }}>看完孩子的反思，您想對他/她說的一句話：</div>
          <div style={{ borderBottom: "1px solid #888", height: 24, marginBottom: 4 }}></div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            家長簽名：______________
          </div>
        </div>
      )}

      {/* 頁腳 */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 6,
          borderTop: "1px solid #ccc",
          fontSize: 9,
          color: "#666",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          {appConfig.siteName} · by {appConfig.teacherName} @ {appConfig.schoolFullName} ・ 玩遊戲拿結果：{appConfig.productionUrl.replace(/^https?:\/\//, "")}/
        </span>
        <span>
          ⚠️ 結果僅供參考，不代表分類好壞
        </span>
      </div>
    </div>
  );
}

const cell = {
  border: "1px solid #888",
  padding: "10px 8px",
  textAlign: "left" as const,
  fontSize: 11,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#ff8364",
          marginBottom: 4,
          borderLeft: "4px solid #ff8364",
          paddingLeft: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function FillBox({ label, width }: { label: string; width: number }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>{label}</div>
      <div
        style={{
          width,
          height: 28,
          borderBottom: "1.5px solid #333",
        }}
      ></div>
    </div>
  );
}

function Lines({ count, placeholder }: { count: number; placeholder?: string }) {
  return (
    <>
      {placeholder && (
        <div style={{ fontSize: 10, color: "#888", marginBottom: 2, fontStyle: "italic" }}>
          {placeholder}
        </div>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 28,
            borderBottom: "1px solid #999",
            marginBottom: 2,
          }}
        ></div>
      ))}
    </>
  );
}
