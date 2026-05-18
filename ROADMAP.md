# 🗺️ MBTI 校園奇遇記 開發路線圖

> 更新日期：2026-05-18
> 目前線上版本：**v3.22**（§次講長 6 週完整教案 — 5 Pack 串成跨課程套餐 + 108 課綱 / SDG / CASEL 三方對應）

---

## 📜 版本歷程

### ✅ v1.0 — 首發上線（2026-05-16）

| 模組 | 細節 |
|---|---|
| 🎭 場景系統 | 34 個校園 RPG 場景（主線 6 + 4 支線各 6 + 結局 4） |
| 🌳 四條支線 | 🏃 校隊 / 🎨 藝術 / 📚 學術 / 🤝 友誼，社團博覽會分流 |
| 🎯 16 型結果頁 | 中文俗稱、超能力、適合職業、最合拍 / 多耐心夥伴、給師長的話 |
| 📊 個人化傾向圖 | E↔I / S↔N / T↔F / J↔P 四軸強度條（從 sessionStorage 算出） |
| 🧬 16 型介紹頁 | `/types/[type]/` 完整 SSG，可從結果頁互連 |
| 💖 阿凱老師署名 | Footer 連到桃園市龍潭區石門國小教師頁 |
| 🚀 GitHub Pages 部署 | workflow 模式，push 即自動更新 |

### ✅ v1.1 — 內容擴充 + 分享 + 修正（2026-05-16 同日）

| 模組 | 細節 |
|---|---|
| ➕ 新增 4 個場景 | 每條支線各 +1（隔壁學校偷拍 / 作品被潑水 / 校刊邀稿 / 匿名信） |
| 📸 ShareButtons | LINE 分享、複製連結、原生分享 API、Email fallback |
| 🪪 計分微調 | 強度條分母從 18 → 22，配合場景數量擴大 |
| 🏫 學校名修正 | Footer 從誤寫的「新明國小」改回「石門國小」+ 寫進跨專案 skill |
| 🌐 OG meta 基本款 | 加上 zh_TW locale、twitter:card、metadataBase |

### ✅ v2.0 — 動畫 + 教學工具大升級（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🎨 CampusIntro 首頁動畫 | 8 個同學依序蹦上場，對話氣泡每 3.2 秒輪播個性台詞 |
| 📊 `/class-stats` 班級統計 | 智慧解析（CSV / 一行一個 / 名字:型），自動產出 16 型分布、四大群、四軸平衡、缺型討論 |
| 🎬 場景翻頁特效 | rotateY 30° + x 100px + scale 0.92 三段組合，1400px perspective |
| 👩‍🏫 老師專用入口 | 首頁底部紫色 CTA 引導到 /class-stats |
| 🐞 修正 | MBTI_GROUPS 加 key 欄位修 TS 編譯錯誤 / .gitignore 排除 Claude session lock |

### ✅ v3.0 — 第一波 5 大功能（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🎵 音效系統 | Web Audio 程序合成 click/pageTurn/reveal/unlock；Pixabay CC0「Kawaii Friends」by ckotty3 當 BGM；浮動 SoundToggle 含靜音 + BGM 開關，localStorage 持久化；淡入淡出避免突兀 |
| 📄 列印結果單 | A4 直式 `<PrintSheet>`：姓名欄/MBTI 大字/四軸條/超能力/家長話/學生反思填答區；@media print + .print-hide / .screen-only 切換 |
| 🤝 `/match` 配對工具 | 兩人配對：256 組合規則計算（互補 +/同調 +/黃金配對 +12），20~98 分；給合拍指數、相處模式、衝突點、溝通建議、適合一起做；「全班配對」模式找出每個人最合拍同學 |
| 🏆 成就徽章系統 | localStorage 紀錄 unlockedTypes/branchesPlayed/daysPlayed；16 格徽章牆（未解鎖灰、新解鎖 NEW 標籤）；里程碑 4/8/12/16 解鎖慶祝；特殊徽章「校園全才」+「全勤達人」；Toast 動畫 + unlock 音效 |
| 📥 統計頁匯出 | 「列印 / 另存 PDF」按鈕；「複製文字版」(含 ASCII bar chart)；放棄 PNG 下載改用瀏覽器內建截圖（避開中文 tofu 雷） |

### ✅ v3.1 — 全站按鈕音效大升級（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🎵 加 6 種新音效類型 | tap (輕點) / pop (Q 彈) / whoosh (過場) / coin (完成) / toggleOn / toggleOff，共計 10 種 |
| 🧩 SoundButton / SoundLink 包裝元件 | 全站按鈕一鍵套用音效，未來新按鈕自動有音效不會漏 |
| 🔄 全站按鈕音效對應 | 主 CTA → click；次要 → tap；切換 → pop；完成 → coin；過場 → whoosh；On/Off → toggleOn/Off |

### ✅ v3.2 — Pixabay CC0 真實音效 mp3（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🎶 10 種 SFX 全換真實 mp3 | Marimba Bloop 1/2、Bubble Pop、Page Turn、Cute Level Up 2/3、UI Digital Coin、Cartoony Whoosh、Menu Select、UI Cancel；total 1.19 MB |
| 🏗️ sound.ts 重構 | 從 Web Audio oscillator 改 HTML5 Audio + pool 模式（每種 3 個 instance 連點不打斷）；預載入策略；每種音效獨立 base volume |
| 📜 新 skill | `pixabay-audio-asset-pipeline` 固化「Chrome MCP 自動抓 + PowerShell 下載 + sound.ts 整合」工作流，未來會自動觸發 |

### ✅ v3.3 — 多 track BGM 系統（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🐛 修 bug | 首頁進遊戲 BGM 被關掉 — 根因：BgMusicMount unmount 時 stopBgm + 遊戲頁沒 withBgm |
| 🎼 三條 BGM | home (Kawaii Friends 4.7MB) / game (Playful Kids Toys 2.9MB) / result (The Fun Starts Here 3.5MB) |
| 🔀 自動 cross-fade | 切頁時舊曲淡出 900ms + 新曲淡入 1600ms 同時進行 |
| 🧩 BgmController | 各頁宣告 `<BgmController track="..." />`，SoundToggle 移到 layout 全站共用 |

### ✅ v3.4 — SW 版本通知機制（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🤖 自動版本生成 | `scripts/gen-version.mjs` prebuild 跑，commit hash + UTC time |
| 🛠️ Service Worker | network-first HTML / cache-first hashed assets + audio；skipWaiting + clients.claim |
| 🔔 版本檢查 + Banner | 首次延遲 30s + 每 5min + window focus 三層 fetch version.json；不同就跳綠色 Banner |
| ✨ 立刻更新 | 清 caches + reload with timestamp，杜絕 ChunkLoadError |
| 📍 Footer 版本號 | 小字顯示 `v20260517-XXXX-hash`，方便 debug 截圖回報 |

### ✅ v3.5 — TTS 語音導讀（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🗣️ Web Speech API | 瀏覽器原生 TTS，無 API key、無後端、零延遲、離線可用 |
| 🇹🇼 自動挑最佳中文聲音 | Google 國語(台灣) → Microsoft 曉雨/雅婷 → 任何 zh-TW → 任何 zh-* |
| 🎛️ SoundToggle 第三顆按鈕 | 🤐 / 🗣️ TTS 開關，開啟時琥珀色 ring 強調 |
| 🎮 遊戲頁自動朗讀 | 場景切換 350ms 後自動唸 (location + speaker + text)；followUp modal 也唸 |
| 🔊 場景文字旁按鈕 | 🔊 再唸一次 / ⏸ 停止；切場景自動 cancel 前一段 |
| 🎯 教學效益 | 識字弱的學生、視覺疲勞、大班教學投影外放都好用 |

### ✅ v3.6 ~ v3.10（2026-05-17 同日連續上線）

| 版本 | 重點 |
|---|---|
| v3.6 | 🎶 四條支線專屬 BGM — 每條路徑換不同音樂個性 |
| v3.7 | 🎓 班級即時同步（Firebase RTDB）+ 投影模式 + 結束自動匯出 |
| v3.8 | ✨ SettingsPanel — 字級縮放 + TTS 語速 + PWA 安裝按鈕 |
| 額外 | 🎨 專屬 favicon + LINE/FB 社群分享 OG 卡（中文字） |
| v3.9 | 🔠 注音標示 — 一、二年級也能自己讀（build-time pinyin → 注音 map） |
| v3.10 | 📋 A4 反思學習單 + 🎬 10 張教學投影片（老師備課直接用） |

### ✅ v3.11 — 多元家庭情境 + NPC 個性化 TTS（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🎒 #7 多元家庭情境 (SDGs) | CampusIntro 八個 NPC 各加第二輪台詞自然帶到家庭背景：隔代教養（雅雯·奶奶）/ 新住民第二代（阿哲·越南爸爸）/ 同志家庭（凱莉·兩個媽媽）/ 大家庭（婷婷·三個弟妹）/ 單親（小傑·爸爸）/ 聽障家人（宇航·爺爺手語）；對話氣泡每輪走完八人才翻到第二輪，自然不說教 |
| 🎒 friend_04 改寫 | 阿哲煩惱從「爸媽吵架」→「越南爸爸想接外婆來台，媽媽不願意 + 學校口音被笑」，文化磨合更真實 |
| 🎭 #37 NPC 不同 TTS 聲音 | tts.ts 新增 25 個角色 VOICE_PROFILES（pitch + rate），對應 MBTI 個性：ENFP 高活潑 / INTJ 沉穩慢 / ESTP 衝快 / INFJ 溫柔輕語 / ENTJ 沉穩有力；旁白「你的內心 / 你的肚子 / 你」自動套用標準聲音 |
| 🔧 speakScene 自動套 profile | 場景傳入 speaker，自動帶該角色 pitch/rate 給 speak()，遊戲頁不用改一行 |
| 🎯 教學效益 | 多元家庭融入像同班同學自然分享；NPC 有聲音辨識度，孩子記角色更深 |

### 🐛 v3.11.1 — 注音版本誤產拼音熱修（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🔧 根因 | `pinyin` v4 拿掉 `STYLE_BOPOMOFO` 常數（v2/v3 才有），舊腳本傳 `style: 8` 被 fallback 成預設拼音樣式 → 線上注音全變羅馬拼音 "xīn jiào shì" |
| 🛠️ 修正 | 加 `pinyin-zhuyin` 套件，改兩段式：pinyin v4 → 帶聲調拼音 → pinyin-zhuyin 轉注音 |
| ✅ 防護 | 腳本最後加 sanity check 抽樣印「新→ㄒㄧㄣ」確保未來再壞會立刻發現 |

### 🔄 v3.11.2 — SW 更新通知踩坑大整治（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🐛 根因盤點（6 個共犯） | (1) sw.js 內容永遠不變 → 瀏覽器從不偵測為更新；(2) SwRegister 沒監聽 SW lifecycle 事件；(3) GitHub Pages CDN cache 10 分鐘，`?t=` 對 GitHub CDN 無效；(4) `register()` 沒帶 `updateViaCache: "none"`；(5) 初次檢查延遲 30 秒太久；(6) 只監聽 `focus`，沒 `visibilitychange`/`pageshow`/`online` |
| 🔧 sw.js 動態 BUILD_VERSION 注入 | 留 `__BUILD_VERSION__` 占位字串，`gen-version.mjs` prebuild regex 替換成實際版號 → 每次 build sw.js byte 必變 → 瀏覽器 100% 偵測到更新；`CACHE_VERSION = mbti-${BUILD_VERSION}` 動態組 → activate 時舊 cache 必清 |
| 🔧 SwRegister 雙線偵測 | 線 A (SW lifecycle，最可靠): `updatefound` + `statechange === "installed"` + SW activate 時 `postMessage({type:"SW_ACTIVATED"})` 通知所有 clients；線 B (polling 備胎): 首次 5 秒 + 每 3 分鐘 + `focus`/`visibilitychange`/`pageshow` (BFCache)/`online` 多 trigger |
| 📜 知識沉澱 | 寫進 `~/.claude/skills/pwa-cache-bust/SKILL.md` 陪坑 #12-14 + 新增「Next.js 動態 sw.js BUILD_VERSION 注入法」完整 template |

### ✅ v3.12 — RWD 全面優化（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🚨 浮動 UI 群組陪坑 | 新增 `.floating-bottom-right` utility 同時處理 `env(safe-area-inset-bottom/right)` → iPhone 瀏海 / Android 手勢列不會擋按鈕；`.has-floating-ui` (padding-bottom 80px+safe-area) 套到全部 10 個頁面 → 最後一行不再被浮動按鈕擋；SettingsPanel 開啟時加 backdrop (手機 only)，點外面可關 |
| 📝 注音模式致命 bug 修復 | 原本用 `body:has(ruby) p` 選擇器 — **iOS Safari 15 以下完全不支援**！老 iPad 注音模式整個 broken。改用 `html.zhuyin-on` class，layout.tsx inline script 在 client render 前就注入避免 FOUC |
| 📝 注音三層行高細分 | 閱讀型內容 (p/li/.zhuyin-spaced) line-height 2.1 / 按鈕 (.choice-option) 1.85 / chip-pill-rounded-full 1.75；rt 字級用 `clamp(0.5em, ..., 0.55em)` 手機保證可讀；ruby 加 `white-space: nowrap` 防漢字+注音被斷行拆開；rt 加 `user-select: none` 防選取干擾 |
| 📝 設定面板即時更新 | RubyText 改聽 `mbti-settings-change` CustomEvent，移除 1.5s polling → toggle 後立刻換 ruby |
| 📐 CampusIntro 手機優化 | gap-2 → gap-1.5、px-3 → px-2 緊湊；學生名字+type 加 `leading-tight no-zhuyin-spacing`；對話氣泡 max-w-md → `w-[min(90vw,28rem)]` 小手機不貼邊 |
| 🎮 遊戲頁手機優化 | 場景卡 p-8 → p-4 sm:p-8；場景背景 emoji text-9xl → text-6xl sm:text-9xl；翻頁脊邊 w-12 → w-4 sm:w-12；選項 min-h-[56px] 國小生大拇指好點，emoji shrink-0 + 文字 min-w-0 避免溢出，加 active:bg-cream mobile tap feedback |
| ⬆️ SwUpdateBanner | top-4 → `calc(env(safe-area-inset-top) + 0.75rem)` iPhone 瀏海正確避讓 |

### ✅ v3.13 — 五項一次到位（2026-05-17）

> 阿凱老師推薦的「下週優先 5 項」一次全做完，分 5 個 Phase 連續部署。

#### 🥇 Phase 1 — B2 課前/課後自我評估對照
| 模組 | 細節 |
|---|---|
| 📋 課前快測 | 進遊戲前 4 題快選 (EI/SN/TF/JP 各 1 題情境) 8 秒做完；可跳過 |
| 🎯 結果頁對照卡 | 「課前猜測 vs 課後結果」並排 + 4 軸詳細比對 (綠對/紅換) |
| 💬 5 種文案 | 完全猜中 (4/4) / 幾乎全中 (3/4) / 中一半 (2/4) / 跟想像不同 (1/4) / 完全顛覆 (0/4) |
| 📁 新檔案 | `src/lib/pretest.ts` + `PretestQuiz.tsx` + `PretestCompare.tsx` |

#### 🏫 Phase 2 — G1 一鍵 fork 模板
| 模組 | 細節 |
|---|---|
| ⚙️ app.config.ts | 集中所有學校 / 老師 / 站名 / URL 資訊到單一檔案 |
| 🔄 8 個地方串 config | Footer / layout metadata + OG / slides / teacher new / worksheet / PrintSheet / StatsExport |
| 📜 README 教學 | 「給其他學校老師：3 分鐘換成你的學校」5 步驟完整教學 (含 Firebase 可選步驟) |
| 🌍 影響力 | 其他學校 fork → 改 1 個檔 → push → 自動部署，整個下午幫全國老師加值 |

#### 📈 Phase 3 — B1 班級 MBTI 動態歷史
| 模組 | 細節 |
|---|---|
| 🗃️ RTDB schema | 新增 `classHistory/{teacherUid}/{sessionId}` 路徑；SessionSnapshot interface 含時間/房號/標籤/16型分布/4軸統計/學生名單 |
| 🔄 endRoom() 自動串 | 老師結束會議時自動 saveSessionToHistory snapshot；失敗不阻塞 endRoom |
| 📊 老師歷史頁 `/teacher/history` | 訂閱 subscribeTeacherHistory 即時更新；4 軸趨勢圖 (純 SVG 折線，2 場以上才顯示) |
| 📋 展開卡內容 | 16 型完整分布 4×4 grid + 4 軸偏好條 + 學生名單 chips + 「看詳細統計」連結回 /class-stats |
| 🏠 首頁入口 | 加「📈 班級活動歷史」CTA (fuchsia 色，跟班級統計同列) |

#### ✨ Phase 4 — C1 Gemini 個人化分析
| 模組 | 細節 |
|---|---|
| 🤖 架構 | referer-限制 client key (純前端，無後端)；gemini-2.0-flash 模型；free tier 1500 req/day |
| 🔐 安全策略 | Google Cloud Console 把 API key 限定只能從 `https://cagoooo.github.io/*` 呼叫；別人偷 key 也無法用 |
| 💬 prompt 設計 | 國小老師口吻 + 3 段結構 (你是這樣的人 / 你的超能力 / 給你的小提醒) + 避免絕對化用詞 |
| 🎁 加分上下文 | 把 pretest guess + 走的支線 (校隊/藝術/學術/友誼) 都納入 prompt 給 AI |
| 🖼️ UI | 不自動觸發 (省額度)；骨架屏 loading；sessionStorage 快取 (同型同 session 不重打)；「換一段」regenerate |
| ⚙️ 啟用步驟 | (1) aistudio.google.com 拿 key → (2) Cloud Console 限 HTTP referer → (3) GitHub Secrets 加 NEXT_PUBLIC_GEMINI_API_KEY → (4) 部署 |

#### 🎨 Phase 5 — A1+A2 SVG 視覺升級
| 模組 | 細節 |
|---|---|
| 👤 A2 — 8 個 NPC SVG 大頭貼 | 純 SVG 1KB/角色，每個獨特造型對應 MBTI 個性：小芸黃馬尾笑眼 / 阿哲眼鏡冷靜 / 小傑頭帶蓬髮 / 雅雯月亮髮飾 / 宇航貝雷帽畫筆 / 凱莉王冠馬尾 / 小宇西瓜頭呆毛 / 婷婷雙包頭蝴蝶結 |
| 🎭 應用 | CampusIntro 學生格子 (取代 emoji 圓圈) + 對話氣泡頭像 + 遊戲頁 speaker (若是 8 主角之一) |
| 🏞️ A1 — 7 種場景背景 SVG | 依 location 關鍵字自動偵測：classroom / sports / artroom / hallway / hall / library / outdoor |
| 🎨 整合 | 半透明 (opacity 40%) 放卡片底不影響閱讀；場景 emoji 縮成右上角小圓貼紙 |
| 💾 大小 | 純內聯 SVG 零外部資源請求；vs PNG 省 ~120KB |

### 🐛 v3.13.1 — 極窄寬度 (≤380px) 跑版整治（2026-05-17）

| 模組 | 細節 |
|---|---|
| 🐛 問題 | 使用者回報：窗寬約 300-350px 注音模式下選項按鈕字距「散散的」；每個 ruby (漢字+注音) `white-space:nowrap` 佔較寬 box，加上 leading 1.85 + p-3.5 + emoji text-xl 累積擁擠 |
| 🔧 強制左對齊 | `.choice-option / .zhuyin-spaced` 加 `text-align: start + text-align-last: start + word-break: break-word` (Chrome 偶會自動 justify CJK) |
| 📐 380px media query | rt 字級 0.5em → 0.46em + letter-spacing -1px；選項 padding 0.875rem → 0.625rem + min-height 56px → 48px；內文 font-size 14px → 13px；注音 line-height 1.85 → 1.7；浮動按鈕 44×44 → 40×40 |
| 📐 320px media query (iPhone SE 老款補強) | rt 再壓到 0.44em；選項 padding 再小 0.5rem |
| 🎮 game/page.tsx | 選項 emoji 加 `mt-0.5 leading-none` 對齊；加 `break-words`；場景貼紙縮 w-12 → w-10 |

### ✅ v3.14 — SEL + 結局動畫 + 班級互動遊戲（2026-05-17）

> 「SEL 社會情緒學習」教育部當前重點 + 結局儀式感 + 班級互動殺手鐧三項一次到位。

#### 🌧️ Phase 1 — N4 SEL 逆境特別篇（核心，老師超想要）

| 模組 | 細節 |
|---|---|
| 📚 教育架構 | 參考 CASEL 5 大能力 + 兒福聯盟兒少情緒能力指標 + 108 課綱「身心素質與自我精進」素養 |
| 😢 6 個情緒情境 | 被誤會 (友誼衝突) / 失敗 (自我挫折) / 被排擠 (同儕關係) / 難過 (失去) / 生氣 (不公平) / 害怕 (預期壓力) — 涵蓋國小最常見 |
| 🌸 4 軸因應策略 | Express 表達情緒 / Solve 解決問題 / Calm 自我安撫 / Connect 尋求支持 — Coping Strategies Inventory 簡化版 |
| 🎯 4 種結果風格 | 表達型 / 思考型 / 安撫型 / 連結型；每個完整資料：描述 + 4 項優勢 + 「也試試看」鼓勵發展 + **5 個專屬情緒工具箱** + 互補搭檔 + 給家長/老師的話 |
| 🛠️ 工具箱範例 | 表達型：📓 情緒日記本 / 🎨 畫情緒色 / 💬「我訊息」句型 / 🎵 情緒歌單 / 📞 可亂講的好朋友 |
| 🔄 流程 | 單頁 state machine (intro → 6 scenes → result)，每場 followUp modal 肯定話 ("沒有對錯" 教育精神貫穿) |
| 🎨 UI | 紫色主題 (跟 MBTI 紅色主題區隔)；4 軸強度條動畫；TTS / 注音 / 字級 / RWD 全支援 |
| 🚪 入口 | 首頁 Hero CTA「🌧️ SEL 情緒特別篇 NEW」+ 老師區獨立橫幅標「教育部當前重點」 |
| 📁 新檔案 | `src/lib/sel.ts` (350 行資料 + 計分) + `src/app/sel/page.tsx` + `src/app/sel/layout.tsx` |

#### 🎬 Phase 2 — J2 16 型專屬結局慶祝動畫

| 模組 | 細節 |
|---|---|
| 🎨 設計原則 | 依群組性格決定動畫風格：NT 幾何規律 / NF 心型飄渺 / SJ 穩定 / SP 動感 |
| ♟️ NT 分析師組 | INTJ ♟️旋轉+✨ / INTP 🔬擺動+❓❗連發 / ENTJ 👑+⚡⚡+🏆 / ENTP 💡晃+💥+🚀飛 |
| 🌙 NF 外交家組 | INFJ 🌙升起+流星 / INFP 🦋S形飛+花飄 / ENFJ 🌟+群眾擁抱 / **ENFP 🌈跳+🎉🎊紙花+⭐**（6 emoji 最熱鬧） |
| 🏆 SJ 守護者組 | ISTJ 📊+✓✓+🏅 / ISFJ 🌷搖+💝💝 / ESTJ 🏆+📋+💪 / ESFJ 🎂+🤗🤗+🎈🎈升空 |
| ⚡ SP 探險家組 | ISTP 🛠️+⚙️⚙️轉 / ISFP 🎨+花瓣+🎵 / **ESTP ⚡+🔥🔥+💥+💪💪**（最熱血）/ ESFP 🎤+💃🕺+✨+🎉 |
| 💾 技術 | `src/components/TypeCelebration.tsx` 用 framer-motion + emoji，純動畫零外部資源；`absolute pointer-events-none` 不影響文字 |
| 🎁 套用 | 結果頁 hero `min-h-[420px]` 確保動畫空間；每 emoji 自己 delay/duration 錯開播放 |

#### 🎲 Phase 3 — L3 猜朋友 MBTI 遊戲模式

| 模組 | 細節 |
|---|---|
| 🎯 教育價值 | 打破刻板印象 + 班級互相認識深化 + 引發「為什麼我會這樣猜？」討論 |
| 📋 流程 | 單頁 state machine：input (貼名單) → guess (1-by-1 16 型 grid) → result (對照 + 統計) |
| 🔄 名單自動帶入 | 從 `/class-stats` 或 `/teacher/history` 的 sessionStorage 自動 prefill |
| 🎵 答題 feedback | 答對 coin 音效 + 綠勾標記；答錯 pop 音效 + 對照標記（你 👈 / 實際 ✅） |
| 💬 4 種結果評語 | ≥80% 🎯 MBTI 大師 / ≥50% 👀 蠻會看的 / ≥25% 🤔 有點意外 / <25% 😅 刻板印象 buster |
| 📊 結果統計 | 整體準確率 + 4 軸個別 (EI/SN/TF/JP) + 「最讓你意外的同學」自動找差最多軸的 + 完整對照表 |
| 🎓 給老師 | 內建反思題建議 (「為什麼你會這樣猜？」「猜錯時印象是不是太單一？」) |
| 🚪 入口 | 首頁老師區橘色按鈕「🎲 猜朋友 MBTI 遊戲」 |
| 📁 新檔案 | `src/app/guess/page.tsx` + `src/app/guess/layout.tsx`；重用 `parse-class.ts` 解析格式 |

### ✅ v3.15 — SEL 完整化 + 三部曲課程包（2026-05-17）

> 阿凱老師推薦的「下週優先 4 項」一次到位，分 4 個 Phase 連續部署。
> 主軸：把 SEL 從基礎升級到完整教學體驗 + 把所有內容串成一節完整輔導課。

#### 🎨 Phase 1 — Q3 SEL 結果頁 4 種風格慶祝動畫
| 模組 | 細節 |
|---|---|
| 🎬 動畫設計 | 4 種風格各自視覺隱喻 (用 framer-motion + emoji)：🌸 表達型 花朵綻放+愛心擴散 / 🧠 思考型 燈泡+雙齒輪+❓→✓ / 🧘 安撫型 月亮升起+雲朵飄 / 🫂 連結型 雙手相握+心線連結+微笑 |
| 💾 技術 | `src/components/SelCelebration.tsx` 純動畫零外部資源；hero min-h-[420px] 確保動畫空間；跟 v3.14 J2 TypeCelebration 同模式 (體驗對齊) |

#### ✨ Phase 2 — R1 Gemini for SEL 個人化情緒處方
| 模組 | 細節 |
|---|---|
| 🤖 prompt 3 段結構 | 🔍 我看見的你 (溫暖肯定描述主導風格) / 🌱 接下來一週可以試試 3 件小事 (具體可執行，**至少 1 件針對最弱軸**鼓勵發展) / 💌 遇到 OO 情境時可以這樣做 (step-by-step 範例) |
| 🗣️ 語氣 | 像愛你的輔導老師輕聲說話，用「試試看」「也可以」不是「應該」 |
| 💾 技術 | `src/lib/gemini.ts` 加 `generateSelPrescription()`；`src/components/SelGeminiPrescription.tsx` 跟 GeminiAnalysis 同模式 (不自動觸發省額度 / sessionStorage 快取 / 「換一份」regenerate) |
| 🚪 位置 | SEL 結果頁工具箱前 (重點位置) |

#### 🆘 Phase 3 — O4 情緒急救卡 PDF (錢包大小)
| 模組 | 細節 |
|---|---|
| 📐 規格 | 標準信用卡尺寸 85.6mm × 53.98mm (CR80)；一張 A4 印 2 張 (學生剪下對折或塑封) |
| 🎴 內容 | 正面：風格 emoji + 名稱 + 一句話 + 漸層色塊；背面：5 個工具箱項目 + 3 個聯絡人空格 (家人/朋友/老師) |
| 💾 技術 | `src/components/EmergencyCard.tsx` 純 @media print + @page A4 控制；不裝 jsPDF 省 200KB bundle；瀏覽器原生「另存 PDF」即可 |

#### 🎒 Phase 4 — S1 自我探索三部曲課程包 (`/journey`)
| 模組 | 細節 |
|---|---|
| 🎯 設計目標 | 把 MBTI + SEL + 猜朋友 串成一節 45 分鐘完整輔導課；老師備課直接用 |
| 📊 主畫面 | Hero 進度條 (0-3 完成數) + 3 大課程卡 (步驟編號 + 完成狀態 + 結果預覽 + 重玩按鈕) |
| 🔄 自動偵測 | 從 sessionStorage 讀各段完成狀態；focus/visibilitychange 觸發 refresh (別頁回來自動更新) |
| 🏆 完成解鎖 | 「自我探索王」徽章 (animated modal) + 綜合報告 (3 段並陳 + AI 綜合詮釋) + 🖨️ 列印 PDF |
| 🎓 給老師備課指南 | ⏱️ 時間規劃 (0-10/10-20/20-30/30-45 min) + 🎯 教學目標 + 💬 4 題反思題建議 |
| 🚪 首頁兩個顯眼入口 | Hero CTA 區大綠色按鈕 + 「老師推薦」紅 badge / 老師區獨立綠色橫幅 + 「2026 新增」標籤 |
| 📁 新檔案 | `src/app/journey/page.tsx` + `src/app/journey/layout.tsx` |
| 🔧 sessionStorage 互通 | SEL 結束存 `mbti-sel-result`；guess 結束存 `mbti-guess-result` (本來 MBTI 已存 `mbti-result`) |

### 🗣️ v3.15.1 — SEL 全套擴充內容加上 TTS 朗讀（2026-05-17）

> 使用者回報「新增擴充內容請加入 TTS 設定，這樣才有趣！」
> 把 v3.15 的 4 項全部串上 TTS，重點是 **AI 處方自動唸出來** — 學生開 TTS 後，AI 寫的個人化建議會像老師輕聲在旁邊說。

| 模組 | 細節 |
|---|---|
| 🌧️ SEL intro | 進場自動唸引言 4 句暖場 (「逆境裡的你會怎麼接住自己？」) |
| 🌧️ SEL result | 進場自動唸 hero (風格+一句話+描述)；hero 加 🔊 再唸一次 + ⏸ 停止；工具箱加 🔊 唸出我的 5 個工具 |
| ✨ SelGeminiPrescription (最有戲) | AI 處方生成完成**自動朗讀**；智能清掉 emoji + markdown 符號避免 TTS 念出 `*` `#`；加 🔊「唸給我聽」+ ⏸ 按鈕 |
| 🆘 EmergencyCard | 加 🔊 按鈕念出「我是 OO 型 + 5 個工具 + 緊急聯絡提醒」 |
| 🎒 Journey 三部曲 | 進場自動唸 hero + 動態提示「你已完成 X 段」；徽章打開時自動朗讀祝賀；綜合報告區加 🔊 唸給我聽完整綜合詮釋 |
| ✨ GeminiAnalysis (MBTI 順手升級) | 跟 SelGeminiPrescription 同模式：生成自動朗讀 + 🔊 按鈕 |
| 🔧 技術細節 | 所有 widget 統一聽 `mbti-settings-change` CustomEvent → 即時感知 TTS 開關切換 (不用刷新)；`speakResult()` 統一清 emoji + markdown 符號；沒開 TTS 時所有 🔊 按鈕完全不顯示 (不污染 UI) |
| 🎯 教學情境 | 大班教學廣播 / 識字弱學生跟讀 / 視力疲勞閉眼聽 / 低年級注音+TTS 雙重輔助 / 特教學障無障礙必備 |

### ✅ v3.16 — 四項一次到位（2026-05-17）

> 阿凱老師推薦的「下週優先 4 項」一次全做完，分 4 個 Phase 連續部署。
> 主軸：**學生紀錄 + 老師 AI + 老師工具整合 + 班級 SEL 同步** — 把整個生態系串成完整課程閉環。

#### 📓 Phase 1 — U1 我的學習歷程冊 (`/me`)
| 模組 | 細節 |
|---|---|
| 🗃️ 資料層 | `src/lib/history.ts` 跨 session localStorage 紀錄；HistoryEntry 三種 discriminated union (MBTI/SEL/Guess)；CRUD + 統計 helper；FIFO 上限 100 筆 |
| 📊 主頁面 | `src/app/me/page.tsx` 統計卡 (跑過 N 次 + 變化次數) / MBTI 變化軌跡 (→ 同型 ≠ 變了 視覺) / SEL 變化軌跡 / 時間軸依月份分群 |
| 🛠️ 操作 | 🔊 唸給我聽 (整體 overview) / 🖨️ 列印 A4 學期成長紀錄 / 🗑️ 一鍵刪除 (雙重確認) |
| 🔌 結束點串接 | game/page.tsx (含 pretest 對應數) + sel/page.tsx + guess/page.tsx (含 4 軸統計) 都加 addHistory() |
| 🔒 隱私 | 純前端 localStorage，老師看不到，只有學生本人；零後端、零追蹤 |
| 🏠 入口 | 首頁 Hero CTA 區「📓 我的學習歷程冊」白底琥珀邊按鈕 (跟三部曲並排) |

#### ✨ Phase 2 — W1 AI 班級洞察報告 (家長日神器)
| 模組 | 細節 |
|---|---|
| 🤖 Gemini prompt | 4 段結構：🎭 班級整體個性 (從主要型 + 軸比例) / 🤝 3 個合作建議 / ⚠️ 2 個潛在衝突提示 / 🎯 推薦下次活動 |
| 🗣️ 語氣 | 像資深老師跟同事/家長分享觀察，不下標籤、用具體情境取代抽象描述 |
| 💾 技術 | `src/lib/gemini.ts` 加 generateClassInsight()；`src/components/ClassInsightReport.tsx` 完整 Modal |
| 🎁 功能 | 不自動觸發 (省額度) / **localStorage 跨 session 快取** (老師重訪可看) / 生成自動朗讀 / 列印 PDF / 重新生成 |
| 🚪 套用 | `/teacher/history` 每筆 session 動作列加 ✨「AI 寫家長日報告」按鈕 |
| 💡 教學情境 | 老師期末家長日前一晚跑一次 → 300 字班級分析直接放報告；TTS 開大聲在家長面前朗讀更有臨場感 |

#### 🎓 Phase 3 — X1 老師個人 dashboard (`/teacher/dashboard`)
| 模組 | 細節 |
|---|---|
| 📊 Hero 4 大數字 | 總活動次數 (+ 30 天內) / 完成人次 (+ 總到場) / 最常出現型 (+ 人次) / 型別總數 (/ 16) |
| 📅 最近 5 次活動 | 依時間倒序，配 top type emoji，快速進入歷史 |
| 📊 4 軸總平均 | bar chart 左右雙色顯示全校累積 E/I/S/N/T/F/J/P 比例 |
| 🌟 全校 16 型分布 | 4×4 grid，最高分自動 highlight 金色 ring |
| 🛠️ 老師工具箱 | 8 個 ToolCard：建房間 / 班級歷史 / 班級統計 / 猜朋友 / 三部曲 / SEL / 投影片 / 學習單 (含 NEW AI / 課程包 / SEL 等 badge) |
| 🚪 入口 | 首頁老師區「老師 dashboard（一頁看完）」紫色按鈕 + NEW badge 在最上 |
| 🎓 設計目標 | 一頁 = 一杯咖啡時間了解班級狀況；跟 `/me` (學生個人) 形成配對 |

#### 🌧️ Phase 4 — O2 SEL 班級即時同步
| 模組 | 細節 |
|---|---|
| 🔧 RTDB schema | RoomMeta 加 `mode: "mbti" \| "sel"` (預設 mbti 向後相容)；StudentEntry 加 selSceneIdx / selScores / selStyle |
| 🛠️ Helper | `updateSelProgress()` (學生 SEL 進度上傳) / `setStudentSelStyle()` (完成上傳最終風格) |
| 🗂️ SessionSnapshot 擴 | mode 欄位 / selStyleDistribution / selStudents；saveSessionToHistory() 依 mode 分支存不同統計 |
| 🏠 `/teacher/new` | 加「📚 活動類型」2 大選項：🎒 MBTI (預設 10 分鐘) / 🌧️ SEL (推薦輔導課 8 分鐘) |
| 🚪 `/join` | 加入後依 room.meta.mode 自動 redirect 到 `/game` or `/sel?room=XX` |
| 🌧️ `/sel` | Suspense + useSearchParams 接 ?room；班級模式 hook：上傳 progress + 結束上傳 finalStyle；hero 加「🎓 班級 SEL 模式」badge |
| 📊 `/teacher/history` | session 卡顯示 🎒 MBTI / 🌧️ SEL badge；SEL session 顯示 4 風格分布 chips |
| 🎯 完整流程閉環 | 老師建 SEL 房 → 學生加入 → 自動跑 SEL → 結束 snapshot → 老師看 AI 報告 |

### ✅ v3.17 — 校園手帳設計系統大改造 + Google OAuth（2026-05-18）

> 整週的兩大主軸：(A) 視覺重設計（紙感 + 電玩 HUD 雙風格）9 個 phase + 5 頁深化；(B) 老師資料雲端同步（Google OAuth + 跨裝置）+ 3 個 production bug 修補。

#### 🎨 Phase 1-9 — 設計系統「校園手帳 + 電玩 HUD」雙風格重設計

| 模組 | 細節 |
|---|---|
| 🎨 設計風格定調 | Foundation: 米色紙底 + 紅縱線格 + 三圓點裝飾；Headlines: Noto Serif TC 900；Handwritten: Ma Shan Zheng；HUD: JetBrains Mono 11px letter-spacing 4 |
| 📐 design system class | `.container-paper` / `.nav-design` / `.feature-card` / `.bracket-frame` / `.tape` (washi) / `.polaroid` / `.pin` / `.btn-start` / `.btn-secondary` / `.section-header` / `.stat-bar` / `.hud` (~ 1100 行) |
| 🏠 Phase 1-3 Foundation+Footer+Homepage | 全站底 `body::before` 紅縱線 + `body::after` 三圓點裝飾 / 新版 SiteNav (VOL · 01 logo + 5 連結 + 黑底 START CTA) / 首頁 hero serif 大字 + 手寫 kicker + HUD stats strip + QuestCard bracket-frame 三個編號卡 |
| 📚 Phase 4 圖鑑 | /types 翻開圖鑑感 + group band (NT/NF/SJ/SP 四色) + type-mini grid 16 格；/types/[type] type-detail-frame 大封面 + 數據條 + 寬解析 sections |
| 🎮 Phase 5 遊戲頁 | 加 SiteNav + RPG HUD bar (chapter dots + progress + restart) + .stage / .scene-dialogue / .choice-scene 場景包裝 |
| 🌐 Phase 6-9 全站套用 | 所有頁面 (sel/guess/match/me/journey/teacher/dashboard 等) 一致套用 SiteNav + container-paper 紙感容器 |

#### 🎨 Phase Subset — 細部頁面深化（5 頁）

| 頁面 | 細節 |
|---|---|
| 🎮 game-scene 深化 | `.stage` (場景外框 + chapter sticker)；`.scene-dialogue` (主對話框 + npc-avatar 圓貼)；`.choice-scene` (選項 + ESC 風 prompt 數字 + emoji 翻牌)；`.continue-btn` (彈簧按鈕) |
| 🆘 emergency-card 重設計 | 風格 emoji + 名稱 + 5 工具 + 3 聯絡人空格的「校園手帳信用卡」設計 |
| 🎲 guess.html 深化 | `.phase-bar` (3 階段視覺化進度) + `.roster-box` (名單編輯區紙感卡) + `.person-card` (大頭像 + 名字)+ `.type-pick` (16 型 grid 含 emoji + code + nick) + `.score-display` (動態結果統計) |
| 📊 class-stats.html 深化 | 校園手帳統計報告風 — section-header + group-band 四色 + 16 型分布 + 4 軸條 + 缺型討論卡 |
| 🎓 teacher-room 深化 | `.room-card-head/body` (即時房間任務控制台) + 大房號顯示 + KPI 4 卡 + student-grid 即時狀態 + pin-scene-bar 投票分布 |
| 🎬 slides.html 深化 | 10 張校園手帳投影片：今天課程 / MBTI 是什麼 / QR code 加入 / 班級結果引導 / 結尾回家作業；全螢幕 deck mode + 進度條 |

#### 🗣️ v3.17.3 — TTS 暫停/繼續 + SiteNav 老師入口

| 模組 | 細節 |
|---|---|
| ⏸️ TTS pause/resume | `lib/tts.ts` 加 `pause()` / `resume()` / `isPaused()` / `subscribeStatus()` (250ms polling 因為 Web Speech API 沒 onpause global event) |
| 🎛️ TTS toolbar 元件 | 主按鈕 smart toggle (🔊 唸給我聽 ↔ ⏸ 暫停 ↔ ▶ 繼續播放) + 「從頭」/「停止」次要按鈕 + 即時狀態指示燈 |
| 🔄 game/page + sel/page | 兩頁都掛上同一個 TTS toolbar，故事閱讀體驗一致 |
| 👩‍🏫 SiteNav 加老師入口 | 新增「👩‍🏫 老師」連結 → `/teacher/dashboard`，isActive 邏輯涵蓋所有 `/teacher/*` 子頁 |

#### 🔑 v3.17.4 — Google OAuth 跨裝置同步老師班級資料

| 模組 | 細節 |
|---|---|
| 🔐 Firebase 升級 | `lib/firebase.ts` 新增 `signInWithGoogle()` / `signOut()` / `subscribeAuth()` / `getCurrentUser()` |
| 🔄 anonymous → Google 無痛升級 | 用 `linkWithPopup` — **uid 保持不變**！之前匿名建的 classHistory / 房間擁有權自動繼承到 Google 帳號 |
| 🔧 衝突處理 | 若 Google 已綁別 uid (`auth/credential-already-in-use`) → fall back 到 `signInWithPopup` 切換到 Google uid |
| 🎨 TeacherLoginButton 新元件 | compact 變體 → SiteNav 右側（小頭像下拉 / 「🔑 老師登入」按鈕）；full 變體 → /teacher/dashboard 頂端（跨裝置同步說明卡） |
| 🌐 Authorized Domains 自動化 | 用 Identity Toolkit API + gcloud 確認 cagoooo.github.io 已在 Firebase Auth authorized domains |
| 📜 啟用步驟 | 使用者需手動到 Firebase Console 啟用 Google provider（Identity Toolkit API 需 OAuth client，只能 Console 點一鍵建立） |
| 🎯 教學效益 | 老師教室 PC / 家裡筆電 / iPad 都能看自己班級歷史，不再被綁死在單一瀏覽器 |

#### 🐛 v3.17.5 — React #418 hydration mismatch 修

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | 啟用 Google OAuth 後使用者 dashboard 看到動畫閃一下、console 噴 `Minified React error #418` |
| 🔍 根因 | dashboard / history 兩頁面 render 階段直接呼叫 `isFirebaseAvailable()`，SSG (no window) = false → 渲染 ⚠️ Firebase 警告，client (有 window + env) = true → 不渲染 → server/client HTML 不一致 → hydration bail-out |
| 🛠️ 修法 | 加 `mounted` state，warning gate 在 `mounted && !isFirebaseAvailable()`，讓 SSG / 首次 hydration 都不渲染警告 → 一致 → no mismatch |
| 📜 新 skill | `nextjs-ssg-hydration-window-check` 固化進 `~/.claude/skills/` — 下次寫 client-only condition 自動觸發 |

#### 🎨 v3.17.6 — .feature-card overflow:hidden 把標籤剪掉

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | 首頁 More 區塊兩張卡（SEL / 三部曲）頂端 `top: -16px` 突出的 `🌧️ SPECIAL · EPISODE` / `🎒 COURSE · PACK` 標籤被剪掉只露半截 |
| 🔧 修法 | `.feature-card { overflow: visible }`（原本為了 hover transform 用 hidden），角落 emoji 在 padding 內側不需 overflow 限制 |

#### 🔒 v3.17.7 — RTDB rules 跟 client schema drift 修

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | 老師啟用 OAuth 後到 /teacher/new 建立房間，console 噴 `permission_denied`，**所有老師建房 100% 失敗** |
| 🔍 根因 | v3.16 加 SEL 房間模式時 `createRoom()` 寫 `mode: "mbti" \| "sel"` 到 `/rooms/{code}/meta`，但 `database.rules.json` 的 meta validator 沒列 mode 欄位，被 `$other: { ".validate": false }` 全拒，bug 從 v3.16 潛伏 2 個月直到 OAuth 上線老師回測才被發現 |
| 🛠️ 修法 | rules 加 `"mode": { ".validate": "newData.isString() && (newData.val() === 'mbti' \|\| newData.val() === 'sel')" }` + `firebase deploy --only database` 上線 |
| 📜 新 skill | `firebase-rules-client-schema-sync` 固化 — 下次寫 createX() 加欄位自動觸發提醒同步更新 rules + deploy |

### ✅ v3.18 — 全網站 RWD 大改造（2026-05-18）

> 使用者回報「手機端超級不友善」→ subagent 全網審查 61 項問題分 3 級，分 5 個版號連續修補上線。整輪含 Mobile Menu Drawer 新元件 + globals.css ~200 行系統性 mobile-first 補強 + 3 處 page-level layout 重排 + Chrome MCP iframe 模擬實機驗證。

#### 📱 v3.18 — 主架構：MobileMenuDrawer + globals.css 系統性 mobile breakpoints

| 模組 | 細節 |
|---|---|
| 🍔 MobileMenuDrawer 新元件 | Framer Motion 右側滑入 drawer + 背景遮罩 + ESC 關 + body scroll lock；6 主連結 + Teacher login + CTA 全包；safe-area-inset-top/bottom 處理 iOS 瀏海 |
| 🎨 globals.css 系統性補 ≤640px breakpoints | `.summary-grid` 4→1 欄 / `.kpi-row` 4→2 欄 + clamp 字級 / `.room-code-big` clamp(40, 12vw, 64) / `.type-pick-grid` 4→2 欄 / `.feature-card` padding 32→20 / `.person-card` avatar 140px → clamp(96, 28vw, 140) / `.dialogue-text` padding 縮 / `.tts-toolbar` flex column stack / `.hud` 11px→12px / `.student-grid` 900px→2欄、480px→1欄 / `.container-paper` padding 對稱 + safe-area |
| 📐 iOS input zoom-in 防護 | 全域 `input/select/textarea` 在 ≤768px 強制 16px font-size — 否則 iOS Safari focus 時自動 zoom 整頁且不會 zoom out |
| 📏 100vh → 100dvh | `body::after` 三圓點 + 全域 utility classes 改用 dvh — 解 iOS Safari 工具列覆蓋 100vh 問題 |
| 📱 viewport-fit cover | layout.tsx 加 `viewportFit: "cover"` — 才能讓 `env(safe-area-inset-*)` 正常計算 |
| ♿ 移除 maximumScale:1 | 違反 WCAG 2.5.5 / 1.4.4，視障使用者無法放大網頁 |
| ♿ prefers-reduced-motion | 全域 `@media (prefers-reduced-motion: reduce)` 把動畫降到 0.01ms — 前庭敏感 a11y |
| 👆 .tap-target utility | `min-width: 44px; min-height: 44px` — Apple HIG / Material 推薦最小觸控目標 |
| 🚫 @media (hover: none) 守護 | hover effects (transform / box-shadow) 不在 touch 裝置卡住 |
| 🎯 page-level fixes | result/[type] hero `lg:grid-cols-[1fr_480px]` → `minmax(280px,420px)` / MBTI code clamp 上限 200→140px / slides 控制列 mobile 永遠顯示 / game-hud-bar flex column on mobile + grid 3-col ≥768px |

#### 📱 v3.18.1 — nav md→lg breakpoint + 首頁 layout 修補

| 模組 | 細節 |
|---|---|
| 🍔 Nav breakpoint 從 md (768px) 改 lg (1024px) | md 太低，平板直式 / 手機橫式都會塞 desktop nav 中文直書；lg 才是「桌面寬度足夠塞 6 連結」真實門檻 |
| 🎯 首頁 CTAs 改 `.home-cta-row` class | mobile flex column 全寬 stack，≥640px flex row wrap |
| 📐 HUD stats strip 改 `.home-stats-strip` class | mobile padding 22x18 (原 24x28) + gap 14px 避免 4 欄擠破 |
| 🎨 QuestCard 大數字 96px → clamp(64, 16vw, 96) / 標題 30px → clamp(22, 6vw, 30) | |
| 🔧 .bracket-frame mobile padding 32→20 + overflow:hidden + min-width:0 | 防 EXP bar 溢出 |

#### 🐛 v3.18.2 — CSS specificity 雷 #1：.nav-links 覆蓋 Tailwind .hidden

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | v3.18.1 改了 SiteNav `hidden lg:flex` 但手機還是顯示 6 連結擠成中文直書 |
| 🔍 根因 | globals.css 第 191 行 `.nav-links { display: flex }` 跟 Tailwind `.hidden { display: none }` 同 specificity (0,0,1)，globals.css 後讀贏 → desktop nav 永遠 flex 無視 .hidden |
| 🛠️ 修法 | 把 `.nav-links` 的 display 拿掉，留 gap/align/font，display 完全交給 Tailwind 控制 |
| 🔬 驗證方式 | Chrome MCP javascript_tool 在 iframe (390px) 動態 patch CSS 即時驗證 — desktop nav display:none ✓ |

#### 🐛 v3.18.3 — CSS specificity 雷 #2：.phase-pills 同樣陷阱 + .phase-bar grid

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | /guess scrollWidth 465 > viewport 390 → 水平捲動，phase tracker 撐爆 |
| 🔍 根因 | `.phase-pills { display: flex }` 同樣覆蓋 Tailwind .hidden + `.phase-bar { grid-template-columns: auto 1fr auto }` 3 欄硬塞 mobile |
| 🛠️ 修法 | `.phase-pills` 拿掉 display + `.phase-bar` mobile 改 1fr 單欄、≥lg 才 3 欄 |
| 📜 新 skill | `tailwind-hidden-vs-custom-display-conflict` 固化（一週踩 2 次同雷的教訓）— 內含 grep 全專案 + DevTools 驗證 snippet + 修法 3 選 1 對照 |

#### 🎨 v3.18.4 — slides 頂部工具列也加入手機常願

| 模組 | 細節 |
|---|---|
| 🐛 症狀 | /slides 頂部「離開投影 / 全螢幕」工具列 opacity:0.35 hover 才顯示，手機沒 hover 永遠看不到 + 按鈕被擠成中文直書 |
| 🛠️ 修法 | 加 `.slides-topbar` class 跟 `.slides-controls` 同邏輯 — mobile 常願 opacity:1，`@media (hover:hover) and (min-width:768px)` 才漸顯 |

#### 🧪 v3.18 整輪驗證工作流（重要副產物）

| 工具 | 用途 |
|---|---|
| 🌐 Chrome MCP iframe simulator | 因為 `resize_window` 不可靠（OS 視窗最小寬限制），改用 iframe 注入 `<iframe src="..." width="390" height="720">` 真實 trigger mobile CSS media query |
| 🔬 javascript_tool 跨 iframe inspect | `matchMedia('(max-width: 640px)').matches` + `getComputedStyle(el).display` 跨斷點驗證；可以即時 patch CSS 看是否能解 bug 才正式改原始碼 |
| ✨ 4 頁同框驗證 | 一次注入 4 個 iframe (首頁 / dashboard / guess / teacher/new) 並排截圖，一眼看全網手機狀態 |

### ✅ v3.19 — 第 1-2 週優化批次：PWA + Skill-lint + 跨班總覽 + QR 掃描（2026-05-18）

> 依「下一波最優先」第 1-2 週排程一次到位 4 個項目。重點：**防未來踩雷 (PWA / pre-commit lint)** + **教學現場最大 ROI (跨班總覽 / QR 掃描)**。

#### 📱 AG1 — PWA 完整化（install banner + offline + shortcuts）

| 模組 | 細節 |
|---|---|
| 🎁 PwaInstallBanner 主動邀請 | 第 2 次造訪後 + 上次拒絕 ≥ 7 天 + `beforeinstallprompt` 可用 → 底部 toast 彈出；「立刻安裝」/「之後再說 (7 天不再問)」；已安裝 (display-mode: standalone) 不顯示；跟 SettingsPanel 內被動 install button 並存 |
| 🚧 offline.html fallback page | 紙感 + coral 配色 (跟 design system 一致)；「📡 沒網路也別擔心」+ 學生/老師雙路徑提示；重新連線 / 回首頁兩顆 44px 按鈕；`online` event 自動 reload |
| 🔧 SW 預載 offline.html | install 階段 `cache.add("./offline.html")` 確保斷網時隨時可用；`networkFirst` 失敗 + 找不到快取 + `request.mode === "navigate"` → 回 offline.html |
| 🏠 manifest shortcuts | Android 桌面長按 app icon 出現的快捷選單 4 個：開始冒險 / 16 型圖鑑 / SEL / 老師 Dashboard；學生直接跳遊戲不用打開首頁找 |
| 🎯 教學效益 | 學生主畫面一鍵打開 = native app 感、離線可玩主線 (OAuth/Firebase 功能除外)、老師 demo 不靠網路 |

#### 🤖 AH1 — pre-commit skill-aware lint（3 個固化 skill 自動觸發）

| 模組 | 細節 |
|---|---|
| 🔍 scripts/skill-lint.mjs | 350 行 0 dependency 純 Node.js 寫，跑 < 200ms |
| ✅ Check 1: hydration safety | grep JSX render 內呼叫 `isFirebaseAvailable()` / `typeof window` / `localStorage` 等；上下文判斷不在 useEffect / function 內 → 報 error |
| ✅ Check 2: rules schema sync | 偵測改了 classroom-rtdb.ts / firebase.ts 寫入邏輯但沒同時 stage database.rules.json → 報 warning |
| ✅ Check 3: Tailwind hidden conflict | parse globals.css 找寫死 `display:flex/grid/block` 的 `.className`，grep tsx 找 `className="xxx hidden lg:flex"` 混用 → 互比報 error |
| 🔌 .githooks/pre-commit | shell script call `npm run skill-lint`；`package.json` 加 `prepare` script 自動 `git config core.hooksPath .githooks`（0 額外 install） |
| ⚡ 兩種 mode | staged (預設, 快): `npm run skill-lint`；all (CI 用): `npm run skill-lint:all` 掃全 82 tsx + rules |
| 🧪 已驗證 | 故意 regress `.nav-links { display: flex }` → Check 3 精準抓到 `src/components/SiteNav.tsx:49 ... overrides Tailwind .hidden`；AF1 commit 真的 trigger pre-commit 並 pass 3 個 check |
| 🚪 跳過機制 | `git commit --no-verify` (緊急用) |

#### 🏫 AF1 — 老師端跨班級總覽（一個老師多班）

| 模組 | 細節 |
|---|---|
| 📦 Schema 改動 | `RoomMeta + CreateRoomOptions + SessionSnapshot` 加 `className?: string` (選填，舊房間沒此欄位視為「未分類」) |
| 🔒 database.rules.json | 同步加 `className validator (string && length 1-30)` + `firebase deploy --only database`（依 skill `firebase-rules-client-schema-sync` 紀律） |
| 🏠 /teacher/new | 新增「班級」input 在老師名字底下 (選填) + 最近用過班級 chip 列 (localStorage LRU 上限 8) + 老師名字也順手記憶 |
| 🎓 /teacher/dashboard | 新增「◆ CLASS · FILTER」section 在 hero 下方；班級 chip 列含計數 (🌐 全部 / 班級 A (5) / 班級 B (3)...)；點 chip → 統計卡 / 最近活動 / 4 軸 / 16 型分布全部 reactive 過濾；「未分類」chip 處理舊資料 |
| 📅 /teacher/history | session 卡加 className badge (coral 邊框) 跟 SEL/MBTI mode badge 並列；老師看歷史一眼知道是哪班 |
| 🎯 教學效益 | 一個老師教 3-5 班 / 5-1 班 / 6-2 班 — 每班獨立統計、跨班比較、AI 班級洞察可指定班級；OAuth uid 不變，過去資料自動可分類 |

### ✅ v3.20 — 劇情多元化 Top 10 批次（2026-05-18）

> Subagent 全面審查 1990 行劇情 (scenes + sel + NPC) 找出 35 項多元化缺口,優先做 Top 10 高 ROI 一氣呵成。覆蓋:**現有選項補多元 + 5 個新場景 + futureJobs 升級藍領 + NPC 8→12 補族群/信仰/藍領/身障**。

#### 🌱 #5-8 — 4 個現有場景補「合理但不熱血」選項

| 場景 | 新增選項 | 教育意義 |
|---|---|---|
| **scene_05 (午餐打翻便當)** | 「先回教室吃飯,邊吃邊想要怎麼幫」(I+2 T+1 J+1) | 不是「立刻幫=善良」,「先穩住自己」也是準備 |
| **scene_06 (社團博覽會)** | 「這學期想先觀察,下學期再決定」(I+2 P+1 N+1) | 不是「不選=失敗」,給空白也是能力 |
| **sport_02 (800m 跑步)** | 「我真的不行了 — 慢下來走完,誠實承認不適合長跑」(I+2 T+1) | 「我不擅長」是成熟自我認識,不是放棄 |
| **friend_02 (見到霸凌)** | 「先在不遠處安靜觀察 30 秒,看清楚再決定」(I+2 T+1 N+1) | 內向小孩天然的方式,觀察是為了之後精準行動 |

#### 🆕 #2-4 — 5 個新場景填補主題缺口

| 場景 ID | 主題 | 教育意義 |
|---|---|---|
| **friend_08** 班級 LINE 群組醜照被轉 | 數位足跡 / 未經同意拍照 | 4 種因應 (公開要求刪 / 截圖找老師 / 退群冷靜 / 私訊溝通) |
| **friend_09** 校外教學坐輪椅同學 | 融合教育 / 先問本人 | 「先問你希望我們怎麼做」勝過「替他決定」 |
| **sel_07** 為地球擔心 (海龜影片) | 氣候情緒 (eco-anxiety) | 4 種因應對應 SDG 13/14 — 抒發 / 行動 / 自我安撫 / 找夥伴 |
| **sel_08** 停不下來的手機 | 數位疲憊 / 短影音上癮 | 「製造距離 / 訂目標 / 找夥伴 / 寫日記」國小生最真實的議題 |
| **sel_09** 假訊息引起恐慌 | 媒體素養 / 假訊息辨識 | 「查證 / 冷靜 / 私訊關心阿嬤 / 公開澄清」涵蓋情緒+資訊雙面 |

#### 💼 #9 — futureJobs 16 型每型加 3 個多元職業

擴充「精英職業」之外的可能性,**加藍領 / 照顧型 / 手作型 / 在地型**:
- INTJ: + 城市規劃師 / 棋藝老師 / 農場主
- INTP: + 圖書館員 / 天文觀測員 / 獨立紀錄片導演
- ENTJ: + 工會幹部 / 非營利組織創辦人 / 餐廳老闆
- ENTP: + 桌遊設計師 / YouTuber 知識頻道 / 派對主持
- INFJ: + 繪本作家 / 瑜伽老師 / 安寧療護志工
- INFP: + 詩人 / 手作職人 / 獨立書店店主
- ENFJ: + 婚禮主持 / 社工督導 / 教練
- ENFP: + 幼教老師 / 街頭藝人 / 說書人
- ISTJ: + 護理師 / 檔案管理員 / 宅配司機
- ISFJ: + 長照員 / 烘焙師 / 校護
- ESTJ: + 里長 / 球隊隊長 / 工地監工
- ESFJ: + 美容師 / 婚禮顧問 / 社區關懷員
- ISTP: + 汽車維修師 / 木工師傅 / 潛水教練
- ISFP: + 髮型師 / 寵物美容師 / 陶藝師
- ESTP: + 戶外領隊 / 警察 / 巡山員
- ESFP: + 調酒師 / 街頭藝人 / 兒童才藝老師

#### 👥 #10 + #1 — NPC 8 → 12 補多元背景 + 每人 3 輪台詞

新增 4 個 NPC (對應原本沒展示的型 + 補族群 / 信仰 / 藍領 / 身障):
- **Akiya** 🌿 (INFP) — 阿美族,寒暑假回部落種小米,「Maoasu 早安」/「dafak 跟太陽一起醒來」族語自然帶
- **小恆** ⛪ (ISTJ) — 基督徒家庭,週日上主日學,學鋼琴在詩歌團
- **阿翔** 🔧 (ISTP) — 修車師傅家庭,週末跟爸爸換機油,「手藝是吃不完的本錢」
- **詩晴** 💃 (ESFP) — 坐輪椅,輪椅舞蹈隊縣賽第二名,「校外教學要先問我能不能去」

原 8 個 NPC 也補第 3 輪台詞:
- 小芸 + 客家話「食飽吂?」/ 阿哲 + 越南外婆來台當翻譯 / 小傑 + 貨運司機爸爸 / 雅雯 + 廟裡拜拜
- 宇航 + 教爺爺新手語 / 凱莉 + 各種家庭聚會 / 小宇 + 花生過敏 / 婷婷 + 媽媽便當店工作

CampusIntro 對話輪播從 2 輪改 3 輪 (`% 2` → `% 3`)。

#### 🎯 設計原則 (3 個 agent 黃金法則)

1. **「讓多元成為背景,不是議題本身」** — 不開「多元課」,而是讓 NPC 本來就長這樣
2. **「她是她」優先,「代表某個群體」次之** — 詩晴是跳舞的女生,「碰巧」坐輪椅
3. **不評斷 / 不政治化 / 不獵奇** — 宗教 = 生活影響 (週日要上主日學);族群 = 一句招呼 + 一個食物

### ✅ v3.21 — 4 大中期擴充批次（2026-05-18）

> 一氣呵成 agent 建議的 4 個中期願景:**新支線 + 2 個獨立 Story Pack + 卡牌收藏系統**。3 個新路由 / 3 個新 lib / 7 個檔案 / 2500+ 行內容。

#### 🌍 1. 第 5 條支線「服務組」(公民議題)

| 模組 | 細節 |
|---|---|
| 📦 schema 改動 | `lib/types.ts` Branch type 加 `"service"`,3 處 `Record<Branch, ...>` (BRANCH_TO_BGM / BRANCH_GRAD / BRANCH_NAME / BRANCH_COLOR) 同步補 |
| 🚪 入口 | `scene_06` 社團博覽會加第 5 個選項「🌍 公民服務隊」(F+2 N+2 J+1) → setBranch: "service" |
| 📖 6 個場景 | service_01 第一週聚會 (4 主題挑選) / service_02 環保 (校園減塑) / service_03 動保 (流浪小貓) / service_04 長者 (安養院探訪) / service_05 跨文化 (菲律賓交換生 Maria) / service_06 服務隊招新 |
| 🎯 教育價值 | 對應 108 課綱「公民意識」核心素養 + SDG 4.7 (永續發展教育);重點不是「正確答案」是「不同人會用不同方式關心社會」 |
| 🎓 結局影響 | 服務組學生最終結局更偏 F/N (重視價值與遠見) — 補完原 4 條支線之外的價值光譜 |

#### 📱 2. 數位素養 Story Pack `/digital`

| 模組 | 細節 |
|---|---|
| 🆕 新路由 | `/digital` 獨立 state machine (intro → 6 scenes → result),仿 SEL 結構 |
| 📁 lib/digital.ts | 6 個情境 + 4 種風格分析 + 完整資料 (~ 400 行) |
| 📚 6 情境 | 🤖 AI 工具寫作業 / 📰 群組瘋傳假訊息 / 📱 短影音停不下來 / 💬 群組玩笑變傷害 / 🔒 IG 限動拍到家門口 / 🤝 線上遊戲約見面 |
| 🎨 4 種數位素養型 | 🛡️ 守門員 (警覺+查證) / 🔍 探險家 (好奇+用工具) / 🧘 自律者 (自我管控) / 🤝 連結者 (善用網路認識人) |
| 🛠️ 每型 5 個工具箱 | 例: 守門員 → 事實查核網站 / 隱私設定檢查 / 封鎖+檢舉組合 / 截圖存證 / 找大人商量 |
| 🎯 教育價值 | 對應 108 課綱「科技資訊與媒體素養」核心素養 + NCC 媒體素養指標 + Common Sense Media 框架 |

#### 🏡 3. 家庭篇 Story Pack `/family` (含 flag 機制)

| 模組 | 細節 |
|---|---|
| 🆕 新路由 | `/family` 4 phase state machine (**consent → intro → scene → result**) — 多了一個「同意」階段提醒議題敏感 |
| 📁 lib/family.ts | 6 個情境 + 4 風格 + flag 機制 + 5 條緊急資源 (~ 500 行) |
| 📚 6 情境 | 😣 父母吵架 / 😢 被冤枉 / 🌀 隔代教養衝突 / 👶 弟弟出生 / 🏥 阿公生病 (失智) / 📦 家庭搬家 |
| 🎨 4 種家庭因應風格 | 🌸 表達者 / 🧠 思考者 / 🧘 安撫者 / 🫂 連結者 |
| ⚠️ Flag 機制 | 每個 choice 標 `flagLevel: "normal" \| "watch" \| "urgent"`;累積 flag score ≥3 → 結果頁顯示「你似乎遇到比較重的事」+ 5 條緊急資源 (0800-200-885 反霸凌 / 113 婦幼 / 1980 張老師 / 1995 生命線 / 110 警察) |
| 👩‍🏫 老師導讀區 | 結果頁底部 details 折疊區「給老師/家長的話」,提醒「不要把選擇拿來評斷」+ 若觸發 flag 主動關懷學生 |
| 🎯 教育價值 | 對應「家庭教育」議題 + 兒福聯盟兒少壓力調查 (家庭衝突是第二大壓力源僅次於課業);輔導課專用 |

#### 🎴 4. NPC 角色卡牌系統 `/cards`

| 模組 | 細節 |
|---|---|
| 🆕 新路由 | `/cards` — 12 張卡 grid + modal 卡片詳情 |
| 📁 lib/npc-cards.ts | 12 個 NPC 完整資料 (檔案 / 興趣 / 家庭 / 夢想 / 困擾 / 需要朋友的方式 / hint) + 解鎖機制 (~ 350 行) |
| 🔓 4 個解鎖面向 | 🌟 基本面 (進 /cards 自動解) / 💭 夢想 (完成 MBTI 主故事解) / 🫂 困擾 (完成 SEL 解) / 🎁 需要朋友的方式 (完成猜朋友解) |
| 📊 進度條 | 顯示「N/48 面解鎖」+ 4 個面向各自進度 + 互動式提示連結 |
| 🌟 全解鎖獎勵 | 12 卡 × 4 面 = 48 面全解 → 「全班拼圖完成!」慶祝卡 |
| 🎯 設計重點 | 「困擾」不寫成「他需要被你拯救」, 而是「他自己在處理的事, 你可以陪伴」;「友情」是「我喜歡這樣被對待」明確表達需求 |
| 🎯 教育價值 | 對應「人權教育」議題, 透過「漸進認識他的不同面向」學習「多元」的真意 — 不是口號, 是對「真實的他」感興趣 |

#### 🛠️ Dashboard 工具箱擴充

teacher/dashboard 工具箱從 8 卡 → 11 卡，新增 3 個入口:
- 📱 數位素養特別篇 (2026 NEW)
- 🏡 家庭篇 Story Pack (輔導課)
- 🎴 NPC 角色小卡 (收藏)

### ✅ v3.22 — §次講長 6 週完整教案（2026-05-18）

> 把 v3.21 的 4 個新 Pack + 原有 MBTI/SEL/猜朋友 5 個內容串成「6 週跨課程套餐」, 對應 108 課綱 + SDG + CASEL 三方規範。**老師一鍵備課**, 學生 6 週完成完整自我認識旅程。

#### 📚 1. lib/curriculum.ts (~600 行) 完整教案資料

| 結構 | 細節 |
|---|---|
| **CASEL_SKILLS** | 5 大社會情緒能力定義 (self-awareness / self-management / social-awareness / relationship-skills / responsible-decision-making) |
| **SDG_MAP** | 6 個聯合國永續發展目標 (SDG 4 / 10 / 11 / 13 / 16 / 17) |
| **WEEKLY_LESSONS** | 6 週完整教案 (每週 9 個面向資料) |

每週教案包含:
- 🎯 對應 108 課綱核心素養 / SDG / CASEL 5 大能力
- 📋 課前準備 (老師端)
- 🔥 暖場 5 分鐘 (含老師講稿)
- 🎯 主活動 30 分鐘 (含學生任務 + 教學小提示)
- 💭 反思 10 分鐘 (3 個學生反思題 + 老師引導)
- 🔗 跨週銜接 (跟其他週的關聯)
- 📩 家長聯絡簿摘要 (可直接複製)
- 🎁 配套學習單建議

#### 📅 2. 6 週主題 (跨課程套餐)

| 週次 | 主題 | 使用 Pack | 重點 |
|---|---|---|---|
| **W1** 🎒 | 校園奇遇記·自我認識 | `/game` MBTI 主故事 | A1 自我精進 + SDG 4/10 |
| **W2** 🌧️ | SEL 逆境特別篇·情緒因應 | `/sel` 9 情境 | A1 + CASEL self-awareness/management |
| **W3** 🎲 | 猜朋友 MBTI·班級互動 | `/guess` | C2 人際 + C3 多元文化 |
| **W4** 📱 | 數位素養特別篇·網路公民 | `/digital` | B2 媒體素養 + C1 公民意識 + SDG 16 |
| **W5** 🏡 | 家庭篇·家庭情緒探索 | `/family` (含 flag) | C2 人際 + 完整保護機制 |
| **W6** 🌟 | 綜合反思·我長大了多少 | `/cards` + `/journey` | 全班拼圖 + 完成證書 |

#### 🎓 3. app/teacher/curriculum/page.tsx

| UI 模組 | 細節 |
|---|---|
| **整體對應規範區** | 列出整套教案對應的 108 課綱 / SDG / CASEL chips (一眼看完整框架) |
| **6 週卡片** | 每張 collapsible, 預設摺疊 (顯示 emoji + 標題 + 副標 + 時間 + Pack 名) |
| **展開詳細教案** | 7 個 sections: 對應規範 → 本週使用 → 課前準備 → 暖場 → 主活動 → 反思 → 跨週銜接 → 配套 |
| **🖨️ 列印 PDF** | 一鍵展開全部 + 觸發 window.print, 可另存 PDF 教案手冊 |
| **結語區** | 「6 週後學生會擁有...」清單 + 入口 (回 dashboard / 建第一週房間) |

#### 🛠️ 4. Dashboard 整合

teacher/dashboard hero 區下方加大型 CTA:
- 紫橙漸層卡片, 「§次講長 6 週完整教案」標題
- 3 個 chips 顯示對應: 📘 108 課綱 7 項 / 🌐 SDG 5 項 / 💝 CASEL 5 能力
- 標 「🆕 跨課程套餐」badge

#### 🎯 教學現場使用情境

| 情境 | 建議 |
|---|---|
| **學期初** (認識自己) | 1 週上 1 課, 用「綜合活動」或「彈性學習」節數 |
| **學期末** (反思成長) | 跑 W1 + W6 (前後對照看變化) |
| **跨學期主題** | 6 週完整跑, 期末頒「校園奇遇記畢業證書」 |
| **單一輔導課** | 挑 1 週深度上 (W2 SEL 或 W5 家庭篇最常用) |
| **跨校研習** | 老師可印整份 PDF 教案手冊帶回去 |

#### 🌐 對應教育規範完整列表

**108 課綱 7 項核心素養**:
A1 身心素質與自我精進 / A2 系統思考與解決問題 / B1 符號運用與溝通表達 / B2 科技資訊與媒體素養 / C1 道德實踐與公民意識 / C2 人際關係與團隊合作 / C3 多元文化與國際理解

**SDG 5 項**:
SDG 4 優質教育 / SDG 10 減少不平等 / SDG 13 氣候行動 / SDG 16 和平正義 / SDG 17 夥伴關係

**CASEL 5 大能力**:
🔍 自我察覺 / 🧘 自我管理 / 👥 社會察覺 / 🤝 人際關係 / 🎯 負責任決策

---

#### 📷 AG6 — QR Code 掃描加入房間

| 模組 | 細節 |
|---|---|
| 🛠️ QrScannerButton 新元件 | 用 native `BarcodeDetector` API (Chrome 88+ / Edge 88+ / Android Safari 17+)，**0 npm dependency** (省 jsQR 80KB / zxing 200KB)；不支援的瀏覽器自動隱藏按鈕（避免假希望） |
| 🎥 全螢幕相機 modal | 後鏡頭 (facingMode: environment) 優先 + 取景框 + 4 角 coral 裝飾 + 動畫掃描線；safe-area-inset 處理 iOS 瀏海 |
| 🔍 智能解析 QR 內容 | URL 形式 (`https://.../?room=ABC123`) → 抽出 room param；純房號 (`ABC123`) → 直接用 |
| 🔋 偵測頻率 | 250ms (覆蓋率 + 效能平衡)；偵測到 → coin 音效 + 自動關 modal + 填房號 |
| 🚫 權限失敗處理 | getUserMedia 失敗 → 顯示「沒相機權限，可改用手動輸入」；關 modal 自動 stop tracks + clear interval (沒洩漏) |
| 🏠 /join 整合 | 房號 input 上方加 QR 掃描 button (大顆 coral 邊框)；填完自動清 error message |
| 🎯 教學效益 | 課堂上學生掃黑板房號 QR 比手動輸入 6 位數快 10 倍；低年級不會打字也能加入；無 BarcodeDetector 的桌面瀏覽器仍可手動輸入無縫 fallback |

---

## 🚧 規劃中（依優先級分群）

每個項目的標籤含意：
- 📊 **優先級**：🔥 高 / 🌟 中 / 🌙 低
- ⏱️ **工時**：粗估給 1 人寫的天數
- 🎯 **教育價值**：對國小教學現場的幫助強度
- 🔧 **技術涉及**：用到哪些技術

---

### 🎯 第一波：高 ROI、低風險（建議先做） ✅ **已全數完成於 v3.0**

> 以下五項已於 v3.0 完工，保留說明供未來「擴充」參考（例如再加更多 BGM、列印單樣式變化等）

#### 1. 🎵 背景音樂 + 互動音效 ✅
- 📊 🔥 高 ｜ ⏱️ 0.5 天 ｜ 🎯 立刻提升沉浸感
- 🔧 HTML5 Audio API + 預載入策略 + 使用者首次互動觸發
- **內容**：
  - 場景切換的「翻頁」音效（書頁聲）
  - 選項點擊「叮」聲
  - 結果出現時「煙火」綻放音
  - 首頁柔和輕快背景音樂（可關閉）
- **注意**：音樂版權！用 freesound.org CC0 或 [opengameart.org](https://opengameart.org) 免費資源
- **進階**：每條支線不同 BGM（校隊熱血、藝術夢幻、學術探索、友誼溫暖）

#### 2. 📄 可列印的個人結果單（A4 PDF） ✅
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 學生可帶回家給家長看
- 🔧 用 `window.print()` + `@media print` CSS（依 skill `pdf-export-print-best-practice`）
- **內容**：
  - 結果頁加「📄 列印我的結果單」按鈕
  - 設計 A4 直式版面：頂部姓名留白、MBTI 大字、傾向圖、超能力、給家長的話
  - 自動隱藏 header / footer / share buttons
- **進階**：班級結果單批次列印（一頁多人）

#### 3. 🧩 兩人配對工具 `/match` ✅
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 班級分組、人際關係課
- 🔧 純前端，輸入兩個 MBTI 比對
- **內容**：
  - 選兩個型 → 顯示「相處模式」「合拍指數」「衝突點」「溝通建議」
  - 16 × 16 = 256 種組合可用矩陣 + 規則生成
  - 也可比對「自己 vs 全班同學」一次性配對全班
- **延伸**：「分組工具」— 給老師依 MBTI 平衡組隊（每組 3-4 人，類型多元）

#### 4. 🏆 16 型成就徽章系統 ✅
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 鼓勵學生重玩看不同支線
- 🔧 localStorage 紀錄看過的型
- **內容**：
  - 結果頁底部顯示「徽章牆」16 個格子，未解鎖灰色、已解鎖彩色
  - 解鎖 4/8/12/16 個時跳出慶祝動畫
  - 「我已解鎖 X/16」可以分享
- **特殊徽章**：「校隊神將」（4 條支線都走完）、「全勤達人」（連玩 7 天）

#### 5. 📊 班級統計頁加匯出功能 ✅
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 老師教學成果保存
- 🔧 同樣 `window.print()` 或 `html2canvas` 截圖
- **內容**：
  - 「📥 下載統計圖 PNG」按鈕
  - 「🖨️ 列印 A4 班級報告」按鈕（橫式 1 頁全部圖表）
  - 「📋 複製成績文字版」（給打字進 Word 用）

---

### 🎯 第二波：內容深化（讓故事更豐富）

#### 6. 📚 暑假特別篇支線
- 📊 🌟 中 ｜ ⏱️ 2-3 天 ｜ 🎯 學期切換時的新鮮感
- 🔧 在 scenes.ts 加新支線（branch: "summer"）
- **內容**：
  - 開學週前的 3-4 個暑假場景：暑期作業 / 家庭旅遊 / 才藝營 / 露營
  - 暑假末「轉學生」場景做為 v2 → v3 主線銜接
  - 跟原本 38 場景互補，可以選「跳過暑假篇直接開學」

#### 7. 🎒 多元家庭情境
- 📊 🔥 高（教育價值）｜ ⏱️ 1 天 ｜ 🎯 SDGs 教育、多元尊重
- 🔧 修改既有場景的中性描述
- **內容**：
  - 「打給好友聊到睡著」改成「打給家人或好友」
  - 加入單親 / 隔代教養 / 新住民同學的劇情元素（不刻意但自然存在）
  - 「同學家裡有事」場景可加分支：阿哲家是單親媽媽帶大、雅雯爸是新住民
- **要點**：避免標籤化，呈現「正常多元」的校園真實

#### 8. 🌳 隱藏結局與分支
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 重玩價值
- 🔧 在計分基礎上加「特殊選擇組合觸發」
- **內容**：
  - 例如連續 5 個選項都選「最關心朋友」→ 觸發「校園英雄」隱藏結局
  - 「神祕轉學生劇情」：某些選擇組合解鎖額外場景
  - 結尾出現特殊獎章「你解鎖了隱藏 Ending: 守護天使」

#### 9. 📓 劇情回顧 / 日記本功能
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 學生自我反思
- 🔧 sessionStorage 已存 history，做一個 `/journal` 頁面
- **內容**：
  - 結果頁加「📓 看我的選擇日記」
  - 把玩過的場景按章節呈現，每個場景顯示「你選了什麼 → 結果」
  - 像一本互動小說的「個人化版本」
- **延伸**：可分享日記連結給朋友看「我經歷了什麼」

#### 10. 🎴 角色卡牌收集
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 收藏樂趣
- 🔧 16 張卡牌設計
- **內容**：
  - 玩到某型解鎖該型卡牌
  - 卡牌正面：角色插畫、屬性、稀有度
  - 卡牌背面：詳細說明、特殊能力（趣味設定）
  - 「卡牌冊」頁面收藏

---

### 🎯 第三波：教學功能深化（給老師更多工具）

#### 11. 👨‍🏫 教師後台：班級管理
- 📊 🔥 高 ｜ ⏱️ 5-7 天 ｜ 🎯 全功能教學平台
- 🔧 需要 Firebase Auth + Firestore（**會脫離純靜態，要 Blaze 計費**）
- **內容**：
  - 老師登入後可建立多個班級
  - 每個班級產生「邀請碼」（如 `MBTI-3A-2026`）
  - 學生玩完輸入邀請碼 → 結果自動傳到該班級
  - 老師後台看即時班級結果（不用手動收集）
- **替代方案**（純靜態維持）：用 Google Sheets API + 學生填表單，免後端

#### 12. 📋 結構化學習單（Worksheet）
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 配合課程設計
- 🔧 純前端 + 列印
- **內容**：
  - `/worksheet` 頁面，有可填寫的反思題
  - 「我的 MBTI 是 ___，符合我的形容是 ___」
  - 「跟我最合拍的同學是 ___，因為 ___」
  - 「我想改善的特質是 ___」
  - 可列印成 A4 學習單發給學生

#### 13. 🎬 教學引導投影片
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 老師教學一鍵備課
- 🔧 純 HTML reveal.js 或自製 slide 模式
- **內容**：
  - `/slides` 頁面內嵌 10 張投影片
  - 第 1 張：今天的活動目標
  - 第 2-3 張：MBTI 是什麼（淺顯說明）
  - 第 4 張：開始玩遊戲 QR code
  - 第 5-9 張：班級結果引導討論
  - 第 10 張：回家作業
- **延伸**：每張可投影到大螢幕，老師遙控翻頁

#### 14. 📈 多班比較（同老師多個班級）
- 📊 🌙 低 ｜ ⏱️ 2 天（與 #11 後台整合）
- 🔧 進階統計頁面
- **內容**：
  - 「五年甲班 vs 五年乙班 MBTI 分布比較」
  - 哪一班 ENFP 多、哪一班 INTJ 集中
  - 歷年同班級追蹤（學年初 vs 期末變化）

#### 15. 🎓 給學校用的「全校儀表板」
- 📊 🌙 低 ｜ ⏱️ 4 天
- 🔧 需要後端
- **內容**：
  - 學務處可以看全校學生 MBTI 分布
  - 班級導師的「我的班」快速入口
  - 與輔導室合作的個案追蹤輔助工具

---

### 🎯 第四波：技術架構升級

#### 16. 📱 PWA 化（可加到桌面、離線玩） 🟡 **半完成於 v3.4**
- 📊 🌟 中 ｜ ⏱️ 0.5 天（剩下的）｜ 🎯 行動體驗升級
- 🔧 Next.js + 手寫 service worker
- ✅ **已做**：Service Worker（network-first HTML / cache-first hashed）+ 自動版本通知 Banner
- 🚧 **待補**：
  - `manifest.json`（含 name / short_name / theme_color / 多尺寸 icons）
  - apple-touch-icon、favicon set
  - install prompt UI（手動觸發 `beforeinstallprompt`）
  - splash screen
  - 離線 fallback 頁面
- **注意**：依 skill `pwa-cache-bust` 處理版本快取問題（已在 v3.4 套用）

#### 17. 🖼️ 動態 OG 圖（v1 遺珠）
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 LINE 分享預覽變漂亮
- 🔧 三條路可選：
  - A. CI 在 Linux 上跑 @vercel/og（本機 Windows bug 不影響 CI）— 0.5 天
  - B. 用 satori + sharp 在 build 時生成 16 張靜態 PNG — 1 天
  - C. 用第三方 OG service 如 og-img.com — 0.2 天但需網路
- **建議走 A**：把 opengraph-image.tsx 加回來，只在 CI build 跑

#### 18. 🌏 SEO 強化
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 教師搜尋「MBTI 教學」找得到
- 🔧 加 sitemap.xml、robots.txt、JSON-LD structured data
- **內容**：
  - `app/sitemap.ts` 列出所有靜態頁
  - `app/robots.ts` 允許所有爬蟲
  - 結果頁加 `Article` schema
  - 加上 keyword optimization（國小、輔導、MBTI、人格測驗）

#### 19. ♿ A11y 無障礙升級
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 視障輔助科技、SEN 學生友善
- 🔧 ARIA 標籤、鍵盤導覽、色彩對比審查
- **內容**：
  - 場景選項加上 `aria-label` 描述
  - 翻頁特效對「使用者偏好減少動畫」支援（`prefers-reduced-motion`）
  - 對比度測試（WCAG AA 標準）
  - Screen reader 試讀流程

#### 20. 🌗 深色 / 明亮主題切換
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 個性化、晚上玩眼睛舒服
- 🔧 Tailwind 4 + CSS variables + localStorage
- **內容**：
  - Footer 旁加切換按鈕
  - 預設跟系統 `prefers-color-scheme`
  - 深色模式重新調整四條支線配色（高對比但溫和）

#### 21. ⚡ 效能優化深化
- 📊 🌙 低 ｜ ⏱️ 0.5 天 ｜ 🎯 偏鄉網路也順
- 🔧 Lighthouse 100 分挑戰
- **內容**：
  - 字型載入策略（font-display: swap、subset）
  - Critical CSS 內聯
  - Framer Motion lazy import（只在 /game 載入）
  - 圖片用 next/image + AVIF

---

### 🎯 第五波：社群、推廣、商業化

#### 22. 🤖 LINE 官方帳號 Bot
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 學生最熟悉的平台
- 🔧 LINE Messaging API + Firebase Functions（依 skill `line-messaging-firebase`）
- **內容**：
  - 學生加好友 → bot 詢問是否要玩 MBTI 測驗
  - 結果直接在 LINE 對話框內顯示（含預覽圖）
  - 「分享給朋友」一鍵推送
  - 老師可以建立群組由 bot 自動統計

#### 23. 📊 全國 / 全校匿名統計頁
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 趨勢洞察
- 🔧 Firestore 簡單 counter
- **內容**：
  - 玩家完成後可選「願意提供匿名統計」
  - `/global-stats` 顯示全網玩家的 16 型分布
  - 跟自己班比較：「我們班 ENFP 比例高出全國 30%」
- **隱私**：絕對不存可識別資訊

#### 24. 🎁 「我的成長日誌」歷次紀錄
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 同一學生跨時間追蹤
- 🔧 localStorage（也可加 Firestore 給有帳號的人）
- **內容**：
  - 每次玩完存日期 + 結果
  - 「我的 MBTI 演變圖」線圖（國小三年級 ESFP → 四年級 ESFJ → 五年級 INFJ）
  - 引導反思：「我變得內向了，是因為...」

#### 25. 🏫 「老師專業檔案」匯出
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 教師甄選、進修檔案
- 🔧 PDF 生成
- **內容**：
  - 老師後台可生成「我用了 X 次、輔導 Y 位學生、產出 Z 場活動」
  - PDF 含學校 logo、使用統計、學生反饋摘要
  - 適合放入教師專業發展檔案

---

### 🎯 第六波：AI 整合（夢想清單）

#### 26. 🧞 Gemini 個人化結果分析
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 每次結果都不一樣
- 🔧 Cloud Functions + Gemini API（依 skill `gemini-free-tier-first` 走免費層）
- **內容**：
  - 結果頁加「✨ 讓 AI 老師再多了解你」按鈕
  - 收集玩家選擇歷程 → Gemini 生成 200 字個人化分析
  - 每次都不同，重玩更有趣
- **成本控制**：依 skill `cloudflare-turnstile-integration` 加 captcha 防刷

#### 27. 💬 「跟你的 MBTI 角色聊天」
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 沉浸式角色扮演
- 🔧 Gemini + 角色設定 prompt
- **內容**：
  - 結果頁加「💬 跟同類型的小朋友聊聊」
  - LLM 扮演該型 NPC（如 INFJ 的雅雯）跟你聊天
  - 系統 prompt 設定該角色個性、用詞、興趣

#### 28. 🌱 AI 動態場景生成
- 📊 🌙 低 ｜ ⏱️ 4 天 ｜ 🎯 高度個人化
- 🔧 Gemini + 結構化 prompt
- **內容**：
  - 玩家可以說「請給我一個關於『打籃球時忘記帶水』的場景」
  - AI 生成符合既有計分系統的選項
  - 不會破壞主線，加在主線之間當「插曲」

#### 29. 🌏 多語自動翻譯
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 跨國交流
- 🔧 Gemini 翻譯所有文字成英文、簡中
- **內容**：
  - `/en/`、`/zh-CN/` 子路徑
  - i18n 系統，所有文字統一在 `messages/zh-TW.json` 等
  - 校園情境保留台灣特色（用 footnote 解釋給外國人）

---

### 🎯 第七波：視覺與美術升級

#### 30. 🎨 自製角色插畫（取代 emoji）
- 📊 🌟 中 ｜ ⏱️ 5+ 天（需設計師）｜ 🎯 視覺辨識度大躍進
- 🔧 SVG 插畫
- **內容**：
  - 8 個 NPC 角色設計 + Q 版表情
  - 場景背景插畫（教室、操場、禮堂、美術教室）
  - 16 型結果頁的「我的小頭像」
- **若無預算**：用 AI 生圖（Stable Diffusion / Midjourney）+ 後製統一風格

#### 31. 🎞️ Lottie 動畫
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 結果頁加分項
- 🔧 lottie-react + 從 lottiefiles.com 抓 CC0 動畫
- **內容**：
  - 結果出現時放煙火 Lottie
  - 解鎖徽章時的慶祝動畫
  - 載入中的可愛角色 walk cycle

#### 32. 📷 動態結果圖（可下載當大頭貼）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 LINE / IG 分享利器
- 🔧 html2canvas 或 satori + canvas
- **內容**：
  - 結果頁加「📸 生成我的人格大頭貼」
  - 1080×1080 方形圖（適合 IG）
  - 1080×1920 長條圖（適合 IG Story）
  - 含 QR code 連回測驗

---

### 🎯 第八波：教育生態圈

#### 33. 📖 老師使用手冊 PDF
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 推廣加速
- 🔧 純文件寫作 + 排版
- **內容**：
  - 20 頁完整教師指南
  - 含「3 種課堂活動設計」「常見問答」「家長溝通模板」
  - 可下載 PDF + 線上版

#### 34. 🌐 教師交流社群
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 口碑擴散
- 🔧 Discord / LINE 社群
- **內容**：
  - 老師交流使用心得
  - 收集改進建議
  - 分享教案

#### 35. 🏫 進入「教學資源平台」
- 📊 🌙 低 ｜ ⏱️ 2 天（含申請流程）
- **目標**：
  - 教育部教學資源網
  - 均一教育平台
  - PaGamO
  - 親子天下教師選讀

---

### 🎯 第九波：音效 / 語音 / 多媒體進階（v3.x 延伸）

> v3.0~v3.5 已搭好音效音樂 + TTS 基礎，這波是深化

#### 36. 🎶 四條支線專屬 BGM
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 沉浸感大躍進
- 🔧 用 skill `pixabay-audio-asset-pipeline` 加 4 首 BGM
- **內容**：擴充 BgmTrackId 為 `home | sport | art | study | friend | result`
  - sport → 熱血上揚 (`upbeat sport`)
  - art → 夢幻寧靜 (`dreamy ambient piano`)
  - study → 好奇探索 (`curious puzzle`)
  - friend → 溫暖友誼 (`warm cozy ukulele`)
- 在 BgmController 內偵測當前 branch 自動切換

#### 37. 🎭 每個 NPC 不同 TTS 聲音
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 角色辨識度
- 🔧 Web Speech API multi-voice：對每個 speaker 用不同 pitch / rate
- **內容**：
  - 凱莉（ENTJ 班長）→ pitch 0.95, rate 1.1（沉穩有力）
  - 小芸（ENFP）→ pitch 1.2, rate 1.1（活潑可愛）
  - 阿哲（INTJ）→ pitch 0.9, rate 0.95（慢條斯理）
  - 雅雯（INFJ）→ pitch 1.1, rate 0.9（溫柔輕語）
- speakScene() 內判斷 speaker 套對應 voice profile

#### 38. 🎙️ 老師預錄旁白（阿凱老師的聲音）
- 📊 🌟 中 ｜ ⏱️ 2 天（含錄音）｜ 🎯 親切感拉滿
- 🔧 用手機錄音 → mp3 → 配對到場景
- **內容**：
  - 老師自己唸開場白 / 結尾 / 重要場景 (5-10 段)
  - localStorage 紀錄「想聽老師聲音」開關
  - TTS 預設機器聲，可切換到「阿凱老師聲音」（更有溫度）
- **進階**：在地老師可以自己錄一套換掉

#### 39. 🔉 TTS 控速面板
- 📊 🌙 低 ｜ ⏱️ 0.3 天 ｜ 🎯 適性學習
- 🔧 加 slider 控 rate (0.7 ~ 1.5)
- **內容**：右下角浮動小面板可調朗讀速度
- 低年級慢、高年級快

#### 40. 🎵 結果頁專屬主題曲
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 每個 MBTI 都有自己的歌
- 🔧 16 首短 mp3 (15-30 秒) 對應每型
- **內容**：玩到 ENFP 結果頁聽到熱情系小曲，ISTJ 聽到沉穩系小曲
- **挑戰**：素材成本大，可分批導入

---

### 🎯 第十波：協作 / 多人 / 老師遠端控場（需要後端）

> 進入需要 Firebase / Supabase 的階段，會脫離純靜態 GitHub Pages

#### 41. 👥 全班即時同步玩
- 📊 🌟 中 ｜ ⏱️ 5 天 ｜ 🎯 班級活動殺手鐧
- 🔧 Firebase Realtime DB + 老師建房間 + 學生加房間碼
- **內容**：
  - 老師建房間 → 顯示 6 位數房間碼
  - 學生輸入房間碼加入
  - 老師大螢幕看「26 位學生玩到第 5 場景」進度條
  - 老師可「集合大家」強制同步到某個場景一起討論
  - 每個學生完成時老師看到該生 MBTI 即時跳出
- **依賴**：Firestore + Auth + skill `firebase-multi-app-safety`

#### 42. 📌 老師 pin 選項即時討論
- 📊 🌟 中 ｜ ⏱️ 2 天（在 #41 基礎上）｜ 🎯 互動式教學
- 🔧 同 #41 的 RTDB
- **內容**：
  - 老師可以選某個關鍵場景「暫停全班」
  - 投影出全班選項分布（A 14 人 / B 8 人 / C 4 人）
  - 引導學生分享為什麼選 A
  - 結束後讓全班繼續玩

#### 43. 💬 班級留言板 / 回饋
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 學生互動
- 🔧 Firestore + 簡易 moderation
- **內容**：
  - 玩完結果頁加「跟全班分享我的想法」(50 字內)
  - 老師可以審核 / 刪除
  - 留言板顯示「ENFP 小明：我覺得最像我的是『樂於分享』」

#### 44. 🎬 學生「劇場模式」
- 📊 🌙 低 ｜ ⏱️ 3 天 ｜ 🎯 班會 / 朝會表演
- 🔧 純前端 + 大螢幕模式
- **內容**：
  - 投影模式：場景文字大字、TTS 朗讀全班聽
  - 老師按空白鍵切下一場景
  - 選項用學生「舉手投票」 → 老師輸入結果
  - 走一場全班共同的故事

#### 45. 🏆 班級排行榜（趣味用）
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 帶話題不傷感情
- 🔧 Firestore
- **內容**：「我們班最稀有的型是 INTJ（只有阿哲一位）」「最熱門 ENFP（5 位）」
- **絕對不能**：排名「誰最聰明 / 誰最受歡迎」這種

---

### 🎯 第十一波：適性與無障礙

> 確保所有學生不論能力都能玩

#### 46. 🔠 注音版本（低年級友善）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 一、二年級也能玩
- 🔧 ㄅㄆㄇ 標註，每字加 ruby 標籤
- **內容**：
  - SoundToggle 加第 4 顆按鈕「注音」
  - 開啟後場景文字每字加 `<ruby>校<rt>ㄒㄧㄠˋ</rt></ruby>` 注音
  - 需要轉換工具（可手動建表或用 pinyin 套件）

#### 47. 🔍 字級縮放控制
- 📊 🌙 低 ｜ ⏱️ 0.2 天 ｜ 🎯 視力弱化友善
- 🔧 CSS variable + 三段切換 (小/中/大)
- **內容**：右下角加「A-」「A+」兩顆字級按鈕
  - 預設 中 (1rem)
  - 小 (0.875rem) / 大 (1.25rem)
  - localStorage 持久化

#### 48. 🌈 高對比模式
- 📊 🌙 低 ｜ ⏱️ 0.5 天 ｜ 🎯 視障輔助 / 色弱友善
- 🔧 CSS variable theme switch
- **內容**：黑白高對比版面，加粗框線
- 跟 dark mode (#20) 整合一個切換器

#### 49. ⌨️ 全鍵盤導覽
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 鍵盤族 / 螢幕閱讀器
- 🔧 Tab order + focus ring 強化
- **內容**：
  - 場景選項可用 1 / 2 / 3 / 4 鍵直接選
  - Tab + Enter 全程鍵盤可玩
  - aria-live region 朗讀 followUp

#### 50. 🇬🇧 多語 (繁中 / 英文 / 簡中)
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 跨國學校 / 雙語班
- 🔧 next-intl + JSON 翻譯檔
- **內容**：與 #29 AI 翻譯重複，可優先做純人工版

---

### 🎯 第十二波：資料分析與洞察

#### 51. 📈 老師個人儀表板
- 📊 🌟 中 ｜ ⏱️ 4 天 ｜ 🎯 教學成果可視化
- 🔧 Firebase Auth + Firestore + Chart.js
- **內容**：
  - 老師登入後看「我用了 12 次，輔導 156 位學生」
  - 歷次班級 MBTI 分布變化圖
  - 最常被解鎖的型 / 最稀有的型
  - 學生回饋滿意度

#### 52. 🧠 「選擇模式」分析
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 給輔導老師深入用
- 🔧 純前端 + localStorage 歷次記錄
- **內容**：
  - 跟自己過去比：「你這次比上次更偏 F 了」
  - 識別「固執型選擇」(連續 3 場都選同類)
  - 識別「猶豫型」(常按再讀一次)

#### 53. 📊 「沒做過的選擇」探索
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 鼓勵跳出舒適圈
- 🔧 localStorage 記每場景選過哪些選項
- **內容**：玩完顯示「你還沒試過這 5 個選擇」可一鍵重玩到那場景

---

## 💡 長期願景 / 跨年度

- **MBTI 校園奇遇記學習系列**：擴充到「霍蘭德職業興趣測驗」「氣質量表」「優勢識別」等多元工具的校園 RPG 化
- **教師認證制度**：完整跑過 3 場活動的老師可獲「MBTI 校園引導師」電子證書
- **學術合作**：跟教育心理系合作驗證信效度，發表期刊論文
- **跨校競賽**：「全國國小 MBTI 多元共融創意大賽」

---

## 🎯 阿凱老師建議的優先順序（v3.5 後更新）

第一波 5 項全部完成於 v3.0，並在 v3.1~v3.5 額外做了：
- ✅ 全站按鈕音效升級（10 種）
- ✅ Pixabay CC0 真實音效 mp3
- ✅ 多 track BGM 系統 + cross-fade（修遊戲沒 BGM bug）
- ✅ SW 版本通知機制（部分 PWA 化）
- ✅ TTS 語音導讀（Web Speech API）

下一階段建議優先序：

### 🥇 立刻做（一週內可上線、零後端風險）

| # | 項目 | 工時 | 為什麼優先 |
|---|---|---|---|
| **#36** | 🎶 四條支線專屬 BGM | 0.5 天 | 跟 v3.3 多 track 基礎完美延伸，沉浸感再 +50% |
| **#16 補完** | 📱 PWA manifest + install banner | 0.5 天 | v3.4 已做 SW，只差 manifest + icon 就能裝桌面 |
| **#39** | 🔉 TTS 控速面板 | 0.3 天 | TTS 剛上線，加 slider 就更實用 |
| **#17** | 🖼️ 動態 OG 圖（v1 遺珠） | 1 天 | LINE 分享預覽變漂亮，推廣加速 |
| **#47** | 🔍 字級縮放控制 | 0.2 天 | 視力弱化友善，老師家長有感 |

### 🥈 一個月內（教學現場立刻能用）

| # | 項目 | 工時 | 為什麼值得 |
|---|---|---|---|
| **#7** ✅ | 🎒 多元家庭情境 | 1 天 | ✅ v3.11 完成（CampusIntro + friend_04） |
| **#12** ✅ | 📋 結構化學習單 | 1 天 | ✅ v3.10 完成 |
| **#46** ✅ | 🔠 注音版本 | 2 天 | ✅ v3.9 完成 |
| **#37** ✅ | 🎭 NPC 不同 TTS 聲音 | 1 天 | ✅ v3.11 完成（25 個角色 VOICE_PROFILES） |
| **#38** | 🎙️ 阿凱老師預錄旁白 | 2 天 | 親切感獨家 |

### 🥉 一學期內（深化內容、適度引入後端）

| # | 項目 | 工時 | 為什麼重要 |
|---|---|---|---|
| **#6** | 📚 暑假特別篇支線 | 2-3 天 | 學期切換時的新鮮感 |
| **#9** | 📓 劇情回顧日記本 | 1.5 天 | 學生自我反思 |
| **#41-42** | 👥 全班即時同步玩 + Pin 選項 | 7 天 | 班級活動殺手鐧（需 Firebase） |
| **#22** | 🤖 LINE Bot | 3 天 | 學生最熟悉平台 |
| **#13** | 🎬 教學投影片 | 1 天 | 老師一鍵備課 |

### 🌌 未來探索（看反應與資源）

- AI 整合系列 (#26-29) — Gemini 個人化分析、跟角色聊天
- 自製角色插畫 (#30) — 取代 emoji
- 第十二波 資料分析 (#51-53) — 老師儀表板
- 跨校 / 全國推廣 (#33-35) — 上架教學平台
- **「給其他學校老師的『一鍵 fork』模板」** — 換上自己校名 + 故事就能用

---

## 🆕 v3.12 後的下一波建議（2026-05-17 補充）

> 經過 v3.11/v3.11.1/v3.11.2/v3.12 連續上線後，基礎體驗已經很完整。下一階段建議分四個方向同時推進，每項都標明工時 / 預期效益 / 技術風險。

### 🎨 A. 視覺與互動細節（讓孩子「捨不得關」）

#### A1. 🌈 場景背景插畫（取代純色漸層）
- 📊 🌟 中 ｜ ⏱️ 2-3 天 ｜ 🎯 沉浸感再 +30%
- 🔧 用 AI 生圖 (Midjourney / SDXL) 產出 30 張低多邊形風景：教室、操場、美術教室、禮堂、走廊…；存 SVG/WebP，每張 < 80KB
- 加在 game/page.tsx 場景卡背景，現有 emoji 變成「角色貼紙」放右下
- **進階**：每條支線一套配色（校隊熱血橙、藝術夢幻粉、學術沉穩藍、友誼溫暖綠）

#### A2. 👤 NPC 角色頭像插畫（取代 emoji 🌸🤓⚡…）
- 📊 🌟 中 ｜ ⏱️ 3-4 天 ｜ 🎯 角色辨識度大躍進、可愛感 +200%
- 🔧 8 個主角色 + 4 個老師 + 5 個配角，每人 1 張正常 + 1 張驚訝/開心表情 = 共 ~25 張
- 風格：日系卡通像「小新」「櫻桃小丸子」，色塊化、可愛
- 對話時表情會切換（情緒詞觸發）

#### A3. ✨ 微互動動畫升級
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 細節控加分
- 點選項時：選項從卡片飛出 → 朝對應人物頭像「丟過去」→ 對方接到後變表情
- 場景翻頁：書頁從右邊翻過來（已有 rotateY 30°，可再加紙張紋理 + 翻動陰影）
- 注音模式：開啟時注音字從漢字頂端「pop」一個一個彈出來
- 分數變動：強度條像血條一樣慢慢漲滿

#### A4. 🎬 結局慶祝動畫
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 結局儀式感
- 進結果頁時：彩帶 + 拉炮 + 屬於該 MBTI 的「招牌動作」（ENFP 跳起來歡呼、INTJ 抱胸點頭）
- 配合已有的 reveal 音效，加 framer-motion stagger

---

### 🎓 B. 教學現場深化（老師有感、家長安心）

#### B1. 📈 班級 MBTI 動態歷史
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 老師超想要
- 🔧 Firebase RTDB 已建好，加「班級活動紀錄」collection：每次跑活動存全班 16 型分布、時間、班級
- 老師專屬頁面：歷次活動曲線圖（誰從 ESTP 變 ESFP？哪一型最穩定？）
- 學生個人：「我的 MBTI 變化軌跡」三年六學期看一次

#### B2. 📋 「課前/課後」自我評估對照表
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 課程紀錄、家長報告
- 課前讓學生猜自己是哪型 → 跑完 RPG 後對比
- 「你猜對了！」/「跟想像不同？」+ 反思引導句
- 列印單加一欄「課前猜測 vs 課後結果」

#### B3. 🤝 「兩兩配對」班級活動模式
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 班級活動殺手鐧
- 老師選「全班互配」→ 自動計算所有兩兩組合的合拍度
- 投影模式顯示：今天最合拍 Top 3、最互補 Top 3、需要互相理解 Top 3
- 學生隔週調換座位的依據

#### B4. 🎯 「分組任務」生成器
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 分組省力
- 老師輸入「要分 N 組做 XX 任務」→ 系統按 MBTI 平衡分配（每組要有 1 個 J 主導、1 個 P 點子王、1 個 F 凝聚力…）
- 一鍵產出名單 + 列印貼牆上

#### B5. 💌 「給家長的人格地圖」家庭親子單
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 家庭聯絡
- 在結果頁加「給家長」單獨 PDF 列印
- 內容：孩子的型 + 三句「家長可以這樣跟他相處」+ 三句「請避免這樣說」+ QR 給家長自己玩
- 比現有的「給老師家長的話」更具體

#### B6. 🎙️ 阿凱老師預錄旁白（#38 原 backlog）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 親切感獨家、學生超有共鳴
- 用手機錄音 30 句旁白：開場、章節轉場、結局獻詞…
- 加「老師親聲 / 系統 TTS」切換 toggle
- 老師親聲 = 學生覺得「老師在跟我說話」

---

### 🤖 C. AI 整合（用 Gemini 免費額度做）

#### C1. 🧠 個人化結果分析 (Gemini)
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 給家長家庭親子單超酷
- 結果頁加「✨ AI 為你寫一段專屬分析」按鈕（明確標示非診斷）
- 把學生的 16 個選擇 + 最終型送 Gemini，生成 300 字個人化敘述
- Free-tier 算下來：每天 1500 次 request / 學校 300 學生 × 每學期 1 次 ≈ 7 天用完額度 → 沒問題
- 用 `gemini-free-tier-first` skill 設保險

#### C2. 💬 「跟你的 MBTI 雙胞胎聊聊」
- 📊 🌙 低 ｜ ⏱️ 3 天 ｜ 🎯 學生愛玩、教學引導難
- 結果頁可開 chat 跟 AI 扮演的「同型同學」聊天
- system prompt: 設定為小學生口吻 + 該 MBTI 個性 + 中性安全話題（學校、家裡、興趣）
- 風險：AI 跑題到敏感話題 — 必須加嚴格話題守門 + 老師後台可關
- 先做老師審核版

#### C3. 🎬 AI 場景圖生成（為老師、為新故事）
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 老師自製故事加速
- 老師後台輸入「場景描述」→ Gemini / SDXL 生圖供老師選用
- 配合「老師自製支線」功能（B7 待新增）

#### C4. 📊 AI 班級洞察報告
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 老師期末超實用
- 一鍵把全班結果 + 個人選擇統計送 Gemini
- 產出：班級整體傾向、合作建議、潛在衝突、推薦活動
- 老師期末家長日直接用

---

### 🌐 D. 後端 / 多人 / 推廣

#### D1. 👥 全班即時同步玩進階（#41-42 已做基礎）
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 v3.7 完成基礎，再深化
- 「全班一起跑同一個場景」競速模式：誰先選完誰得星
- 老師端「投票結果直方圖」即時更新
- 「跟你想的不一樣的同學」配對討論啟動鍵

#### D2. 📊 跨班級資料庫匯出（CSV / Excel）
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 學期報告省力
- 老師管理面板加「匯出全校所有班級結果」
- 欄位：班級、姓名、MBTI、四軸分數、跑哪條支線、活動日期
- 教務處 / 輔導室期末統計用

#### D3. 🏆 跨校 MBTI 統計看板（匿名化）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 學術 / 推廣
- 公開頁面：全國跑過此網站學生的 MBTI 分布
- 跟官方研究數據比對：「台灣國小生 MBTI 分布特性」
- 推廣亮點 + 寫成教學心得文章

#### D4. 🤖 LINE Bot 互動版
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 學生最熟悉平台
- 在 LINE 上跑簡化版 RPG（純文字 + 選按鈕）
- 結果直接傳到家長 LINE 群
- LINE LIFF 連回完整網頁版深入查看

#### D5. 📱 「分享卡」進階版
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 推廣加速
- 結果頁產生獨家 1080×1080 分享卡（IG/FB 限動友善）
- 用 Canvas API 動態生成：頭像 + MBTI + 一句招牌台詞
- 一鍵下載 + Web Share API

---

### ⚡ E. 效能 / 監測 / 品質（技術債整治）

#### E1. 🔍 Lighthouse + Web Vitals 監測
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 客觀數據說話
- 在 CI 加 Lighthouse CI，每次 push 自動跑跑分
- 設下限：Performance ≥ 90、Accessibility ≥ 95、SEO ≥ 90
- 不達標就 PR fail

#### E2. 📊 真實使用者監測（RUM）
- 📊 🌙 低 ｜ ⏱️ 1 天 ｜ 🎯 找出真實裝置卡點
- 用 web-vitals npm 套件抓 LCP/CLS/INP，送到 Firebase Analytics
- 老師後台看「卡 LCP 最久的場景是哪幾個？」
- 學校老舊 iPad 卡哪些畫面一目了然

#### E3. 🐛 全站錯誤回報（Sentry / 簡易自製）
- 📊 🌙 低 ｜ ⏱️ 0.5 天 ｜ 🎯 不漏接 production bug
- window.onerror + unhandledrejection → 送 Firebase RTDB 一個 errors 集合
- 老師後台看最近 7 天錯誤；自己 debug 救星

#### E4. ♿ 完整無障礙稽核（a11y）
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 政府機關 / 學校採購硬需求
- 跑 axe-core 完整稽核
- 補：所有按鈕 aria-label / 對話氣泡 role="dialog" / 鍵盤 navigation (Tab/Enter)
- 高對比模式 toggle（現有字級已有，再加色盲友善配色）
- screen reader 模擬測試（NVDA / VoiceOver）

#### E5. 🧪 E2E 測試（Playwright）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 部署不再緊張
- 寫 8 條關鍵流程：4 條支線 × 兩種 endings
- 加注音、字級、TTS 三種設定的 smoke test
- CI 跑過才 deploy

#### E6. 📦 Bundle size 監測
- 📊 🌙 低 ｜ ⏱️ 0.3 天 ｜ 🎯 預防 First Load JS 爆炸
- 加 `@next/bundle-analyzer`
- 設上限：First Load JS ≤ 200KB（目前 105KB OK，但 framer-motion 是大頭）
- 考慮對話氣泡用 CSS 動畫取代 framer-motion，省 30KB

---

### 🌟 F. 內容擴充（劇情、角色、特別篇）

#### F1. 📚 暑假特別篇支線（#6 原 backlog）
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 學期切換新鮮感
- 新增 8 個暑假場景：游泳隊集訓、家族旅行、營隊…
- 解鎖條件：玩過至少 2 條支線

#### F2. 🌧️ 「逆境特別篇」（情緒教育）
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 SEL 社會情緒學習正夯
- 新增 6 個情緒場景：被誤會、失敗、被排擠、難過、生氣、害怕
- 不同 MBTI 對逆境的不同反應 → 學會「我可以這樣」
- 結合輔導課使用

#### F3. 🎯 「夢想職業」延伸劇情
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 生涯探索
- 結果頁加「想看看 MBTI 跟適合職業的關係嗎？」
- 點進去：選兩個感興趣的職業 → 互動短劇展示一天的工作日常

#### F4. 📓 劇情回顧日記本（#9 原 backlog）
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 自我反思
- 結果頁加「我的選擇日記」展開可看所有歷次選擇 + followUp 文字
- 可列印成 A4 學習單
- 老師批改用

#### F5. 🎭 「家長版 MBTI 體驗」
- 📊 🌙 低 ｜ ⏱️ 3 天 ｜ 🎯 親師活動加分
- 重新包裝劇情成成人版（職場、家庭、社交）
- 學生帶回家 QR Code，全家一起玩
- 親子討論題目自動生成

---

### 🌍 G. 跨校推廣 / 開源 / 模板化

#### G1. 🍴 「給其他學校的一鍵 fork 模板」（最高 ROI 推廣）
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 一個下午幫全國老師加值
- 把學校名 / 班級 / 老師資訊抽到 `config.json`
- 寫一份 README 教學：fork → 改 config → push → 自動部署
- 加示範影片（5 分鐘）
- 把石門國小特色註記為 example

#### G2. 📖 開源教學文件
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 教師社群推廣
- 寫一份「用 Claude Code 半年從零到全國推廣的 MBTI 校園 RPG 開發記」
- 投稿教育月刊 / 數位學習電子報

#### G3. 🎓 「教師認證 / 工作坊」（夢想）
- 📊 🌙 低 ｜ ⏱️ 長期 ｜ 🎯 教育影響力
- 辦一場線上 2 小時工作坊：教 50 位老師如何在班上跑這個活動
- 完成者頒「MBTI 校園引導師」電子證書（自製徽章 + 結業證明）

#### G4. 🏫 「校際活動」模式
- 📊 🌙 低 ｜ ⏱️ 5 天 ｜ 🎯 教育亮點
- 多校學生同時跑 → 即時跨校 MBTI 統計榜
- 全國國小 MBTI 大數據看板

---

## 🥇 阿凱老師建議最先做（v3.12 後 1 週內）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 ✅ | **B1** 班級 MBTI 動態歷史 | 2 天 | ✅ v3.13 Phase 3 完成 |
| 🥇 ✅ | **B2** 課前/課後自我評估對照 | 1 天 | ✅ v3.13 Phase 1 完成 |
| 🥇 | **E4** 完整無障礙稽核 | 1.5 天 | 學校採購硬需求、不做就是 risk |
| 🥈 ✅ | **G1** 一鍵 fork 模板 | 2 天 | ✅ v3.13 Phase 2 完成 |
| 🥈 ✅ | **C1** Gemini 個人化分析 | 1.5 天 | ✅ v3.13 Phase 4 完成（需手動設 API key） |
| 🥉 ✅ | **A1+A2** 視覺插畫升級 | 5-7 天 | ✅ v3.13 Phase 5 完成（SVG 簡化版，可日後升級真實插畫） |

---

## 🆕 v3.13 後的下一波建議（2026-05-17 補充）

> 五項一次到位 + Gemini 已接好之後解鎖了**全新可能性**。
> 下面把建議按「**已解鎖（門檻爆低）→ 新發現→ 老 backlog**」分類，每項標明工時 / 因為什麼解鎖 / 預期效益。

---

### 🚀 H. **由 Gemini 已上線解鎖的「同套 API 連線」加值**

> Gemini API key 已設好之後，再多寫幾個 prompt 就有新功能，邊際成本超低。

#### H1. 🎙️ AI 班級洞察報告（原 C4 升級版）
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 老師期末家長日神器
- 在 `/teacher/history` 每筆活動加「✨ 請 AI 寫一份家長日報告」按鈕
- 把 SessionSnapshot (16 型分布 + 4 軸 + 學生名單) 送 Gemini
- 產出：
  - 一段 200 字的班級整體個性敘述
  - 3 個合作建議
  - 2 個潛在衝突提示
  - 適合這個班的下次活動推薦
- 老師複製到家長日報告或聯絡簿
- **解鎖原因**：C1 已串好 Gemini 流程，把 input 換成 SessionSnapshot 就能用

#### H2. 🎨 AI 自動生成班級活動標題 / 反思題
- 📊 🌟 中 ｜ ⏱️ 0.3 天 ｜ 🎯 老師備課省力
- 老師建立房間時可以點「✨ AI 幫我命名 + 寫 3 句反思題」
- 給班級名 + 主題（如「下學期前的自我探索」）→ 自動填表
- 反思題在學生跑完故事的結果頁底部顯示，讓他們填

#### H3. 🤖 阿凱老師專屬「故事擴充助手」
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 你自己加新場景超省力
- 開發者模式（密碼解鎖頁）：輸入「我想加一個 XX 主題的場景」
- Gemini 依 scenes.ts 格式自動生成完整 Scene 物件 (含 4 個選項 + delta + followUp)
- 你檢查後複製貼上到 scenes.ts → push 即上線
- **解鎖原因**：你常會想擴充故事，AI 生 5 個版本你挑 1 個比從零寫快 10 倍

#### H4. 🎭 「跟你的 MBTI 雙胞胎聊聊」(原 C2)
- 📊 🌙 低 ｜ ⏱️ 2-3 天 ｜ 🎯 學生超愛、教學引導難
- 結果頁可開 chat 跟 AI 扮演「同型同學」聊天
- 風險：話題管控、不當回應
- 解法：嚴格 system prompt + 話題白名單 + 每天 chat 上限 5 句 + 老師後台可關
- **建議**：先觀察 H1-H3 反應再決定要不要做這個

---

### 📊 I. **由 B1 已上線解鎖的「歷史資料分析」**

> classHistory 已建好之後，可以做跨學期分析、學生個人軌跡。

#### I1. 👤 學生個人 MBTI 變化軌跡
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 學生 / 家長都會感動
- 在結果頁加「我的 MBTI 變化軌跡」(只有有歷史紀錄才顯示)
- 用學生名 + 班級配對，把同一個學生跨 session 的 MBTI 連線
- 顯示「四年級時：ENFP → 五年級下：ENFJ → 六年級上：ENTJ」
- **小心隱私**：用學生姓名 + 班級當 key 沒有強驗證，但教室內活動可接受
- **解鎖原因**：B1 已存所有歷史，這個就是把同名查詢拼起來

#### I2. 📈 全校 MBTI 大數據看板（匿名）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 學術 / 推廣亮點
- 公開頁 `/stats/global`：所有跑過此網站的學生 MBTI 分布（匿名）
- 跟官方研究數據比對：「台灣國小生 MBTI 分布特色」
- 看板加 IG/FB 分享按鈕，推廣加速
- 老師可截圖放教學成果報告

#### I3. 🏆 「最常見 / 最稀有」徽章
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 學生互動性
- 跑完後在結果頁顯示：
  - 「你是這班的 5 個 ENFP 之一！」
  - 「你是全校唯一一個 INTJ ✨ 稀有度 1/200」
- 即時從 classHistory 統計
- **解鎖原因**：B1 提供了統計資料源

#### I4. 📅 「期初 vs 期末對照」活動模板
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 學期完整課程設計
- 老師建房間時可標 `sessionType: "期初" | "期中" | "期末"`
- 歷史頁面用 type 配對：自動顯示「3 年 5 班 期初 vs 期末」對比圖
- 老師期末家長日：「半學期下來，這班 F 從 60% 變 73%」
- **解鎖原因**：B1 + sessionLabel 已支援，只差 type 欄位 + 配對 UI

---

### 🎨 J. **由 A1+A2 SVG 升級解鎖的「視覺進階」**

> 8 個主角 SVG 頭像已有，可以再延伸做更多視覺戲法。

#### J1. 😊 NPC 表情切換（喜怒哀樂）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 對話超有戲
- 每個主角加 4 種表情變體：normal / happy / sad / surprised
- 場景對話依文字情緒自動切換（含「😊」「😢」「😱」表情詞觸發）
- 例：阿哲 friend_04 哭訴時自動切 sad 表情
- 純 SVG 改 path 即可，不增加檔案

#### J2. 🌟 結局型專屬慶祝動畫（原 A4 + 增強）
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 結局儀式感拉滿
- 16 型每型自己的招牌動作（用 framer-motion + SVG transform）：
  - ENFP 跳起來歡呼 + 灑紙花
  - INTJ 抱胸思考雲動畫
  - ESTP 大手揮拳出汗
  - INFJ 月亮升起 + 星星
- 配合已有 reveal 音效
- 學生跟好友比較「我的動作比較酷」

#### J3. 🎨 場景背景情境變體
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 一致性提升
- 場景背景依「時段 / 情緒」變色：
  - 早晨教室：天藍 → 黃光
  - 黃昏操場：橘紅夕陽
  - 雨天走廊：藍灰 + 雨滴
- scene.bg 加額外 metadata 控制
- 純 SVG 修改

#### J4. 🌈 主角換裝（解鎖徽章用）
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 學生重玩動機
- 完成不同支線解鎖「角色服裝」：跑校隊解鎖運動服、跑藝術解鎖畫家服
- CampusIntro 角色服裝可在「徽章牆」切換
- 純前端 localStorage 紀錄

---

### 🏫 K. **由 G1 一鍵 fork 解鎖的「跨校推廣」**

> app.config.ts 已抽，現在可以建生態系。

#### K1. 🌐 「fork 我的學校」公開展示頁
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 推廣 + 反饋
- 新頁 `/community` 列出所有 fork 過此網站的學校 + 連結
- 老師 fork 後填表回報「我是 OO 國小，網址 XX」
- 用 Firebase RTDB `forks/` collection 收集
- 顯示地圖（台灣各縣市標記 + 學校數）

#### K2. 📚 「故事 pack」可插拔
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 大規模客製化
- scenes.ts 抽成 `storyPacks/{packId}/scenes.ts`
- 老師可以在 `app.config.ts` 指定 `storyPack: "default" | "rural" | "vocational"`
- 多版本場景：都市 / 偏鄉 / 國中職場版
- 別校老師可以做自己學校版本

#### K3. 🎓 教師認證系統（原 G3）
- 📊 🌙 低 ｜ ⏱️ 長期 ｜ 🎯 教育影響力
- 辦線上 2 小時工作坊：教 50 位老師如何在班上跑這個活動
- 自製徽章 + 結業證明 PDF
- 結業老師標記在地圖上

#### K4. 🌍 多語版本（簡體中文 / 英文）
- 📊 🌟 中 ｜ ⏱️ 5-7 天 ｜ 🎯 國際推廣
- 抽出所有文字到 i18n locale 檔
- 三版本：zh-TW (預設) / zh-CN / en
- LINE / 海外華僑學校可用

---

### 📝 L. **由 B2 課前快測解鎖的「自我覺察延伸」**

> 課前 4 題已建，可以加更深層覺察工具。

#### L1. 📓 課前 / 課後完整反思日記
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 SEL 社會情緒學習
- 課前 4 題之後加「你最近的心情怎麼樣？」7 點量表
- 課後加「跟剛才的心情比，有什麼變化？」
- 結果頁顯示前後心情對照 + AI 短評（用 H1 的 Gemini）

#### L2. 🎯 「我想練習的一件事」追蹤
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 課程延續性
- 結果頁讓學生寫「下學期我想練習...」存 localStorage
- 下次跑活動時跳出來問「上次你說想練習 XX，做到了嗎？」
- 老師可以收這份回饋

#### L3. 🤝 「猜你朋友的 MBTI」遊戲模式
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 班級互動爆好玩
- 老師建特殊房間：學生先猜「我覺得 XX 是 ENFP」
- 所有人跑完後對照「全班猜小傑是 ESTP 共 18 人 / 實際 ESTP」
- 推廣互相認識 + 打破刻板印象

---

### 🛠️ M. **由 v3.12/v3.13.1 RWD 解鎖的「適性深化」**

> 字級、注音、RWD 都做完，可以更精準照顧不同學生。

#### M1. 🎚️ 「適性配置檔」一鍵切換
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 老師超實用
- SettingsPanel 加「一鍵切換適性檔」按鈕：
  - 🐣 低年級：注音 ON + 字級特大 + TTS 慢速 + 自動朗讀
  - 🧒 中年級：注音 OFF + 字級大 + TTS 標準
  - 👦 高年級：注音 OFF + 字級中 + TTS 不啟動
  - 👁️ 視力友善：注音 OFF + 字級特大 + 高對比
- 一鍵切換比每個設定點選快

#### M2. 🎨 高對比 / 色盲友善模式
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 a11y 完整性
- SettingsPanel 加色彩模式 toggle
- 預設色票 + 高對比色票 + 色盲友善色票
- 結合 prefers-contrast / prefers-color-scheme media query

#### M3. ⌨️ 完整鍵盤導航
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 行動不便友善
- Tab 在選項間移動 / Enter 選擇 / Esc 關閉 modal
- 上下方向鍵切換選項
- 數字 1-4 快速選擇
- 完整 ARIA labels

#### M4. 🔊 聲控操作（Web Speech Recognition）
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 視障 / 行動不便
- 用瀏覽器 SpeechRecognition API
- 「選一」「選二」「下一段」「再唸一次」聲控
- 配合 TTS 達成完全免手操作

---

### ⚡ N. 老 backlog 重新評估（依現有架構新觀點）

#### N1. ⚡ E4 完整 a11y 稽核（仍未做）
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 學校採購硬需求
- 跑 axe-core 完整稽核
- 補：所有按鈕 aria-label、對話氣泡 role="dialog"、鍵盤 nav、screen reader 測試
- 政府採購無障礙等級需求
- **建議**：跟 M2/M3 一起做更完整

#### N2. 🎬 結局慶祝動畫（A4 仍未做）
- 已有 SVG NPC + reveal 音效 + framer-motion 基礎
- 工時降到 0.5 天（J2 升級版直接覆蓋）

#### N3. 📚 暑假特別篇支線（F1 仍未做）
- 8 個暑假場景：游泳隊集訓、家族旅行、營隊…
- 可用 H3 AI 助手快速生成草稿
- 解鎖條件：玩過至少 2 條支線

#### N4. 🌧️ 逆境特別篇（F2 仍未做，SEL 教育）
- 6 個情緒場景：被誤會、失敗、被排擠、難過、生氣、害怕
- 不同 MBTI 對逆境的不同反應
- 結合輔導課使用
- **建議優先**：SEL 是教育部當前重點

#### N5. 🧪 E2E 測試（E5 仍未做）
- 寫 Playwright 8 條關鍵流程
- CI 跑過才 deploy
- 部署不再緊張，特別是這種快速迭代的專案

---

## 🥇 阿凱老師建議下一波最優先（v3.13 後 1 週內）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 | **H1** AI 班級洞察報告 | 1 天 | C1 Gemini 已串好，再寫 1 個 prompt 就解鎖期末家長日神器 |
| 🥇 | **M1** 適性配置檔一鍵切換 | 1 天 | 老師最常問「我可以一鍵設低年級嗎？」終於有答案 |
| 🥇 | **I1** 學生個人 MBTI 變化軌跡 | 1.5 天 | B1 已存資料，這是「啊原來這就是我的成長」最感動的瞬間 |
| 🥈 | **N1+M2+M3** a11y / 高對比 / 鍵盤導航 | 3.5 天 | 一起做最有效率，採購文件需要 |
| 🥈 ✅ | **N4** 逆境特別篇 (SEL) | 3 天 | ✅ v3.14 Phase 1 完成 |
| 🥈 | **K2** 故事 pack 可插拔 | 3 天 | 為跨校推廣鋪路，G1 的延伸 |
| 🥉 ✅ | **J2** 16 型結局慶祝動畫 | 1 天 | ✅ v3.14 Phase 2 完成 |
| 🥉 ✅ | **L3** 猜朋友 MBTI 遊戲模式 | 1.5 天 | ✅ v3.14 Phase 3 完成 |

---

## 🆕 v3.14 後的下一波建議（2026-05-17 補充）

> SEL + 結局動畫 + 猜朋友 已上線後，**新一輪解鎖機會超多**。
> 下面分七個方向，每項標明「**因為什麼解鎖**」+ 工時 + 預期效益。

---

### 🌱 O. **由 SEL 已上線解鎖的「情緒教育深化」**

> N4 SEL 框架已建好之後，可以做的延伸超多，每個都直接幫到輔導老師。

#### O1. 📅 SEL 跨次紀錄 + 情緒成長軌跡
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 學期完整課程設計
- localStorage 存每次 SEL 結果 (時間 + 風格 + 4 軸分數)
- 結果頁加「我的情緒成長軌跡」展開：「9 月你是表達型 → 11 月變連結型 → 2 月又回表達型」
- 老師「期初 vs 期末對照」自動生成 → 家長日材料
- **解鎖原因**：SEL 結果結構已定義，加 localStorage history 就完成

#### O2. 🎲 SEL 班級即時同步模式
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 輔導課團體活動
- 沿用 B1 (`classroom-rtdb`) 的房間架構，新增「SEL 房間」類型
- 老師 pin SEL 情境 → 全班討論「你會怎麼選？為什麼？」
- 即時看大家分布：「8 人選表達 / 3 人選思考 / 5 人選安撫 / 4 人選連結」→ 引發討論
- 結束自動 snapshot 進 classHistory (含 SEL session 標記)
- **解鎖原因**：B1 班級同步 + SEL 內容直接組合

#### O3. 📋 SEL 反思學習單 (列印用)
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 配輔導課作業
- 仿照 `/worksheet` 加一個 SEL 專版
- 內容：6 個情境 + 我的因應風格 + 我想練習的工具 + 給自己的承諾
- A4 列印給學生帶回家做
- **解鎖原因**：worksheet 模板已有，加 SEL 內容版本就完成

#### O4. 💬 「情緒急救卡」可下載 PDF
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 學生帶在身上
- SEL 結果頁加「✨ 下載我的情緒急救卡 (錢包大小)」
- 一張 8x5cm 卡：我的風格 + 5 個工具箱項目 + 緊急聯絡人格
- HTML 轉 PNG (用 html2canvas)
- 學生印出來放書包 / 鉛筆盒裡

#### O5. 🎭 SEL 角色扮演模式 (進階)
- 📊 🌟 中 ｜ ⏱️ 2.5 天 ｜ 🎯 輔導課戲劇活動
- 6 情境改成「劇本卡」格式 + 學生抽角色卡演出
- 老師後台可生成劇本 (用 Gemini 自動寫對白)
- 適合 1 小時輔導課完整流程
- **解鎖原因**：SEL 情境 + Gemini API 已串好

#### O6. 🧘 「呼吸練習」互動動畫
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 工具箱實用化
- SEL 結果頁的「🌬️ 4-7-8 呼吸法」工具不只文字，加可點按進入的全螢幕動畫
- 圓圈擴大 4 秒 (吸氣) → 停 7 秒 (氣球暫停) → 縮小 8 秒 (吐氣)
- 配合語音引導 (用現有 TTS) + 柔和背景音
- 學生緊張時直接打開用

---

### 🎲 P. **由 L3 猜朋友模式解鎖的「班級互動延伸」**

> 名單 + 投票機制已建好，可以做更多互動遊戲。

#### P1. 🤝 「全班最佳搭檔」配對遊戲
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 換座位 / 分組好幫手
- 沿用 L3 名單 + match.ts 配對演算法
- 「老師需要選一位幹部 + 一位助手」→ 系統推薦最互補組合
- 也可一鍵「按 MBTI 平衡分 N 組」→ 印出座位表
- **解鎖原因**：parse-class + match.ts + L3 三套組合

#### P2. 💡 「最像 ENFP 的同學是誰？」反向猜
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 認識每型典型樣子
- 反過來：給你一個 MBTI 型 → 你猜班上哪個同學最像
- 比 L3 更引導學生主動回想「他平常什麼樣子像 ENFP」
- 16 型每題挑 1 個猜，最後對照正解

#### P3. 🎬 「MBTI 配音猜聲音」遊戲
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 連結 #37 NPC TTS
- 用 #37 已有的 25 個 NPC 聲音 profile
- 老師預錄 8 個學生的聲音 (一句話) → 對照 NPC TTS
- 學生猜「老師你說的這句話像哪個 MBTI 的聲音？」
- 多媒體實驗
- **解鎖原因**：#37 NPC TTS 已上線

---

### 🎬 Q. **由 J2 結局動畫解鎖的「動畫框架延伸」**

> framer-motion + emoji 動畫框架建好，可以套到更多場景。

#### Q1. ⭐ 場景章節轉場特效
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 故事節奏感
- 進 chapter 2/4/6 時播 1.5 秒「章節提示」動畫
  - Ch 2 「📚 開學週結束，社團博覽會」+ 書本翻動
  - Ch 4 「🎪 校慶準備倒數」+ 紙花飄
  - Ch 6 「🌅 校慶當天」+ 太陽升起
- **解鎖原因**：J2 emoji 動畫框架可重用

#### Q2. 🎁 課後成就解鎖小動畫
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 重玩動機
- 跑完 4 條支線 → 解鎖「校園全才」徽章 + 1.5 秒動畫
- SEL 4 種風格都跑過 → 解鎖「情緒高手」徽章 + 動畫
- 累積成就放在 `/types` 頁面

#### Q3. 🎊 SEL 結果頁也加慶祝動畫
- 📊 🌟 中 ｜ ⏱️ 0.3 天 ｜ 🎯 SEL 跟 MBTI 體驗對齊
- 4 種因應風格各自的慶祝動畫
  - 🌸 表達型 → 花朵綻放 + 愛心
  - 🧠 思考型 → 燈泡 + 齒輪
  - 🧘 安撫型 → 月亮 + 雲朵飄
  - 🫂 連結型 → 雙手相握 + 心連線
- **解鎖原因**：TypeCelebration 元件直接複用

---

### 🤖 R. **由 Gemini + 多模組整合解鎖的「AI 加值」**

> Gemini 串好 + 多個資料源 (B1/SEL/L3) → 多模態組合超有空間。

#### R1. 🌧️ Gemini for SEL — 個人化情緒處方
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 SEL 教育閉環
- SEL 結果頁加「✨ AI 為你寫一段情緒成長處方」
- 把 4 軸分數 + 主導風格送 Gemini，產出：
  - 「你最近一週可以練習的 3 件具體小事」
  - 「遇到 OO 情境時可以這樣做」
- 比通用工具箱更個人化
- **解鎖原因**：C1 + SEL 直接組合

#### R2. 💭 「老師我這樣可以嗎？」AI 諮詢窗
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 SEL 課堂支援
- SEL 結果頁加 chat box，學生可問「我朋友最近都不理我，怎麼辦？」
- Gemini 用「同理 + 引導 + 不下診斷」回應 + 必要時提示「找大人聊」
- 嚴格 prompt + 話題守門
- **建議**：先觀察 H4 雙胞胎聊聊反應再做

#### R3. 📊 AI 全校 SEL 健康度分析
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 學校行政層級
- 用 Firebase RTDB 收所有 SEL 結果 (匿名)
- 老師後台「全校 SEL 風格分布」+ AI 解讀「這代表什麼？要注意什麼？」
- 給輔導室主任 / 校長報告材料

#### R4. 📚 自動生成故事支線 (給你)
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 你擴充內容超省力
- 開發者祕密頁 `/dev/story-gen`：輸入主題 + 章節數 → Gemini 生 scenes.ts 格式
- 你檢查 → 微調 → 複製貼上到 scenes.ts → push
- 從零寫一條支線 3 天 → AI 助手 1 小時

---

### 📊 S. **跨模組整合的新功能**

> 多個已上線功能組合出全新體驗。

#### S1. 🎓 完整「自我探索三部曲」課程包
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 一整堂課的完整體驗
- 一個「完整體驗模式」按鈕 → 順著做：
  1. **MBTI 校園奇遇記** (10 分鐘故事 RPG)
  2. **SEL 逆境特別篇** (8 分鐘情緒探索)
  3. **猜朋友 MBTI** (10 分鐘班級互動)
- 三段都完成解鎖「自我探索王」徽章 + 綜合報告 PDF
- 給老師：「45 分鐘輔導課可以這樣排」直接用
- **解鎖原因**：三個內容都上線了，組合就是新體驗

#### S2. 🔗 MBTI ↔ SEL 風格關聯分析
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 學術 / 深度認識
- 學生跑過兩個之後，結果頁顯示：「ENFP 學生最常出現的因應風格是表達型 (60%) + 連結型 (30%)」
- 自己看：「我是 ENFP + 思考型 — 在 ENFP 群裡算少見，這是我的特色」
- 累積資料越多越準確
- **解鎖原因**：MBTI + SEL 都有資料

#### S3. 📱 「我的人格全圖」分享卡
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 IG 分享、推廣
- 結合 MBTI + SEL + 走的支線 + 課前猜測一張 1080×1080 動態卡
- 用 Canvas API 即時生成
- Web Share API 一鍵分享 LINE/IG/FB
- **解鎖原因**：所有資料已存 sessionStorage

#### S4. 🎯 給班級的「綜合學習成果報告」
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 期末家長日終極材料
- `/teacher/history` 加「綜合報告」按鈕
- 全班 MBTI 分布 + SEL 風格分布 + 互動討論建議
- 可印 A4 / PDF / 直接投影
- 老師完成課程就有家長日材料

---

### ⚡ T. 老 backlog 重新排序（v3.14 後新觀點）

| 項目 | 原排序 | 新排序原因 |
|---|---|---|
| **N1 + M2 + M3** a11y / 高對比 / 鍵盤導航 | 🥈 | 仍然重要，學校採購硬需求 |
| **K2** 故事 pack 可插拔 | 🥈 | SEL 也可變 pack，價值更高了 |
| **M1** 適性配置檔一鍵切換 | 🥇 | 不變，老師最常問 |
| **I1** 學生個人 MBTI 軌跡 | 🥇 | 跟 O1 (SEL 軌跡) 一起做更完整 |
| **H1** AI 班級洞察報告 | 🥇 | 升級包含 SEL，價值更大 |

---

## 🥇 阿凱老師建議下一波最優先（v3.14 後 1 週內）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 ✅ | **S1** 自我探索三部曲課程包 | 2 天 | ✅ v3.15 Phase 4 完成 |
| 🥇 ✅ | **R1** Gemini for SEL — 情緒處方 | 1 天 | ✅ v3.15 Phase 2 完成 (+ v3.15.1 加 TTS 自動朗讀) |
| 🥇 | **O1+I1** 跨次紀錄 + 個人成長軌跡 | 2 天 | MBTI 跟 SEL 一起做，「我半年來的變化」最感動 |
| 🥇 | **O2** SEL 班級即時同步 | 2 天 | B1 房間 + SEL 內容 = 輔導課團體活動殺手鐧 |
| 🥈 | **H1** AI 班級洞察報告 (含 SEL) | 1.5 天 | 期末家長日終極神器 |
| 🥈 | **N1+M2+M3** a11y / 高對比 / 鍵盤 | 3.5 天 | 採購文件硬需求 |
| 🥉 ✅ | **O4** 情緒急救卡 PDF | 0.5 天 | ✅ v3.15 Phase 3 完成 (+ v3.15.1 加 TTS 念出工具箱) |
| 🥉 ✅ | **Q3** SEL 結果頁慶祝動畫 | 0.3 天 | ✅ v3.15 Phase 1 完成 |

---

## 🆕 v3.15 後的下一波建議（2026-05-17 補充）

> SEL 完整化 + 三部曲課程包 + 全套 TTS 上線後，**整個生態系幾乎完備**。
> 下一波重點在「**內容收尾 → 推廣 → 進階教學功能**」三方向。

---

### 🌱 U. **由 v3.15 完整化解鎖的「內容收尾」**

> 學生跑完三部曲後的「再下一步」 — 留存 + 反思 + 跨次成長。

#### U1. 📓 「我的學習歷程冊」(歷次紀錄日記本)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 自我覺察 + 期末家長日材料
- 把所有歷次 MBTI / SEL / 猜朋友結果存 localStorage (跨 session)
- 個人頁 `/me` 顯示時間軸：「2026/3 你是 ENFP 表達型 → 2026/9 你變 ENFJ 連結型」
- 可印 A4 學期成長紀錄
- **解鎖原因**：v3.15 三段都有 sessionStorage，升級成 localStorage 跨次保存即可

#### U2. 💌 「給未來自己的一封信」
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 SEL 反思深化
- SEL 結果頁加「寫一封信給 3 個月後的自己」
- 填完存 localStorage + 顯示日期
- 3 個月後重訪結果頁，跳出「3 個月前你寫給自己的信來了 💌」
- 純前端 zero backend

#### U3. 🎯 「下週我要練習的一件事」打卡
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 SEL 課程延續性
- SEL 結果頁學生選一個工具箱項目當作「下週目標」
- 每天打開網站跳「今天有試試 OO 嗎？」7 天勾選
- 連續勾 7 天 → 解鎖「情緒練習者」徽章
- 簡單但效益大

#### U4. 🎒 三部曲完成證書 PDF
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 學生收藏 + 老師獎勵
- Journey 完成後加「下載完成證書 (A4 直印)」
- 內含：學生姓名（自填）+ MBTI + SEL 風格 + 猜朋友準確率 + 三部曲徽章
- 漂亮的證書邊框設計
- 老師可以印出來貼班上榮譽榜

---

### 🌐 V. **跨校推廣 / 教育生態圈**

> v3.15 SEL + 三部曲完整後，**就是推廣的最佳時機**。

#### V1. 🍴 「fork 我的學校」公開展示頁 (原 K1 升級)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 教育影響力 ROI 爆表
- 新頁 `/community` 列出所有 fork 過此網站的學校 + 連結
- 老師 fork 後填表回報「OO 國小，網址 XX，活動心得」
- 用 Firebase RTDB `forks/` collection 收集
- 顯示台灣地圖標記 + 學校數
- 配合 G1 (一鍵 fork 模板) 推廣到全國

#### V2. 📚 「故事 pack」可插拔架構 (原 K2)
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 大規模客製化基礎
- `scenes.ts` 抽成 `storyPacks/{packId}/scenes.ts`
- `app.config.ts` 加 `storyPack: "default" | "rural" | "high-school"` 選項
- 內建 3 版本：都市國小 / 偏鄉小校 / 國中初探
- 各 pack 都可單獨 fork 出去客製化

#### V3. 🌍 多語版本 (zh-CN / en-US)
- 📊 🌟 中 ｜ ⏱️ 5-7 天 ｜ 🎯 國際推廣
- 抽出所有文字到 i18n locale 檔
- 三版本：zh-TW (預設) / zh-CN / en-US
- 海外華僑學校 / 國際學校可用
- SEL 內容國際通用 (CASEL 是美國框架)

#### V4. 📖 完整開源教學文件
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 教師社群推廣
- 寫《用 Claude Code 半年從零打造全國推廣的 MBTI 校園 RPG 開發記》
- 投稿教育月刊 / 教育部數位學習電子報
- 文章內含 fork 教學 + 系統架構 + 教學經驗

#### V5. 🎓 教師研習工作坊 + 結業證書
- 📊 🌟 中 ｜ ⏱️ 長期 ｜ 🎯 推廣 + 教師社群
- 辦線上 2 小時工作坊：教 50 位老師如何在班上跑活動
- 完成者頒「MBTI 校園引導師」電子證書 (PDF 自製)
- 結業老師標記在 V1 地圖上

---

### 🤖 W. **AI 加值再深化 (Gemini 已串好)**

> v3.15 兩個 Gemini widget 已上線，**接下來可以更聰明**。

#### W1. 📊 H1 AI 班級洞察報告 (含 SEL 升級版)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 期末家長日終極神器
- `/teacher/history` 每筆活動加「✨ 請 AI 寫一份家長日報告」
- 把 SessionSnapshot + 班級 SEL 風格分布送 Gemini
- 產出：班級整體個性 + SEL 健康度 + 3 個合作建議 + 2 個衝突提示 + 適合的下次活動
- **解鎖原因**：B1 + C1 + N4 + R1 都已串好

#### W2. 💭 「老師我這樣可以嗎？」 SEL AI 諮詢窗
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 SEL 課堂支援
- SEL 結果頁加 chat box，學生可問「我朋友最近不理我，怎麼辦？」
- Gemini 用「同理 + 引導 + 不下診斷」回應 + 必要時「找大人聊」
- 嚴格 prompt + 話題守門 + 老師後台可關
- 高風險功能，需謹慎設計

#### W3. 📝 H3 故事擴充 AI 助手 (你自己用)
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 內容擴充 10 倍速
- 開發者祕密頁 `/dev/story-gen`：輸入主題 + 章節數
- Gemini 依 scenes.ts 格式生成完整 Scene 物件 (含 delta + followUp)
- 你檢查微調後複製貼上 → push 即上線
- 從零寫一條支線 3 天 → AI 助手 1 小時

#### W4. 🎤 W2 進階：語音輸入 SEL chat
- 📊 🌙 低 ｜ ⏱️ 1.5 天 ｜ 🎯 低年級 + 識字弱友善
- 用瀏覽器 SpeechRecognition API
- 學生可以「說」問題給 SEL chat (不用打字)
- 回答用 TTS 念出 (跟 v3.15.1 的 TTS 整合)
- 配合 W2 一起做最完整

---

### 📈 X. **資料分析 / 老師工具**

> B1 + Journey 收集了大量資料，**做老師看的 dashboard**。

#### X1. 📊 老師個人 dashboard (`/teacher/dashboard`)
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 老師找需要的功能一鍵到位
- 老師登入後看一頁總覽：
  - 我這學期跑了 N 次活動
  - 全校 SEL 風格分布
  - 最近 5 次活動快速進入
  - 「下次活動建議」(AI 生成)
- 取代散落的 history / class-stats / journey 入口

#### X2. 📥 完整資料 CSV 匯出
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 學期報告省力
- 老師後台加「匯出全班所有資料」CSV
- 欄位：日期 / 學生名 / MBTI / SEL 風格 / 猜朋友準確率 / 走的支線
- 教務處 / 輔導室期末統計用

#### X3. 🏆 跨班級 / 跨年級比較
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 學術價值
- 老師可選「比較 3-1 班 vs 3-2 班」
- 顯示兩班 MBTI / SEL 分布並排
- 看是不是「3 年級今年偏 P 比較多」這種觀察

---

### ⚡ Y. **效能 / 品質基礎建設 (長期投資)**

#### Y1. ♿ E4 完整 a11y 稽核 (仍未做)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 學校採購硬需求
- 跑 axe-core 完整稽核
- 補：所有按鈕 aria-label / 對話氣泡 role="dialog" / 鍵盤 nav / screen reader 測試
- 政府採購無障礙等級需求

#### Y2. 🎨 M2+M3 高對比 / 鍵盤導航
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 跟 Y1 一起做
- 預設色票 + 高對比色票 + 色盲友善色票
- 完整鍵盤 nav (Tab / Enter / Esc / 方向鍵 / 數字快選)

#### Y3. 🧪 E5 E2E 測試 (Playwright)
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 部署不再緊張
- 寫 10 條關鍵流程：4 支線 + SEL + 猜朋友 + 三部曲 + 班級同步
- CI 跑過才 deploy

#### Y4. 📦 Bundle size 監測
- 📊 🌙 低 ｜ ⏱️ 0.3 天 ｜ 🎯 預防爆炸
- 加 `@next/bundle-analyzer`
- 設上限：First Load JS ≤ 200KB
- 持續監控 framer-motion / Firebase / Gemini 三大頭

---

## 🥇 阿凱老師建議下一波最優先（v3.15 後 1 週內）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 ✅ | **W1** AI 班級洞察報告 | 1.5 天 | ✅ v3.16 Phase 2 完成 |
| 🥇 ✅ | **U1** 我的學習歷程冊 | 1.5 天 | ✅ v3.16 Phase 1 完成 |
| 🥇 ✅ | **O2** SEL 班級即時同步 | 2 天 | ✅ v3.16 Phase 4 完成 |
| 🥇 ✅ | **X1** 老師個人 dashboard | 2 天 | ✅ v3.16 Phase 3 完成 |
| 🥈 | **V1** fork 我的學校公開展示 | 1.5 天 | 推廣 ROI 爆表，配合 G1 一鍵 fork |
| 🥈 | **V2** 故事 pack 可插拔 | 3 天 | 為大規模客製化鋪路 |
| 🥈 | **Y1+Y2** a11y / 高對比 / 鍵盤 | 3.5 天 | 採購文件硬需求 |
| 🥉 | **U4** 三部曲完成證書 PDF | 0.5 天 | 學生收藏、老師獎勵 |
| 🥉 | **U2** 給未來自己的一封信 | 1 天 | SEL 反思深化的浪漫設計 |
| 🥉 | **U3** 7 天打卡練習 | 1.5 天 | 把 SEL 從一次性活動變成持續習慣 |

---

## 🆕 v3.16 後的下一波建議（2026-05-17 補充）

> v3.16 完成後生態系幾乎完備 — 學生個人紀錄 + 老師 AI + dashboard + SEL 班級同步全部到位。
> 下一波重點：**完課儀式 → 推廣外擴 → 教學深化**

---

### 🎁 Z. **由 v3.16 收尾解鎖的「完課儀式 + 持續習慣」**

> 學生跑完三部曲後，下一步是「留住」+「延續」。

#### Z1. 🏆 三部曲完成證書 PDF (原 U4 升級)
- 📊 🔥 高 ｜ ⏱️ 0.5 天 ｜ 🎯 學生收藏、老師獎勵儀式感
- Journey 完成後新加「下載完成證書 (A4 直印)」
- 內含：學生姓名（自填）+ MBTI + SEL 風格 + 猜朋友 % + 完成日期 + 老師簽章區
- 漂亮的金色邊框 + 自家學校校徽（從 app.config 拿）
- 印出來貼班上榮譽榜，學生回家給家長簽

#### Z2. 💌 給未來自己的一封信 (原 U2)
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 SEL 反思深化的浪漫設計
- SEL 結果頁加「寫一封信給 3 個月後的自己」
- 填完存 localStorage + 顯示預定打開日期
- 3 個月後重訪 `/me` 跳出「💌 3 個月前你寫給自己的信來了！」
- 「我猜對了嗎？」對比現在的狀態

#### Z3. 🎯 「下週我要練習的一件事」7 天打卡 (原 U3)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 SEL 從一次性活動變持續習慣
- SEL 結果頁學生選一個工具箱項目當「下週目標」
- 每天打開網站跳「今天有試試 OO 嗎？」7 天勾選
- 連續 7 天 → 解鎖「情緒練習者」徽章 + 慶祝動畫
- 整合進 `/me` 顯示打卡熱度圖（像 GitHub contribution graph）

#### Z4. 📚 「我的工具箱合集」(跨次 SEL)
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 個人化情緒手冊
- `/me` 加區塊「我累積過的所有工具」
- 把歷次 SEL 結果的工具箱合併去重
- 學生可手動標「⭐ 最有用」+「✕ 不適合我」
- 變成個人化情緒工具手冊

---

### 🌐 AA. **由 v3.16 X1 dashboard 解鎖的「教師生態圈」**

> dashboard 是老師中心點，可以再往教師工具方向延伸。

#### AA1. 🍴 fork 我的學校公開展示 (原 V1)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 推廣 ROI 爆表
- 新頁 `/community` 列出所有 fork 過此網站的學校 + 連結
- 老師 fork 後填表回報「OO 國小 + 網址 + 心得」(用 Firebase RTDB `forks/`)
- 顯示台灣地圖標記 + 學校數計數器
- dashboard 顯示「全國有 X 校在用此網站」鼓勵感
- 配合 G1 (一鍵 fork 模板) 推廣到全國

#### AA2. 📚 故事 pack 可插拔 (原 V2)
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 大規模客製化基礎
- `scenes.ts` 抽成 `storyPacks/{packId}/scenes.ts`
- `app.config.ts` 加 `storyPack: "default" | "rural" | "high-school" | "custom"`
- 內建 3 版本：都市國小 / 偏鄉小校 / 國中初探
- 各 pack 可單獨 fork 客製化
- dashboard 顯示「當前使用 pack」+ 切換按鈕

#### AA3. 📊 跨班級比較功能
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 教學研究 / 學期報告
- dashboard 加「比較 A 班 vs B 班」按鈕
- 並排顯示兩班 16 型分布 + 4 軸 + SEL 風格
- AI 自動產出比較分析 (新 Gemini prompt)
- 老師年級會議 / 學期初會議用

#### AA4. 📅 「課程行事曆」整合
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 學期完整規劃
- dashboard 加「我的課程行事曆」
- 老師可預先安排「3/15 三年五班 SEL 主題課」
- 到時自動建立房間 + 提醒推播 (本地通知)
- 結束自動 snapshot 進歷史

#### AA5. 👥 老師協作 / 共筆
- 📊 🌙 低 ｜ ⏱️ 3 天 ｜ 🎯 學校教研社群
- 同校多個老師可看到彼此的 session (透過密碼 / 同 teacherUid 群組)
- 共筆某個班級的觀察筆記
- 學年導師交接時，前老師留下班級個性備註

---

### 🤖 AB. **由 W1 AI 班級洞察解鎖的「AI 工具系列」**

> Gemini 已串成熟，可以做更多 AI 工具給老師。

#### AB1. 💭 個別學生 AI 諮詢
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 輔導個案管理
- `/teacher/history` 每位學生卡加「✨ AI 為這位學生寫一段建議」
- 把學生個人 MBTI + SEL + 猜朋友 + 課前對應數送 Gemini
- 產出：這位學生個性特色 / 適合的學習方式 / 老師可以多注意什麼
- 輔導老師個案紀錄超實用

#### AB2. 🎤 老師備課助手 (對話式)
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 老師教案準備
- 新頁 `/teacher/ai-helper` chat 介面
- 老師可問「我這班 ENFP 偏多，下週適合什麼活動？」
- Gemini 結合班級資料 + 教學經驗回答
- 對話歷史存 sessionStorage

#### AB3. 📝 自動生成班級期末報告
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 期末作業省力
- dashboard 加「✨ 生成期末報告」按鈕
- 把整學期所有 session + AI 洞察整合
- 產出 3-5 頁 A4 報告 (含圖表 + AI 分析 + 學生軌跡)
- 教務處 / 輔導室期末交差用

#### AB4. 🎭 AI 故事擴充 (原 R4 / H3)
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 你自己擴充內容超省力
- 開發者祕密頁 `/dev/story-gen`
- 輸入主題 → Gemini 生 scenes.ts 格式
- 你檢查微調 → push 即上線
- 從零寫支線 3 天 → AI 助手 1 小時

---

### 🎨 AC. **由 v3.16 完整化解鎖的「視覺/UX 進階」**

> 內容齊全後，可以開始追求視覺體驗 polish。

#### AC1. 🎬 真實角色插畫升級 (取代 SVG)
- 📊 🌟 中 ｜ ⏱️ 5-7 天 ｜ 🎯 美術升級
- 用 Midjourney / SDXL 生 8 個 NPC 立繪 (4 種表情 × 8 角色 = 32 張)
- 場景背景 30+ 張水彩風插畫
- 取代現有 SVG，PNG/WebP 含 lazy load
- 圖檔放 public/ 或 CDN

#### AC2. 🎵 4 條支線 BGM 升級 + 環境音
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 沉浸感
- 每條支線多 1 首替代曲（學生可選）
- 加場景環境音（教室嘈雜 / 操場喊叫 / 雨聲）
- Pixabay CC0 來源

#### AC3. ⌨️ 完整鍵盤操作 + 快捷鍵
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 a11y + 老師快速操作
- 全站 Tab navigation + Enter / Esc / 方向鍵
- 數字 1-4 快速選擇選項
- `/teacher/dashboard` 加快捷鍵列 (G 跳遊戲 / H 跳歷史等)

---

### ⚡ AD. 持續未做的長期投資

#### AD1. ♿ a11y 完整稽核 (Y1)
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 學校採購硬需求
- 跑 axe-core + 補 aria-label / role / 鍵盤 nav
- 政府採購要求

#### AD2. 🧪 E2E 測試 Playwright (Y3)
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 部署不再緊張
- 10 條關鍵流程：MBTI 4 支線 / SEL / 猜朋友 / 三部曲 / 班級同步
- CI 跑過才 deploy

#### AD3. 🌍 多語版本 zh-CN / en (V3)
- 📊 🌟 中 ｜ ⏱️ 5-7 天 ｜ 國際推廣
- i18n locale 檔抽出
- 海外華僑學校 / 國際學校可用

---

## 🥇 阿凱老師建議下一波最優先（v3.16 後 1 週內）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 | **Z1** 三部曲完成證書 PDF | 0.5 天 | 學生收藏 + 老師獎勵儀式感，最小投資最大反應 |
| 🥇 | **Z3** 7 天打卡練習 | 1.5 天 | 把 SEL 從一次性變持續習慣，整合進 /me |
| 🥇 | **AB1** 個別學生 AI 諮詢 | 1.5 天 | W1 已串好，加學生視角的 prompt 就解鎖輔導個案神器 |
| 🥇 | **AA1** fork 我的學校公開展示 | 1.5 天 | 推廣 ROI 爆表，全國老師受益 |
| 🥈 | **Z2** 給未來自己的一封信 | 1 天 | SEL 反思深化的浪漫設計 |
| 🥈 | **AA2** 故事 pack 可插拔 | 3 天 | 為大規模客製化鋪路 |
| 🥈 | **AB3** 自動生成期末報告 | 1.5 天 | 期末作業省力，整合所有已有資料 |
| 🥈 | **AD1** a11y 完整稽核 | 1.5 天 | 採購文件硬需求 |
| 🥉 | **Z4** 我的工具箱合集 | 1 天 | 個人化情緒手冊 |
| 🥉 | **AC2** 4 條支線 BGM 升級 | 1 天 | 沉浸感快速提升 |

---

## 🆕 v3.18 後的下一波建議（2026-05-18 補充）

> 經過 v3.17 校園手帳設計系統重設計 + Google OAuth 上線 + v3.18 全網 RWD 大改造後，**整個生態系幾乎沒有破洞**。
> 下一波重點不再是「補功能」，而是「**深化 + 推廣 + 變現/可持續性 + 教育研究/影響力**」四方向。
> 階段分類已用到 AC，這波從 **AE** 開始（保留 AD 給 ROADMAP 老項目重整）。

---

### 🎨 AE. **由 v3.17 校園手帳設計系統解鎖的「視覺進階」**

> 紙感 + 電玩 HUD 雙風格已建立穩固 design system，可以再做更多視覺戲法 + 主題化。

#### AE1. 🎨 換季主題包（4 季限定皮膚）
- 📊 🌟 中 ｜ ⏱️ 2 天 ｜ 🎯 重玩動機 + 新鮮感
- 春櫻粉 / 夏海藍 / 秋楓橙 / 冬雪灰 — 各自一套 CSS variables
- SettingsPanel 加「季節主題」切換或自動依日期 (3-5/6-8/9-11/12-2)
- 紙感底色、coral 點綴色、washi tape 色全部跟著換
- 結合節氣彩蛋：清明節飄落花瓣動畫、聖誕節飄雪

#### AE2. 🌗 深色模式（Dark Mode 紙感版）
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 晚上玩眼睛不累 + 老師備課情境
- 紙底改深棕色 + 文字米白 + coral 略偏暗紅
- 維持紙感與 HUD 風格不變
- 預設跟 `prefers-color-scheme`，SettingsPanel 可手動切
- localStorage 持久化

#### AE3. ✨ Polaroid 風學生大頭照 + 換裝系統
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 學生個人化 + 重玩動機
- `/me` 頁加「我的角色卡」polaroid 框：MBTI 嘴/頭髮/眼鏡/服裝可選
- 解鎖機制：跑校隊解鎖運動服、跑藝術解鎖畫家服、SEL 連結型解鎖暖色系
- SVG 圖層合成（已有 8 個 NPC SVG 基底可重用）
- 純前端 localStorage 紀錄，零後端

#### AE4. 🎬 RPG 場景轉換特效升級
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 沉浸感 +30%
- 進新章節（Ch 2/4/6）加 1.5 秒「章節提示卡」彈出
- Ch 2 開學週結束 + 書本翻動 / Ch 4 校慶倒數 + 紙花飄 / Ch 6 校慶當天 + 太陽升起
- 對話框打字機效果可選（SettingsPanel 開關）

#### AE5. 🖼️ Open Graph 動態卡升級
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 LINE 分享預覽變成「Polaroid 風學生卡」
- 結果頁分享 LINE/FB → 顯示動態生成的 polaroid 卡（含學生 MBTI + 結果暱稱 + 圖案）
- @vercel/og 跑 CI Linux 環境（避 Windows local bug）
- 16 種型各有專屬模板

---

### 🌐 AF. **由 v3.17.4 Google OAuth 解鎖的「跨裝置帳號生態」**

> 老師 Google 帳號已串好，可以做帳號分層 + 多老師協作 + 學生帳號（謹慎評估）。

#### AF1. 🏫 老師端「跨班級總覽」
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 一個老師教多個班的剛需
- dashboard 改成支援多班：3-5 班 / 3-6 班 / 5-2 班 並列卡
- 每班獨立顯示 MBTI 分布 + SEL 風格 + 最近活動
- 切換班級不重新登入，session metadata 加 `className` 欄位
- AI 班級洞察自動跨班比較「為什麼 3-5 班 ENFP 比 3-6 班多 30%」

#### AF2. 👥 同校老師協作 / 學年共筆
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 學校教研社群形成
- Firebase RTDB 加 `schools/{domain}/teachers/{uid}` collection
- 同 Google email domain (smes.tyc.edu.tw) 的老師自動同校
- 共筆某個班級的「個性備註」/「適合分組」/「需注意觀察的學生」
- 學年導師交接：5 年級導師 → 6 年級導師接班時，前老師留的備註自動可見

#### AF3. 🎓 老師專業檔案匯出（教評會神器）
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 教師甄選 / 進修檔案
- dashboard 加「📥 匯出教師專業檔案 PDF」
- 含「我用了 X 次活動，輔導 Y 位學生，跨 Z 個班級」+ 時間軸 + 學生回饋摘要 + 學校 logo
- 適合放教評會、教師專業發展檔案、學年初家長會 ice-breaker

#### AF4. 🎒 學生帳號（高年級才開放，純可選）
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 跨裝置存個人成長 + 隱私嚴格保護
- 高年級學生可選擇用學校 Google 登入（家長同意後）
- `/me` 學習歷程冊自動雲端同步
- 跟老師帳號的關係：學生加入「3-5 班」房間時自動標 className 連結
- **隱私嚴格**：學生資料只老師可看，且不顯示真實姓名（用 displayName 別名）
- **預設關閉**：學校 admin 主動 opt-in 才開放，避免 COPPA 風險

#### AF5. 📊 教育局 / 縣市區域看板（dream）
- 📊 🌙 低 ｜ ⏱️ 5 天 ｜ 🎯 教育影響力
- 教育局 admin 帳號可看「桃園市 5 所國小、X 班、Y 名學生」匿名統計
- 各校 SEL 風格分布跟區域平均比較
- 可寫成研究論文資料

---

### 📱 AG. **由 v3.18 RWD 大改造解鎖的「手機原生體驗 + PWA 完整化」**

> 手機 RWD 修好了，但仍是「網頁感」，下一步是「App 感」。

#### AG1. 📱 PWA 完整化（manifest + install banner + offline）
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 學生加到桌面、離線可玩 MBTI（不含 OAuth/Firebase 功能）
- ✅ 已有：Service Worker（network-first HTML / cache-first assets）+ 版本通知
- 🚧 待補：
  - `manifest.webmanifest` 加 `display: "standalone"` + `theme_color` + `background_color` + `start_url`
  - install prompt 主動觸發 banner（`beforeinstallprompt` 事件已偵測但沒 UI）
  - splash screen 設計（用 design system 紙感）
  - offline fallback 頁面（沒網路時顯示「校園奇遇記也在等你回來」可愛卡）

#### AG2. 🍔 SiteNav 進階：sticky + 自動收起
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 長頁面瀏覽體驗
- 滑下時 nav 自動上滑收起、滑上時又出現（IG / FB 都這樣）
- sticky top:0 + 透明度 + backdrop blur
- 手機長 dashboard / history 頁面瀏覽超舒服

#### AG3. 📤 Web Share API 全站化
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 LINE 分享一鍵到位
- 結果頁、SEL 結果、Journey 完成都加「📤 分享」按鈕
- 用 `navigator.share()` 觸發 OS 原生 share sheet
- fallback 到複製連結 / Email
- 比 LINE / FB share button 更原生

#### AG4. 🎯 Pull-to-refresh 老師 dashboard
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 老師滑手機看班級資料的 native gesture
- dashboard / history 加 pull-to-refresh
- 用純 CSS + touch event 做（不裝套件）
- 強化「跟一般 app 一樣」的觸感

#### AG5. 🔔 推播通知（PWA 進階）
- 📊 🌙 低 ｜ ⏱️ 2 天 ｜ 🎯 老師活動提醒 / 學生打卡提醒
- Firebase Cloud Messaging
- 老師：「上次活動 7 天前了，要不要再跑一次？」
- 學生（自願 opt-in）：「今天有試試你的情緒工具嗎？」（配 SEL 7 天打卡）
- 隱私謹慎：學生通知預設關閉、需家長同意

#### AG6. 📷 手機相機掃 QR code 加入房間
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 課堂上學生掃黑板 QR 即加入
- /join 頁加「📷 掃 QR」按鈕
- 用 `BarcodeDetector` API（Chrome / Safari 支援）
- fallback 到手動輸入房號
- 比學生輸入 6 位房號快 10 倍

---

### 🤖 AH. **由今天 3 個新 skill 沉澱解鎖的「研發品質提升」**

> 今天固化 3 個 skill 把過往踩雷沉澱下來，連帶解鎖了「自動化檢測」工作流。

#### AH1. 🧪 pre-commit hook 跑 skill-aware lint
- 📊 🔥 高 ｜ ⏱️ 1 天 ｜ 🎯 杜絕同類型 bug 再犯
- husky + lint-staged 跑：
  - `nextjs-ssg-hydration-window-check`：grep render 內呼叫 `isFirebaseAvailable()` / `typeof window` 等
  - `firebase-rules-client-schema-sync`：diff TS interface vs database.rules.json 是否同步
  - `tailwind-hidden-vs-custom-display-conflict`：grep `className="xxx hidden lg:flex"` 對比 globals.css 是否寫死 display
- 任一條 warning 就阻擋 commit + 顯示對應 skill 連結

#### AH2. 🧪 Playwright E2E 測試（11 條關鍵流程）
- 📊 🔥 高 ｜ ⏱️ 2 天 ｜ 🎯 部署不再靠人眼驗
- 流程：4 條 MBTI 支線 + SEL + 猜朋友 + 三部曲 + 班級同步 + OAuth 登入 + 房間建立 + 投影模式
- **加 mobile viewport 測試**（用今天學到的 Chrome MCP iframe 模擬法）
- CI 跑過才 deploy

#### AH3. 🌐 全網 Chrome MCP iframe 自動截圖 visual regression
- 📊 🌟 中 ｜ ⏱️ 1.5 天 ｜ 🎯 視覺改動不知不覺壞掉
- CI 用 puppeteer / playwright 開 16 頁 × 3 viewport (390/768/1280) = 48 張截圖
- 跟前次比對，diff > 5% pixel 就標 warning
- 抓 design system 改動意外破壞別頁的 case

#### AH4. ⚡ Lighthouse CI（每次 push 自動跑分）
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 不讓 framer-motion / Firebase 默默拖慢
- 加 `@lhci/cli` 進 GitHub Actions
- 設下限：Performance ≥ 90 / Accessibility ≥ 95 / SEO ≥ 90 / Best Practices ≥ 95
- 不達標 PR fail
- 每月趨勢圖回看「哪個版本拖慢了」

#### AH5. 📦 Bundle size 監測 + budget
- 📊 🌟 中 ｜ ⏱️ 0.3 天 ｜ 🎯 防 First Load JS 默默爆炸
- 加 `@next/bundle-analyzer`
- 設上限：First Load JS ≤ 200KB（目前 106KB OK，但 framer-motion 是大頭佔 50KB）
- 評估把對話氣泡的 framer-motion 換成 CSS transition，省 30KB

#### AH6. 🐛 全站錯誤回報 Sentry / 自建
- 📊 🌟 中 ｜ ⏱️ 0.5 天 ｜ 🎯 不漏接 production bug
- `window.onerror` + `unhandledrejection` → 送 Firebase RTDB `errors/` collection
- dashboard 加「最近 7 天錯誤」面板，老師用 = debug 救星
- 跟 v3.17.5 React #418 那次一樣的問題，早 7 天就能抓到

---

### 🎓 AI. **教育研究 / 學術價值 / 影響力**

> 跑了大量班級活動累積資料，可以變成研究 + 推廣材料。

#### AI1. 📚 「使用心得個案研究」白皮書
- 📊 🌟 中 ｜ ⏱️ 3 天 ｜ 🎯 教育月刊 / 期刊發表
- 你自己作為作者 + 使用者，寫一份「用 Claude Code + Next.js 半年從零到全國推廣的 MBTI 校園 RPG 開發紀實」
- 含：(1) 教學動機 (2) 設計取捨 (3) 學生反饋 (4) 系統架構 (5) 持續迭代心得
- 投稿教育月刊 / 國民教育電子報 / 桃園市教師期刊

#### AI2. 🧪 班級實驗：「MBTI 介入前後人際關係改變」研究
- 📊 🌟 中 ｜ ⏱️ 1 學期觀察 ｜ 🎯 寫成論文
- 跟教育大學 / 心理系合作（雲科大 / 政大 / 高師大有相關所）
- 實驗組：跑完三部曲的班 / 對照組：沒跑的班
- 期末用 Sociogram（社會計量法）測人際網絡變化
- 數據可發表 SSCI 期刊

#### AI3. 🎓 線上 2 小時教師研習工作坊（已在 V5 提過，再強化）
- 📊 🌟 中 ｜ ⏱️ 籌備 1 週 + 1 場 2 小時 ｜ 🎯 教師社群形成
- 主題：「MBTI 校園奇遇記實戰：從零到全班參與的 60 分鐘」
- 場次目標：每月 1 場，每場 50 位老師
- 結業頒「校園 MBTI 引導師」電子證書（自製徽章 PDF）
- 結業老師標記在 V1 全國地圖
- 配合教育部「終身學習時數」可申請認證

#### AI4. 🏫 進入「教學資源平台」上架
- 📊 🌙 低 ｜ ⏱️ 申請流程 1-2 個月 ｜ 🎯 國家級曝光
- 教育部教學資源網
- 親子天下教師選讀
- 均一教育平台
- 國教院教師研習中心
- 申請流程繁瑣但一旦上架 = 全國老師都看得到

#### AI5. 🤝 跟 SEL / 輔導學會合作
- 📊 🌙 低 ｜ ⏱️ 籌備 1 個月 ｜ 🎯 領域內背書
- 寄信給台灣 SEL 學會 / 國教輔導團
- 提案：「免費提供完整 SEL 班級活動套件，請幫忙評估教育價值」
- 取得學會背書 → 進入研習推薦清單

---

### 🌱 AJ. **內容繼續擴充（劇情 / 角色 / 故事 pack）**

> 已有架構支援，可以慢慢補內容。

#### AJ1. 📚 暑假特別篇支線（沿用很久的 backlog #6 / F1）
- 📊 🌟 中 ｜ ⏱️ 2 天（用 Gemini AI 助手 H3/W3 加速）｜ 🎯 學期切換新鮮感
- 8 個暑假場景：游泳隊集訓、家族旅行、營隊、暑期作業趕工、外婆家、夏令營、新轉學生（暑期結尾）...
- 解鎖條件：玩過至少 2 條支線
- 可作為 v3 → v4 主線銜接

#### AJ2. 🌧️ SEL 進階版（霸凌 / 重大失落 / 家庭變故）
- 📊 🔥 高 ｜ ⏱️ 3 天 ｜ 🎯 輔導老師深度需求
- 現有 6 情境是日常逆境，可加 3 個進階情境給高年級
- 主題：「重要的人離開」「面對家庭變動」「目睹同學被霸凌」
- 需要更謹慎的安全話術 + 「找大人聊」明確 CTA
- 老師後台可設定「是否開啟進階情境」（預設關，需 admin 開）

#### AJ3. 🎯 國中初探 story pack（搭配 AA2 故事 pack 可插拔）
- 📊 🌟 中 ｜ ⏱️ 5 天 ｜ 🎯 銜接國中、擴大年齡層
- 同樣 6 章結構，場景改成國中教室 / 跨年級社團 / 學測壓力 / 異性朋友
- MBTI 軸計分一致，但情境深度提升
- 給國中輔導課老師用
- 內部測試 1-2 所國中後上線

#### AJ4. 👨‍👩‍👧‍👦 家長版 MBTI（成人版改編）
- 📊 🌟 中 ｜ ⏱️ 5 天 ｜ 🎯 親師活動 / 家庭日
- 重新包裝成成人版（職場、家庭、社交、伴侶）
- 學生帶回家 QR Code，全家一起玩
- AI 自動生成「親子討論題目」（你是 ENFP 媽媽，孩子是 INTJ，可以這樣談...）

---

### ♿ AK. **A11y 完整稽核（不能再拖了）**

> 從 v3.13 開始就在 backlog，從沒做完整稽核。今天 RWD 已加 prefers-reduced-motion + tap-target + ARIA dialog 等基礎，缺最後一哩。

#### AK1. ♿ axe-core 完整稽核 + 修補
- 📊 🔥 高 ｜ ⏱️ 1.5 天 ｜ 🎯 學校採購硬需求 + WCAG 2.1 AA 認證
- 跑 axe-core 全頁掃描
- 補：所有按鈕 aria-label / 對話氣泡 role="dialog" / 鍵盤 nav (Tab/Enter/Esc/方向鍵) / 顏色對比 ≥ 4.5:1
- screen reader 試讀（NVDA Windows / VoiceOver Mac）
- 取得 WCAG 2.1 AA 自評認證

#### AK2. ⌨️ 完整鍵盤導航 + 快捷鍵
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 行動不便 + 老師快速操作
- 場景選項 1/2/3/4 鍵快選
- /teacher/dashboard 快捷鍵：G 跳遊戲 / H 跳歷史 / D 新房間
- Tab order + focus ring 強化

#### AK3. 🎨 高對比模式 / 色盲友善
- 📊 🌟 中 ｜ ⏱️ 1 天 ｜ 🎯 視障 / 色弱
- 預設色票 + 高對比色票 + 色盲友善色票（Deuteranopia 主）
- 結合 `prefers-contrast` / `prefers-color-scheme`
- SettingsPanel 切換器
- 配合 AE2 dark mode 一起做

---

## 🥇 阿凱老師建議下一波最優先（v3.18 後 1 週 - 1 個月內）

> 不再「拼數量」，重質量；每項都有「清楚理由 + 已建好基礎」。

### 🥇 立刻做（一週內、零後端風險、ROI 爆表）

| 優先 | 項目 | 工時 | 為什麼這麼急 |
|---|---|---|---|
| 🥇 ✅ | **AG1** PWA 完整化（manifest+install+offline） | 1 天 | ✅ v3.19 完成（install banner + offline.html + shortcuts） |
| 🥇 ✅ | **AH1** pre-commit hook 跑 skill-aware lint | 1 天 | ✅ v3.19 完成（3 個 check + 故意 regress 驗證通過） |
| 🥇 ✅ | **AF1** 老師端跨班級總覽 | 2 天 | ✅ v3.19 完成（className 欄位 + dashboard chip + history badge） |
| 🥇 ✅ | **AG6** QR code 掃描加入房間 | 1 天 | ✅ v3.19 完成（BarcodeDetector API + 0 npm dep + fallback） |
| 🥇 | **AK1** A11y axe-core 完整稽核 | 1.5 天 | 從 v3.13 拖到現在不能再拖了，學校採購硬需求 |

### 🥈 一個月內（教學現場與推廣價值高）

| 優先 | 項目 | 工時 | 為什麼值得 |
|---|---|---|---|
| 🥈 | **AF3** 老師專業檔案匯出 PDF | 1.5 天 | 教評會神器，老師超有感 |
| 🥈 | **AF2** 同校老師協作 / 學年共筆 | 3 天 | 教研社群形成，跨學年導師交接無痕 |
| 🥈 | **AH2** Playwright E2E 測試 | 2 天 | 部署不再靠人眼驗，含 mobile viewport |
| 🥈 | **AE2** 深色模式（紙感版） | 1.5 天 | 老師備課情境 + 學生晚上玩眼睛友善 |
| 🥈 | **AH4** Lighthouse CI 跑分 + 設下限 | 0.5 天 | 不讓 framer-motion / Firebase 默默拖慢 |
| 🥈 | **AC2 / 第十波** 4 條支線 BGM + 環境音 | 1 天 | 沉浸感快速 +30% |

### 🥉 一學期內（內容深化 + 影響力擴大）

| 優先 | 項目 | 工時 | 為什麼重要 |
|---|---|---|---|
| 🥉 | **AA1** fork 我的學校公開展示 | 1.5 天 | 推廣 ROI 爆表，配合 G1 一鍵 fork |
| 🥉 | **AA2** 故事 pack 可插拔架構 | 3 天 | 大規模客製化基礎，準備接 AJ3 國中版 |
| 🥉 | **AJ1** 暑假特別篇支線 | 2 天 | 用 Gemini AI 助手加速，暑假前推出 |
| 🥉 | **AI1** 使用心得個案研究白皮書 | 3 天 | 投稿教育月刊，全國老師看到你的作品 |
| 🥉 | **AE1** 換季主題包（4 季） | 2 天 | 重玩動機 + 節氣彩蛋 |
| 🥉 | **AE3** Polaroid 大頭照 + 換裝系統 | 3 天 | 學生個人化超有感 |

### 🌌 一年內 / 長期願景（夢想清單）

| 項目 | 工時 | 為什麼夢想 |
|---|---|---|
| **AI3** 線上教師研習工作坊（月 1 場） | 籌備 1 週/場 | 形成教師社群、領域影響力 |
| **AI4** 進入教學資源平台上架 | 申請 1-2 月 | 國家級曝光 |
| **AF5** 教育局 / 縣市區域看板 | 5 天 | 給縣市教育處看，準備寫教學成果報告 |
| **AI2** 班級實驗 + 學術論文 | 1 學期 | 跟教育大學合作，SSCI 期刊發表 |
| **AJ3 + K4** 國中 story pack + 多語 | 5+5 天 | 擴大年齡 + 國際推廣 |
| **AF4** 學生帳號（高年級 opt-in） | 3 天 + 法務評估 | COPPA / 個資法評估後再做 |

---

## 🎯 給阿凱老師的「下一個月行動建議」

如果一週只有 1-2 個下午做 side project，建議這樣排：

### 🗓️ 第 1 週：完成 PWA + 自動化檢測（防未來踩雷）
- 🥇 AG1 PWA 完整化（1 天）→ 學生加桌面、離線可玩
- 🥇 AH1 pre-commit hook（1 天）→ 杜絕同類型 bug 再犯

### 🗓️ 第 2 週：老師端深化（最大教學現場 ROI）
- 🥇 AF1 跨班級總覽（2 天）→ 教多個班的老師剛需
- 🥇 AG6 QR code 掃描（1 天）→ 課堂上即時加入

### 🗓️ 第 3 週：a11y + 視覺
- 🥇 AK1 axe-core 稽核（1.5 天）→ 採購文件硬需求
- 🥈 AE2 深色模式（1.5 天）→ 晚上備課眼睛友善

### 🗓️ 第 4 週：推廣準備
- 🥉 AI1 使用心得白皮書草稿（2 天）→ 投稿準備
- 🥉 AA1 fork 公開展示頁（1.5 天）→ 推廣 ROI 爆表

**完成 1 個月後**：你會有「跨班級總覽 + 老師專業檔案 + PWA 安裝 + 高 a11y 分 + 推廣文章草稿」整套，可以開始辦研習工作坊了！

---

## 📊 三大關鍵指標追蹤建議

如果你想衡量這個專案的「教育影響力」，建議追蹤：

| 指標 | 怎麼測 | 目標 |
|---|---|---|
| **使用學校數** | AA1 fork 展示頁 + 主動回報表單 | 6 個月內 ≥ 20 校 |
| **每月活躍老師數** | OAuth 帳號 7 天內登入過 dashboard | 1 年內 ≥ 100 位 |
| **學生完成三部曲數** | localStorage 跨次累積 | 1 學期 ≥ 1000 次 |
| **Lighthouse 平均分** | AH4 CI 監測 | 維持 ≥ 95 (Acc/SEO/BP) |
| **GitHub stars** | repo 自帶 | 1 年內 ≥ 50 (老師為主，數量不是重點) |
| **教育月刊 / 期刊發表** | AI1 寫作 + 投稿 | 1 年內至少 1 篇 |

---

## 📝 給未來迭代的提醒

1. **每次改動務必更新 `ROADMAP.md`**，把完成的搬到「✅ 版本歷程」段
2. **故事擴充先用筆寫過劇情大綱**再進 `scenes.ts`，避免邏輯打架
3. **保持 GitHub Pages 靜態部署的純度**，加後端前先評估是否真的需要
4. **音效 / 動畫 / 美術升級前**做一次 Lighthouse 基準，確保不掉效能
5. **加任何老師相關功能**，先在自己班試跑一次再公開
6. **凡涉及 AI / Firebase / 付費資源**，先用免費層算清楚預算（依 skill `gemini-free-tier-first`、`firebase-stack-automation`）
7. **每次部署完一定無痕視窗開一遍** — 確認 GitHub Pages CDN 真的更新到了

---

## 🤝 維護人

- **作者**：阿凱老師（桃園市龍潭區石門國小）
- **GitHub**：[cagoooo/MBTI](https://github.com/cagoooo/MBTI)
- **線上版**：https://cagoooo.github.io/MBTI/
- **教師頁**：https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5

---

*Made with ❤️ — 一份持續更新的開發藍圖*
