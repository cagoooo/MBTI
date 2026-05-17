# 🎮 MBTI 校園奇遇記

> 一場互動式校園 RPG，玩 10 分鐘故事知道你的 16 型 MBTI 人格

不是無聊問卷！背起書包走進校園，從開學第一天到校慶大結局，每個選擇都會改變故事走向，最後揭曉你的人格類型。

> 📍 **目前版本：v3.13** ｜ 線上版：<https://cagoooo.github.io/MBTI/>
>
> 🗺️ **完整開發路線圖、未來優化建議、版本歷程都寫在 [ROADMAP.md](./ROADMAP.md)** — 包含 60+ 個依優先級分類的開發建議與評估。
>
> 🏫 **想換成自己的學校嗎？** 跳到下方「給其他學校老師：3 分鐘換成你的學校」一節。

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

## 🏫 給其他學校老師：3 分鐘換成你的學校

這個專案設計成「一鍵 fork 模板」— 你可以把整個故事拿來用，**只需要改一個檔案**就會自動套用到 footer、列印單、投影片、metadata 等所有地方。

### Step 1 — Fork repo
1. 到 <https://github.com/cagoooo/MBTI> 點右上角 **Fork**
2. fork 完會變成 `https://github.com/<你的帳號>/MBTI`

### Step 2 — 改一個檔案
打開 `app.config.ts`，改成你的學校資料：

```ts
const config: AppConfig = {
  schoolFullName: "新北市新店區XX國小",        // ← 改這
  schoolShortName: "XX國小",                  // ← 改這
  teacherName: "王老師",                       // ← 改這
  teacherHomepageUrl: "https://你的教師介紹頁",   // ← 改這
  schoolHomepageUrl: "https://你的學校官網",    // ← 改這
  productionUrl: "https://你的帳號.github.io/MBTI",  // ← 改這
  siteName: "MBTI 校園奇遇記",                 // 站名通常不用改
  siteDescription: "...",                     // 描述通常不用改
  gradeHint: "適用 3-6 年級",
};
```

### Step 3 — 推上去
```bash
git add app.config.ts
git commit -m "🏫 customize: 換成 XX 國小"
git push
```

兩分鐘後 GitHub Actions 會自動部署完成，全站 footer / 列印單 / 投影片都會變成你的學校名 ✨

### Step 4 (進階)：客製化故事內容
- `src/lib/scenes.ts` — 30+ 個校園場景，可以改成你學校的特色
- `src/lib/mbti.ts` — 16 型介紹文案（中文俗稱、職涯）
- `public/icon.svg` + `public/og.png` — favicon 與分享卡
- `src/components/CampusIntro.tsx` — 8 個 NPC 角色設定 (台詞、家庭背景)

### Step 5 (可選)：用班級即時同步功能
這個功能需要自己建一個 Firebase 專案 (免費)：
1. 到 <https://console.firebase.google.com/> 建一個新 project
2. 開 **Realtime Database** (免費額度 1GB / 10GB 流量超夠用)
3. 開 **Authentication → Anonymous** 登入
4. 把專案的 Web app config 加到 GitHub repo Secrets:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   - 其他 NEXT_PUBLIC_FIREBASE_* 欄位
5. 推 commit 觸發部署，班級同步功能會自動啟用

若沒設定也沒關係 — 班級同步會自動隱藏，其他功能正常用。

---

## 📜 授權

教育用途自由使用。若做為教材引用請保留作者署名。歡迎其他學校老師 fork、客製化、推廣。

---

Made with ❤️ by [阿凱老師 ｜ 桃園市龍潭區石門國小](https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5)
