# 🎮 MBTI 校園奇遇記

> 一場互動式校園 RPG，玩 10 分鐘故事知道你的 16 型 MBTI 人格

不是無聊問卷！背起書包走進校園，從開學第一天到校慶大結局，每個選擇都會改變故事走向，最後揭曉你的人格類型。

## ✨ 特色

- 🎭 **30+ 個校園場景** — 開學週、社團博覽會、隊友受傷、霸凌事件、校慶之夜...
- 🌳 **四條支線分流** — 🏃 校隊組 / 🎨 藝術組 / 📚 學術組 / 🤝 友誼組
- 🎯 **16 種結局** — 16 型 MBTI 完整介紹（特質、職涯、相處夥伴）
- 📊 **個人化傾向圖** — 不只給你類型，還顯示 E/I、S/N、T/F、J/P 的傾向強度
- 👨‍🏫 **適合教學用** — 國小語境設計，可用於輔導課、班會、自我探索主題

## 🚀 在地端開發

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 產出 out/ 靜態檔
```

## 🌍 部署到 GitHub Pages

本專案內建 GitHub Actions workflow（`.github/workflows/deploy.yml`），推到 `main` 分支會自動建置與部署。

### 第一次設定（一次性）

1. 把專案推到 GitHub repo（例如 `cagoooo/MBTI`）
2. 到 GitHub repo → **Settings → Pages**
3. **Source** 選 **GitHub Actions**
4. 推 commit 觸發 workflow，網站約 2 分鐘上線

網址會是：`https://<你的帳號>.github.io/<repo-name>/`

> ⚠️ 如果 repo 名稱不是 `<帳號>.github.io`，記得 next.config.mjs 已用 `NEXT_PUBLIC_BASE_PATH` 自動處理子路徑，無須手動設定。

## 🧱 技術堆疊

- **Next.js 15** (App Router, Static Export)
- **React 19**
- **Tailwind CSS 4**
- **Framer Motion 11** — 場景轉場動畫
- **TypeScript 5.7** — 全程型別安全

## 📁 專案結構

```
src/
├── app/                   # Next.js App Router
│   ├── page.tsx           # 首頁
│   ├── game/page.tsx      # 遊戲主畫面 (client component)
│   ├── result/[type]/     # 16 個 MBTI 結果頁 (SSG)
│   ├── types/             # 16 型總覽 + 個別介紹頁
│   └── layout.tsx         # 全域 layout + footer
├── components/
│   ├── Footer.tsx
│   ├── ProgressDots.tsx
│   ├── StrengthBars.tsx   # 從 sessionStorage 讀分數做傾向圖
│   └── HomeToButton.tsx
└── lib/
    ├── types.ts           # 型別定義
    ├── scenes.ts          # 30+ 場景資料 (主要劇本)
    ├── mbti.ts            # 16 型完整介紹
    └── scoring.ts         # 計分邏輯
```

## ✏️ 如何新增 / 改場景

打開 `src/lib/scenes.ts`，找到 `SCENES` 陣列，加入新場景物件：

```ts
{
  id: "my_scene",
  branch: "main",         // 或 "sport" / "art" / "study" / "friend"
  chapter: 3,             // 用於進度條
  bg: "🌳",
  location: "操場・午後",
  speaker: "小明",
  speakerEmoji: "🧑",
  text: ["故事段落 1", "故事段落 2"],
  choices: [
    {
      text: "選項文字",
      emoji: "👍",
      delta: { E: 2, F: 1 },   // 加 E 軸 2 分、F 軸 1 分
      followUp: "選了之後的小回應（會跳出彈窗）",
    },
  ],
  next: "next_scene_id",
}
```

## 🎯 計分規則

每個維度雙端對立加減分：
- `E ↔ I`：外向 ↔ 內向
- `S ↔ N`：實感 ↔ 直覺
- `T ↔ F`：思考 ↔ 情感
- `J ↔ P`：判斷 ↔ 感知

選項裡 `delta: { E: 2 }` 表示這個選擇讓你偏向 E 加 2 分。

## 📜 授權

教育用途自由使用。若做為教材引用請保留作者署名。

---

Made with ❤️ by [阿凱老師 ｜ 桃園市龍潭區石門國小](https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5)
