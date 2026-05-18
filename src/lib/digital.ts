/**
 * 📱 數位素養 Story Pack
 *
 * 設計參考:
 *   - 教育部 108 課綱「科技資訊與媒體素養」核心素養
 *   - 國家通訊傳播委員會 NCC 媒體素養指標
 *   - Common Sense Media (美國) Digital Citizenship 框架
 *
 * 6 個情境涵蓋 2026 國小生最真實的數位日常:
 *   1. 🤖 AI 工具使用 (作業 / 創作)
 *   2. 📰 假訊息 / 查證
 *   3. 📱 短影音上癮
 *   4. 💬 班級群組霸凌
 *   5. 🔒 隱私洩漏 (圖片 / 位置)
 *   6. 🤝 線上交友安全
 *
 * 4 種「數位素養型」(依最高分軸):
 *   🛡️ 守門員 — 警覺 + 規則 + 不隨便相信
 *   🔍 探險家 — 好奇 + 用工具 + 玩中學
 *   🧘 自律者 — 自我管控 + 不上癮 + 設界線
 *   🤝 連結者 — 善用網路認識人 + 互助 + 同理
 *
 * 教育目標:
 *   - 認識自己使用網路的傾向 (沒有對錯)
 *   - 鼓勵發展「不熟」的素養面向
 *   - 學習其他同學的不同策略
 */

export type DigitalAxis = "guard" | "explore" | "discipline" | "connect";

export interface DigitalChoice {
  text: string;
  emoji: string;
  delta: Partial<Record<DigitalAxis, number>>;
  followUp: string;
}

export interface DigitalScenario {
  id: string;
  emoji: string;
  title: string;
  text: string[];
  choices: DigitalChoice[];
}

export const DIGITAL_SCENARIOS: DigitalScenario[] = [
  // 1. AI 工具使用
  {
    id: "digital_01",
    emoji: "🤖",
    title: "AI 幫我寫作業",
    text: [
      "明天要交一篇 200 字「我的暑假」作文,你還沒寫。",
      "同學說「用 ChatGPT 寫超快」,你打開後它真的幾秒就生出一篇。",
      "你看完覺得「比我自己寫的好」,但有點怪怪的。",
    ],
    choices: [
      {
        text: "看完 AI 寫的版本當「靈感參考」,自己重寫一遍",
        emoji: "🔄",
        delta: { explore: 2, discipline: 1 },
        followUp: "你把 AI 當「副駕」不是「代寫」 — 這是健康的使用方式 ✨ 你的版本帶有真實感,老師看得出來。",
      },
      {
        text: "直接交 AI 版本,但在下面標註「用 AI 協助」",
        emoji: "📝",
        delta: { guard: 2, connect: 1 },
        followUp: "你誠實標註 — 這就是「AI 倫理」的起點。老師反而稱讚你的透明度 (但提醒下次要自己想)。",
      },
      {
        text: "不用 AI,自己慢慢寫,雖然只有 150 字但都是真心話",
        emoji: "✍️",
        delta: { discipline: 3 },
        followUp: "你選擇「真實的我」勝過「完美的文字」。老師讀到你寫「奶奶煮的綠豆湯」眼睛紅紅的。",
      },
      {
        text: "用 AI 但問它 5 個問題:「為什麼這樣寫?」「換個風格再來一次?」 — 把它當寫作教練",
        emoji: "💡",
        delta: { explore: 3, connect: 1 },
        followUp: "你跟 AI 來回對話 10 次,自己學到了「分段」「比喻」技巧。你變強了,不是 AI 變強了。",
      },
    ],
  },
  // 2. 假訊息
  {
    id: "digital_02",
    emoji: "📰",
    title: "群組瘋傳的訊息",
    text: [
      "班級群組有人轉了一則訊息:「教育部宣布下週起學校禁止帶水壺!」",
      "10 個人已經按驚訝表情,有人說「太誇張了吧」,有人開始討論帶什麼喝水。",
      "你的第一反應是?",
    ],
    choices: [
      {
        text: "上教育部官網查證,5 分鐘確認是假的,然後在群組澄清",
        emoji: "🔍",
        delta: { guard: 3, connect: 1 },
        followUp: "你貼出官網連結:「沒這回事大家別緊張」。群組瞬間安靜,後來大家都謝謝你。「查證 > 轉發」是現代基本素養 ✨",
      },
      {
        text: "私訊那位轉發的同學:「你從哪裡看到的?有來源嗎?」",
        emoji: "💬",
        delta: { connect: 2, guard: 2 },
        followUp: "他回:「我媽媽傳的...」原來是長輩群組轉的。你溫和地教他怎麼查證,他學到了 — 比公開打臉有效。",
      },
      {
        text: "覺得「群組就是這樣」,不參與也不轉,只是默默封鎖那個人",
        emoji: "🤐",
        delta: { discipline: 2, guard: 1 },
        followUp: "你保護自己不被資訊污染,但其他同學還在恐慌。也許下次可以「輕輕地」澄清一句 ☁️",
      },
      {
        text: "搜尋同樣訊息的多個版本,看哪些網站在傳 — 整理出「假訊息的傳播路徑」",
        emoji: "🕵️",
        delta: { guard: 1, explore: 3 },
        followUp: "你發現是兩週前的舊假訊息又被翻出來!你把分析貼到班級群組,大家學到「老梗會復活」🧠",
      },
    ],
  },
  // 3. 短影音上癮
  {
    id: "digital_03",
    emoji: "📱",
    title: "停不下來的滑滑滑",
    text: [
      "晚上 10 點,你發現自己滑短影音滑了 1 小時還停不下來。",
      "演算法太懂你 — 每個都剛好好笑或有趣。",
      "你既煩自己沒自制力,又覺得「再看一個就睡」。",
    ],
    choices: [
      {
        text: "把手機放到房間外充電,給自己「物理距離」",
        emoji: "🌬️",
        delta: { discipline: 3 },
        followUp: "「製造距離」是打斷上癮最有效的方法 — 不在手邊就不會想滑 ☁️ 你睡前讀了 10 頁書,睡得更香。",
      },
      {
        text: "設定 30 分鐘倒數鬧鐘,到了就強制關 app",
        emoji: "⏰",
        delta: { discipline: 2, guard: 1 },
        followUp: "你用「時間結界」管自己 — 國小生有這個自制力已經贏過很多大人 ✨",
      },
      {
        text: "找最好的朋友互相監督:「我們每天滑不超過 30 分鐘」",
        emoji: "🤝",
        delta: { connect: 3 },
        followUp: "找夥伴一起改習慣比一個人撐容易很多 — 你們互相打卡,7 天後真的少滑很多 💪",
      },
      {
        text: "研究演算法為什麼這麼準 — 我要了解它怎麼操控我的注意力",
        emoji: "🔬",
        delta: { explore: 3, guard: 1 },
        followUp: "你查資料學到「正向回饋迴路」「無限滾動」「個人化推薦」 — 知道它怎麼運作,你就不容易被操控 🧠",
      },
    ],
  },
  // 4. 班級群組霸凌
  {
    id: "digital_04",
    emoji: "💬",
    title: "群組裡的玩笑變傷害",
    text: [
      "班級遊戲群組,有人開始拿小宇的口頭禪做梗圖,越做越誇張。",
      "5 個人按笑,但你看到小宇默默退出群組。",
      "你發現有些「玩笑」其實已經越線了。",
    ],
    choices: [
      {
        text: "在群組裡冷靜說:「這幾張梗圖讓小宇退群了,請大家停止」",
        emoji: "🛡️",
        delta: { guard: 2, connect: 2 },
        followUp: "你公開設下界線,有同學立刻刪圖道歉。「玩笑」跟「傷害」的差別 = 對方笑不笑得出來,你提醒了大家。",
      },
      {
        text: "私訊小宇:「我看到你退群了,你還好嗎?」",
        emoji: "💌",
        delta: { connect: 3 },
        followUp: "小宇回:「謝謝你注意到...其實我哭了。」你成為他在最孤單時的浮木。私下溫柔常比公開英雄主義有效 💖",
      },
      {
        text: "截圖存證,明天私下交給導師處理",
        emoji: "📸",
        delta: { guard: 3, discipline: 1 },
        followUp: "林老師根據截圖開班會討論「網路霸凌與玩笑的界線」,做梗圖的同學主動道歉。「正式管道」是強而有力的工具。",
      },
      {
        text: "離開那個群組,跟身邊朋友說「我們建一個新的善意群組」",
        emoji: "✨",
        delta: { connect: 2, discipline: 2 },
        followUp: "你跟 5 個朋友建了一個「友善群組」,規則:「不轉貼笑人的內容」。半年後它成了班上最受歡迎的群組 🌱",
      },
    ],
  },
  // 5. 隱私洩漏
  {
    id: "digital_05",
    emoji: "🔒",
    title: "我家住在哪?",
    text: [
      "你在 IG 限動分享了今天放學買冰淇淋的影片,順便拍了下家門口。",
      "晚上你滑限動發現:有 3 個你不認識的帳號開始追蹤你,留言「妹妹好可愛 ❤️」。",
      "你的心跳變快。",
    ],
    choices: [
      {
        text: "立刻刪掉那則限動,把帳號改成私人帳號,只給認識的人追蹤",
        emoji: "🔒",
        delta: { guard: 3, discipline: 1 },
        followUp: "你 30 秒內保護了自己 — 「私人帳號 + 認識才追蹤」是基本防線 🛡️ 你跟爸媽說了這件事,他們教你更多隱私設定。",
      },
      {
        text: "封鎖那 3 個陌生帳號,並截圖存證",
        emoji: "🚫",
        delta: { guard: 2, connect: 1 },
        followUp: "你做了該做的事。爸爸看完截圖說:「以後不要拍到家門口或學校制服」 — 你學到「資訊不要拼成地圖」🧠",
      },
      {
        text: "告訴爸媽:「我發現陌生人留言,我該怎麼辦?」",
        emoji: "🆘",
        delta: { connect: 3 },
        followUp: "媽媽抱抱你:「你來告訴我,就是最對的選擇。」她陪你檢查所有限動,你學到「找大人是勇敢不是丟臉」💖",
      },
      {
        text: "把問題寫進日記,觀察一週看會不會更多陌生帳號 — 想了解網路是怎麼運作的",
        emoji: "📔",
        delta: { explore: 2, guard: 1 },
        followUp: "你發現「位置 hashtag」會讓貼文被陌生人看到。你寫了一篇「我學到的網路安全」分享給同學 🌱",
      },
    ],
  },
  // 6. 線上交友
  {
    id: "digital_06",
    emoji: "🤝",
    title: "遊戲裡的新朋友",
    text: [
      "你在線上遊戲認識了一個玩家「阿傑哥」,他說自己也是國小生,跟你聊得很投緣。",
      "玩了三週,他突然說:「下次線下見面好嗎?我可以教你打 boss。」",
      "你的心情有點複雜 — 他是個好夥伴,但...",
    ],
    choices: [
      {
        text: "「謝謝你約我,但我不會跟網友線下見。我們繼續線上玩就好」",
        emoji: "🛡️",
        delta: { guard: 3 },
        followUp: "你溫和而堅定地拒絕。「網路上對方可能不是他說的那樣」 — 你沒有失禮,是保護自己。真正的朋友會理解。",
      },
      {
        text: "「我先跟我爸媽說,如果他們同意我們才能見」",
        emoji: "👨‍👩‍👧",
        delta: { connect: 2, guard: 2 },
        followUp: "爸媽聽完搖頭:「網路上 13 歲的人可能是 30 歲的人,絕對不能單獨見。」 阿傑哥後來就不回訊息了 — 你發現「他可能本來就不是真的小孩」🕵️",
      },
      {
        text: "「不好意思,我們學校老師說不能跟網友見面」(把學校當理由,不傷感情)",
        emoji: "🎓",
        delta: { discipline: 2, connect: 1 },
        followUp: "用「外部理由」是聰明的拒絕法 — 不用承擔對方失望的責任。阿傑哥說「OK 那繼續打遊戲」,你們維持線上友誼。",
      },
      {
        text: "想了一個晚上,跟最信任的朋友 + 爸媽 + 老師都問了一遍",
        emoji: "🧠",
        delta: { connect: 3, guard: 1 },
        followUp: "你發現 3 個大人都說「不要見」。你學到「重大決定要問多個信任的人」 — 不是不會做決定,是做更好的決定 ✨",
      },
    ],
  },
];

// ─────────────────── 計分 & 結果 ───────────────────

export interface DigitalScores {
  guard: number;
  explore: number;
  discipline: number;
  connect: number;
}

export const initialDigitalScores: DigitalScores = {
  guard: 0,
  explore: 0,
  discipline: 0,
  connect: 0,
};

export type DigitalStyle = "guard" | "explore" | "discipline" | "connect";

export interface DigitalStyleInfo {
  key: DigitalStyle;
  emoji: string;
  name: string;
  oneLiner: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  /** 5 個專屬數位工具箱 */
  toolbox: Array<{ emoji: string; name: string; how: string }>;
  /** 互補搭檔 */
  complement: { style: DigitalStyle; why: string };
  /** 給家長 / 老師的提醒 */
  forAdults: string;
  /** 慶祝色 */
  color: string;
}

export const DIGITAL_STYLES: Record<DigitalStyle, DigitalStyleInfo> = {
  guard: {
    key: "guard",
    emoji: "🛡️",
    name: "守門員",
    oneLiner: "看到可疑訊息先停三秒查證的網路警覺者。",
    description:
      "你天生對網路上的訊息有警覺心 — 不會看到什麼就信,會先問「真的嗎?」。" +
      "你重視隱私,知道什麼該公開、什麼該保留。你常常是朋友圈裡那個提醒「這是假新聞」「不要傳出去」的人。" +
      "在這個假訊息滿天飛的時代,你的警覺心保護了自己也保護身邊的人。",
    strengths: [
      "資訊查證能力強",
      "懂得保護隱私",
      "不容易被假訊息騙",
      "會幫朋友把關",
      "看穿釣魚騙局",
    ],
    growthAreas: [
      "偶爾放鬆一點 — 不是每個訊息都要查證",
      "拒絕別人時可以再溫柔一點",
      "也試著體驗網路的好玩面",
    ],
    toolbox: [
      { emoji: "🔍", name: "事實查核網站", how: "Mygopen / 台灣事實查核中心 / Cofacts" },
      { emoji: "🔒", name: "隱私設定檢查", how: "每月檢查一次社群帳號的隱私設定" },
      { emoji: "🚫", name: "封鎖 + 檢舉組合", how: "陌生騷擾立刻封鎖,嚴重就檢舉" },
      { emoji: "📸", name: "截圖存證習慣", how: "遇到可疑訊息先截圖,事後可舉證" },
      { emoji: "👨‍👩‍👧", name: "找大人商量", how: "重大決定問爸媽 / 老師 / 信任的長輩" },
    ],
    complement: { style: "explore", why: "守門員 + 探險家 = 既安全又能享受網路的好處" },
    forAdults: "守門員型孩子常被誤會「太保守 / 太擔心」 — 其實他在做正確的事。請肯定他的警覺,不要說「想太多」。",
    color: "from-blue-300 via-indigo-300 to-purple-400",
  },
  explore: {
    key: "explore",
    emoji: "🔍",
    name: "探險家",
    oneLiner: "把網路當大型遊樂園 — 什麼工具都想試試看。",
    description:
      "你對網路充滿好奇 — 新的 app、新的 AI 工具、新的功能,你都想試試。" +
      "你不怕嘗試,玩中學是你的天賦。當別人還在猶豫「這個能用嗎」,你已經摸索出 5 種用法。" +
      "你的好奇心讓你跟得上時代,也常常是同學裡「最會用工具」的那個人。",
    strengths: [
      "學新工具超快",
      "創造力強,會找替代方案",
      "不怕嘗試 + 不怕犯錯",
      "能教別人新技能",
      "玩中學的高手",
    ],
    growthAreas: [
      "嘗試前看一下隱私 / 安全提示",
      "不是每個新工具都需要立刻試",
      "也學習守門員的警覺心",
    ],
    toolbox: [
      { emoji: "🤖", name: "AI 副駕模式", how: "用 ChatGPT/Gemini 當寫作教練,不是代寫" },
      { emoji: "🎨", name: "創作工具庫", how: "Canva / CapCut / Suno 等免費工具大膽試" },
      { emoji: "🔬", name: "拆解學習法", how: "看到喜歡的功能,查它怎麼運作的" },
      { emoji: "📚", name: "教學頻道", how: "找 YouTube 教學頻道學新技能" },
      { emoji: "🎮", name: "試錯空間", how: "拿不重要的內容測新工具,出錯不怕" },
    ],
    complement: { style: "guard", why: "探險家 + 守門員 = 玩得開心又不踩雷" },
    forAdults: "探險家型孩子需要「探索的允許」 — 不要動不動禁止,陪他一起摸索更有效。提醒安全比禁用更重要。",
    color: "from-amber-300 via-orange-300 to-rose-400",
  },
  discipline: {
    key: "discipline",
    emoji: "🧘",
    name: "自律者",
    oneLiner: "自己給自己訂規矩 — 不被手機綁架的高手。",
    description:
      "你懂得「我才是手機的主人」這件事。看到別人沉迷短影音,你會說「我設了 30 分鐘鬧鐘」。" +
      "你知道網路是工具,不是時間黑洞。當別人滑到睡眠不足,你已經規劃好「什麼時候用、用多久」。" +
      "你的自律是 21 世紀最珍貴的能力 — 比聰明更難得。",
    strengths: [
      "自我管控能力強",
      "懂得設界線",
      "不容易上癮",
      "時間管理超好",
      "能影響朋友一起自律",
    ],
    growthAreas: [
      "偶爾放鬆,不要太嚴格",
      "享受網路的好玩也是 OK 的",
      "別人沒你自律,也不要 judge 他",
    ],
    toolbox: [
      { emoji: "⏰", name: "螢幕時間限制", how: "用手機內建功能設定每天上限" },
      { emoji: "📵", name: "睡前無手機區", how: "睡前 1 小時把手機放房間外" },
      { emoji: "📔", name: "使用日誌", how: "每週寫:這週花最多時間在什麼 app?值得嗎?" },
      { emoji: "🌱", name: "替代活動清單", how: "想滑手機時先試:讀書 / 散步 / 畫畫" },
      { emoji: "🎯", name: "目標導向使用", how: "打開手機前先問「我要做什麼?」" },
    ],
    complement: { style: "connect", why: "自律者 + 連結者 = 自我節制又不錯過真感情" },
    forAdults: "自律者孩子不需要被管 — 他自己管自己。請信任他、給他主導權。讚美「你怎麼做到的?」勝過「你好乖」。",
    color: "from-emerald-300 via-teal-300 to-cyan-400",
  },
  connect: {
    key: "connect",
    emoji: "🤝",
    name: "連結者",
    oneLiner: "用網路認識更多溫暖的人,也讓別人感受到溫暖。",
    description:
      "你把網路當「人與人的橋樑」。你會私訊朋友:「你今天看起來不太好,還好嗎?」" +
      "你不沉迷遊戲、不沉迷短影音,但你會花時間在「對話」上。網路擴大了你的關懷半徑。" +
      "你也懂得「線上的溫柔可以延續到線下」 — 是真實朋友圈的黏著劑。",
    strengths: [
      "用網路維繫深度友情",
      "私訊比公開貼文多",
      "敏感察覺朋友的情緒變化",
      "懂得線上線下平衡",
      "是朋友的網路浮木",
    ],
    growthAreas: [
      "也要設界線,不是 24 小時待命",
      "別人不回訊息不是針對你",
      "也學一點守門員的警覺",
    ],
    toolbox: [
      { emoji: "💌", name: "私訊問候習慣", how: "每週主動關心 1 位看起來低落的朋友" },
      { emoji: "🎁", name: "驚喜小卡片", how: "用 Canva 做生日卡 / 鼓勵卡傳給朋友" },
      { emoji: "📞", name: "視訊聊天", how: "純文字不夠時,改視訊看臉聽聲音" },
      { emoji: "🏡", name: "線下聚會約定", how: "重要的話「我們週末面對面聊」" },
      { emoji: "🌐", name: "建立善意群組", how: "規則:「不轉貼笑人的內容」" },
    ],
    complement: { style: "discipline", why: "連結者 + 自律者 = 真感情但不被綁架" },
    forAdults: "連結者孩子的網路使用「品質高 > 時間長」 — 不要只看時數,看他在做什麼。允許他「為朋友花時間」。",
    color: "from-pink-300 via-rose-300 to-red-300",
  },
};

/** 算出主導風格 (依最高分軸) */
export function calcDigitalStyle(scores: DigitalScores): DigitalStyle {
  const entries = Object.entries(scores) as Array<[DigitalStyle, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
