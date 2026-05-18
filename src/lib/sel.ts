/**
 * 🌧️ SEL 逆境特別篇 — Social-Emotional Learning 社會情緒學習
 *
 * 設計參考:
 *   - CASEL 5 大能力 (self-awareness / self-management / social-awareness /
 *     relationship skills / responsible decision-making)
 *   - 兒福聯盟兒少情緒能力指標
 *   - 教育部 108 課綱「身心素質與自我精進」素養
 *
 * 6 個情境涵蓋國小常見情緒事件 (覆蓋兒福聯盟調查最常發生 6 類):
 *   1. 😢 被誤會 — 友誼衝突
 *   2. 😖 失敗   — 自我挫折
 *   3. 🥺 被排擠 — 同儕關係
 *   4. 😭 難過   — 失去
 *   5. 😡 生氣   — 不公平 / 侵犯
 *   6. 😰 害怕   — 預期壓力
 *
 * 4 種因應策略 (Coping Strategies Inventory 簡化版):
 *   - 🌸 Express   表達情緒：哭、寫日記、跟人說、畫出來
 *   - 🧠 Solve     解決問題：想原因、找辦法、列計畫、查資料
 *   - 🧘 Calm      自我安撫：深呼吸、暫離、運動、聽音樂
 *   - 🫂 Connect   尋求支持：找家人 / 朋友 / 老師、抱抱
 *
 * 結果 4 種主要風格 (依最高分軸):
 *   🌸 表達型 / 🧠 思考型 / 🧘 安撫型 / 🫂 連結型
 *
 * 教育目標 (老師可在輔導課帶):
 *   - 認識自己的主要因應方式 (沒有對錯)
 *   - 鼓勵發展「不熟」的因應方式 (情緒工具箱要多樣)
 *   - 學習其他同學的不同策略 (尊重多元)
 */

export type SelAxis = "express" | "solve" | "calm" | "connect";

export interface SelChoice {
  text: string;
  emoji: string;
  /** 主要對應的因應策略 (一個 choice 加 1-2 個策略點數) */
  delta: Partial<Record<SelAxis, number>>;
  /** 選了之後出現的肯定話 */
  followUp: string;
}

export interface SelScenario {
  id: string;
  emoji: string;
  /** 大標題 (情緒名) */
  title: string;
  /** 場景描述 */
  text: string[];
  choices: SelChoice[];
}

export const SEL_SCENARIOS: SelScenario[] = [
  // 1. 被誤會
  {
    id: "sel_01",
    emoji: "😢",
    title: "被誤會",
    text: [
      "下課時，你最好的朋友突然不理你。",
      "後來才知道，她以為你在背後說她壞話 — 但你根本沒有！",
      "她的眼神好生氣，你心裡好委屈。",
    ],
    choices: [
      {
        text: "「我真的沒有說！」直接走過去把整件事說清楚",
        emoji: "💬",
        delta: { express: 1, connect: 1 },
        followUp: "願意主動把心裡話講出來，需要很大的勇氣 ✨",
      },
      {
        text: "先回家寫日記把感覺整理好，明天再找她",
        emoji: "📔",
        delta: { express: 1, calm: 1 },
        followUp: "先安頓自己再行動，是很有智慧的做法 🌱",
      },
      {
        text: "想一想她為什麼會誤會？是不是哪裡傳話傳錯了？",
        emoji: "🔍",
        delta: { solve: 2 },
        followUp: "找到根源比急著辯解更能解決問題 🧠",
      },
      {
        text: "找一個你信任的大人聊聊，看看怎麼辦",
        emoji: "🫂",
        delta: { connect: 2 },
        followUp: "尋求幫助不是軟弱，是聰明 💖",
      },
    ],
  },

  // 2. 失敗
  {
    id: "sel_02",
    emoji: "😖",
    title: "失敗",
    text: [
      "你練習了三個月的比賽結果今天揭曉 — 你沒得獎。",
      "看著得獎名單，你的眼淚在眼眶裡打轉。",
      "練了那麼久，為什麼是這樣的結果？",
    ],
    choices: [
      {
        text: "找個沒人的角落，讓眼淚流出來",
        emoji: "😭",
        delta: { express: 2 },
        followUp: "讓情緒流出來，比硬撐健康得多 💧",
      },
      {
        text: "深呼吸，告訴自己「沒關係，下次再來」",
        emoji: "🧘",
        delta: { calm: 2 },
        followUp: "自我安撫的能力，會陪你一輩子 ✨",
      },
      {
        text: "回去看看評審回饋，找出可以進步的地方",
        emoji: "📊",
        delta: { solve: 2 },
        followUp: "從失敗學東西，比贏更難能可貴 🌟",
      },
      {
        text: "打電話給最愛的家人或好朋友，讓他們抱抱你",
        emoji: "📞",
        delta: { connect: 2 },
        followUp: "難過時被陪伴，療癒會發生 💖",
      },
    ],
  },

  // 3. 被排擠
  {
    id: "sel_03",
    emoji: "🥺",
    title: "被排擠",
    text: [
      "下課鐘響，你習慣跟的三個朋友突然一起走了。",
      "你追上去，他們說「我們要去做別的事」，然後就把你留在原地。",
      "你站著，覺得自己好像不被需要。",
    ],
    choices: [
      {
        text: "「你們為什麼不等我？」勇敢問清楚",
        emoji: "💬",
        delta: { express: 1, solve: 1 },
        followUp: "說出感受，給對方機會回應 ✨",
      },
      {
        text: "先去做自己想做的事，自己一個人也可以開心",
        emoji: "📖",
        delta: { calm: 1, solve: 1 },
        followUp: "「能跟自己相處」是超強的能力 🌱",
      },
      {
        text: "去找其他平常少聊的同學，說不定會有新發現",
        emoji: "🤝",
        delta: { connect: 1, solve: 1 },
        followUp: "拓展不同朋友圈，世界會更大 🌍",
      },
      {
        text: "回家告訴爸媽，問問他們小時候有沒有遇過",
        emoji: "🫂",
        delta: { connect: 2 },
        followUp: "大人的經驗常常超級有用 💖",
      },
    ],
  },

  // 4. 難過 (失去)
  {
    id: "sel_04",
    emoji: "😭",
    title: "難過",
    text: [
      "你最愛的寵物今天走了。",
      "牠陪了你好幾年，今天再也不會搖尾巴歡迎你回家。",
      "心裡有一個大洞，怎麼補都補不起來。",
    ],
    choices: [
      {
        text: "畫一張畫紀念牠，把所有開心的回憶畫下來",
        emoji: "🎨",
        delta: { express: 2 },
        followUp: "用創作表達思念，是最美的紀念 ✨",
      },
      {
        text: "去做你跟牠喜歡一起做的事情（如散步、去公園）",
        emoji: "🏞️",
        delta: { calm: 1, express: 1 },
        followUp: "在熟悉的地方，會感覺牠還在身邊 🌱",
      },
      {
        text: "找家人一起說說牠的故事，互相安慰",
        emoji: "👨‍👩‍👧",
        delta: { connect: 2 },
        followUp: "難過時不必一個人扛，分享會變輕一點 💖",
      },
      {
        text: "深呼吸、慢慢哭、再深呼吸，給自己時間慢慢好",
        emoji: "🌬️",
        delta: { calm: 2 },
        followUp: "悲傷需要時間，這完全 OK 🫂",
      },
    ],
  },

  // 5. 生氣
  {
    id: "sel_05",
    emoji: "😡",
    title: "生氣",
    text: [
      "你最珍貴的收藏 — 阿公送的玩具，被弟弟拆壞了。",
      "怎麼修也修不回來。",
      "你氣到全身發抖，想大叫想丟東西。",
    ],
    choices: [
      {
        text: "先離開現場，去喝口水、走一走，等身體冷靜",
        emoji: "🚶",
        delta: { calm: 2 },
        followUp: "氣到頭頂時離開現場是高情商表現 🧘",
      },
      {
        text: "用力深呼吸數 10 下，等心跳變慢再說話",
        emoji: "🌬️",
        delta: { calm: 2 },
        followUp: "身體冷靜下來，腦袋才能想清楚 ✨",
      },
      {
        text: "找爸媽說：「我現在很生氣，你們可以幫我嗎？」",
        emoji: "💬",
        delta: { express: 1, connect: 1 },
        followUp: "把情緒說出來而不是行動發洩，超棒 💖",
      },
      {
        text: "想辦法 — 看能不能用什麼方式紀念這個玩具",
        emoji: "💡",
        delta: { solve: 2 },
        followUp: "把破壞變成創造，是不簡單的轉念 🌟",
      },
    ],
  },

  // 6. 害怕 (預期壓力)
  {
    id: "sel_06",
    emoji: "😰",
    title: "害怕",
    text: [
      "明天上台演講，全校都會看你。",
      "你的稿子已經背得滾瓜爛熟，但只要想到台上那麼多眼睛 ——",
      "你的心臟就跳得超快，肚子也開始痛。",
    ],
    choices: [
      {
        text: "閉上眼睛，想像自己在台上順利講完、大家鼓掌的畫面",
        emoji: "🧘",
        delta: { calm: 2 },
        followUp: "心理預演有科學根據真的有效 ✨",
      },
      {
        text: "去找老師或朋友，再練一次給他們聽",
        emoji: "🎤",
        delta: { connect: 1, solve: 1 },
        followUp: "暖場一下會讓正式上台更穩 🌟",
      },
      {
        text: "告訴爸媽：「我超緊張」，讓自己被理解",
        emoji: "🫂",
        delta: { express: 1, connect: 1 },
        followUp: "被理解就是被支持，會有勇氣 💖",
      },
      {
        text: "把害怕的點寫下來，每一點都想一個應對方法",
        emoji: "📝",
        delta: { solve: 2 },
        followUp: "面對害怕的最好方式是準備 🧠",
      },
    ],
  },

  // 7. 環保焦慮 — 現代孩子真實的「氣候情緒」(eco-anxiety)
  {
    id: "sel_07",
    emoji: "🌍",
    title: "為地球擔心",
    text: [
      "上完一堂海洋污染的課，老師播了一段海龜被塑膠袋纏住的影片。",
      "回家路上你一直想著那隻海龜，越想越難過。",
      "你覺得「我們是不是太晚了？我能做什麼？」",
    ],
    choices: [
      {
        text: "寫一篇日記把難過畫出來：海龜在乾淨海裡游的樣子",
        emoji: "🎨",
        delta: { express: 2 },
        followUp: "藝術是抒發環境焦慮的好出口，你的畫也許可以參加比賽 🎨",
      },
      {
        text: "上網查「國小生可以做的 5 件環保小事」，明天開始做",
        emoji: "🔍",
        delta: { solve: 2 },
        followUp: "把焦慮轉成行動 — 自帶水壺、少吹冷氣、垃圾分類都算一份 🌱",
      },
      {
        text: "深呼吸，提醒自己「全世界很多人都在努力，我不是一個人扛」",
        emoji: "🌬️",
        delta: { calm: 1, solve: 1 },
        followUp: "氣候議題不是你一個小孩的責任。記得「我做我能做的」就好 ☁️",
      },
      {
        text: "找爸媽聊：「我看完海龜的影片好難過，我們週末一起去淨灘好嗎？」",
        emoji: "🫂",
        delta: { connect: 1, solve: 1 },
        followUp: "把難過變成全家一起行動，是很棒的轉化 💚",
      },
    ],
  },

  // 8. 數位疲憊 — 短影音 / 社群媒體壓力
  {
    id: "sel_08",
    emoji: "📱",
    title: "停不下來的手機",
    text: [
      "晚上 10 點，你發現自己已經滑短影音滑了 1 小時。",
      "明天要早起，但你停不下來 — 演算法一直推「下一個更好笑」。",
      "你既煩自己沒自制力，又覺得「再看一個就睡」。",
    ],
    choices: [
      {
        text: "把手機放遠一點，深呼吸 5 次再決定要不要再看",
        emoji: "🌬️",
        delta: { calm: 2 },
        followUp: "「製造距離」是打斷上癮的好方法 — 手機不在手上就比較不會想滑 ☁️",
      },
      {
        text: "設定明天的目標：每天滑短影音不超過 30 分鐘，記在便利貼上",
        emoji: "📝",
        delta: { solve: 2 },
        followUp: "意識到問題就成功一半 — 國小生有自制力訂目標,你已經贏過很多大人 ✨",
      },
      {
        text: "跟最好的朋友傳訊息：「我又滑太久了，明天我們互相監督」",
        emoji: "🤝",
        delta: { connect: 2 },
        followUp: "找夥伴一起改習慣比一個人撐容易很多 — 這就是「同儕支持」💪",
      },
      {
        text: "在日記寫下「為什麼我停不下來？」 — 是太無聊？太焦慮？太累？",
        emoji: "📔",
        delta: { express: 1, solve: 1 },
        followUp: "理解情緒是改變的第一步 — 短影音常常是「為了不去想別的事」的逃避 🧠",
      },
    ],
  },

  // 9. 假訊息引起的恐慌
  {
    id: "sel_09",
    emoji: "📰",
    title: "看到嚇人的訊息",
    text: [
      "家族群組瘋傳一則訊息：「下週某某地會大地震！轉發 10 個人才安全！」",
      "阿嬤已經轉給你 3 次，要你早點存糧。",
      "你心跳很快，但又覺得「這真的嗎？」",
    ],
    choices: [
      {
        text: "查氣象局官網，看官方有沒有發地震警報",
        emoji: "🔍",
        delta: { solve: 2 },
        followUp: "「先查證再相信」是 21 世紀最重要的素養 — 你做得很對 ✨",
      },
      {
        text: "深呼吸告訴自己：「假訊息常用恐嚇讓人轉發，先冷靜」",
        emoji: "🧘",
        delta: { calm: 2 },
        followUp: "認識「恐嚇式假訊息」的特徵，可以保護自己也保護家人 ☁️",
      },
      {
        text: "私訊阿嬤：「阿嬤這個是假的，我幫你查過了。妳今天身體好嗎？」",
        emoji: "💌",
        delta: { connect: 2 },
        followUp: "不是糾正阿嬤、是關心她。長輩常因為焦慮才轉發 — 給情緒回應比給事實有效 💖",
      },
      {
        text: "在家族群組溫和地說：「這個是假消息喔，附上氣象局網站，大家不用擔心」",
        emoji: "🛡️",
        delta: { express: 1, solve: 1 },
        followUp: "做家族裡的「假訊息守門員」需要勇氣 — 你保護了大家的情緒 🛡️",
      },
    ],
  },
];

// ─────────────────── 計分 & 結果 ───────────────────

export interface SelScores {
  express: number;
  solve: number;
  calm: number;
  connect: number;
}

export const initialSelScores: SelScores = {
  express: 0,
  solve: 0,
  calm: 0,
  connect: 0,
};

export function applySelDelta(scores: SelScores, delta: Partial<Record<SelAxis, number>>): SelScores {
  return {
    express: scores.express + (delta.express ?? 0),
    solve: scores.solve + (delta.solve ?? 0),
    calm: scores.calm + (delta.calm ?? 0),
    connect: scores.connect + (delta.connect ?? 0),
  };
}

export type SelStyle = "express" | "solve" | "calm" | "connect";

export interface SelStyleInfo {
  style: SelStyle;
  emoji: string;
  /** 中文俗稱 */
  nickname: string;
  /** 一句話 */
  oneLiner: string;
  /** 色票 (Tailwind gradient) */
  gradient: string;
  /** 描述 (2 段) */
  description: string[];
  /** 你的優勢 (4 項) */
  strengths: string[];
  /** 鼓勵你發展的方向 (這個風格比較少用的策略，請鼓勵 — 正向表達) */
  growthAreas: string[];
  /** 適合你的情緒工具 (5 個具體可用的工具) */
  toolbox: string[];
  /** 跟誰最好搭 (互補) */
  bestPartner: { style: SelStyle; reason: string };
  /** 給家長 / 老師的話 */
  tipForGrowth: string;
}

const STYLE_DATA: Record<SelStyle, SelStyleInfo> = {
  express: {
    style: "express",
    emoji: "🌸",
    nickname: "表達型",
    oneLiner: "把情緒說出來、寫出來、畫出來，讓感受流動。",
    gradient: "from-pink-300 via-rose-300 to-fuchsia-400",
    description: [
      "你會用語言、文字或創作把心裡的感受表達出來。難過會哭、生氣會說、開心會跳起來 — 你的情緒是看得到的。",
      "這讓你不會把情緒壓在心裡變成壓力，也讓身邊的人能理解你。你的真實會吸引同樣真實的朋友。",
    ],
    strengths: [
      "情緒自我覺察力強",
      "不會壓抑自己 → 心理健康",
      "真實感染別人 → 朋友信任你",
      "表達清楚 → 誤會比較少",
    ],
    growthAreas: [
      "🧠 試試「先寫下來再說出口」 — 給情緒一個整理的緩衝",
      "🧘 學深呼吸 30 秒再回應 — 讓情緒變成「資料」而不是「武器」",
      "🫂 也允許別人沉默 — 不是每個人都會立刻說出感受",
    ],
    toolbox: [
      "📓 情緒日記本（每天 3 行心情）",
      "🎨 畫情緒：紅色生氣 / 藍色難過 / 黃色開心",
      "💬 「我訊息」句型：「我現在覺得 ___，因為 ___」",
      "🎵 做情緒歌單（每種心情一首歌）",
      "📞 找一個可以亂講的好朋友（不評論的人最珍貴）",
    ],
    bestPartner: { style: "calm", reason: "🧘 安撫型會幫你接住情緒、給你緩衝" },
    tipForGrowth:
      "表達型的孩子不是「太情緒化」，是「情緒誠實」。請肯定他的表達，再慢慢教他「等一下再說」的技巧。",
  },

  solve: {
    style: "solve",
    emoji: "🧠",
    nickname: "思考型",
    oneLiner: "想原因、找辦法、列計畫，用腦袋接住情緒。",
    gradient: "from-sky-300 via-blue-400 to-indigo-400",
    description: [
      "你會去想「為什麼會這樣？」、「下次怎麼做比較好？」。情緒對你來說是訊號 — 它告訴你哪裡出了問題，然後你會去解決。",
      "這讓你比別人更快走出低潮，也讓你看到別人看不到的解法。你的冷靜常常是團體的定心丸。",
    ],
    strengths: [
      "理性分析能力強",
      "從錯誤學東西超快",
      "解決問題給人安全感",
      "面對危機冷靜 → 帶領大家",
    ],
    growthAreas: [
      "🌸 試試「不解釋只聆聽」— 有時別人只想被陪",
      "💧 給自己「不想原因」的時間 — 情緒也需要空間",
      "🫂 學會說「我也不知道」— 強大不是無敵",
    ],
    toolbox: [
      "📋 情緒問題卡：「現在發生什麼？我感覺什麼？我想要什麼？我可以做什麼？」",
      "🗂️ SWOT 分析自己的問題（4 格畫起來）",
      "📅 「24 小時規則」：很急的情緒先放 24 小時再回應",
      "💡 解法清單法：每個問題列 3 個解法再挑",
      "🤔 「最壞會怎樣」想像：常常沒那麼可怕",
    ],
    bestPartner: { style: "express", reason: "🌸 表達型會教你「也可以不那麼理性」" },
    tipForGrowth:
      "思考型的孩子不是「太冷漠」，是「用腦袋愛人」。請肯定他的解決能力，再溫柔示範「有時擁抱比答案更重要」。",
  },

  calm: {
    style: "calm",
    emoji: "🧘",
    nickname: "安撫型",
    oneLiner: "深呼吸、暫離、運動 — 用身體照顧自己。",
    gradient: "from-emerald-300 via-teal-300 to-cyan-400",
    description: [
      "你會用身體的方式安頓情緒：暫離一下、做深呼吸、去動一動、聽喜歡的音樂。你知道情緒像浪，不去打它，它自己會退。",
      "這讓你不會在衝動下做傷害自己或別人的事。你像穩穩的大樹，風來了搖一下，根還在土裡。",
    ],
    strengths: [
      "情緒調節力超強",
      "不會被一時情緒沖走做傻事",
      "給身邊的人安全感",
      "適合長期戰役（不是短跑）",
    ],
    growthAreas: [
      "🌸 試試把感受講一句出來 — 不一定要忍",
      "🫂 允許自己有時不夠堅強 — 求救不丟臉",
      "💬 學會分享你的「安撫方法」 — 別人會感謝你",
    ],
    toolbox: [
      "🌬️ 4-7-8 呼吸法（吸 4 秒、停 7 秒、吐 8 秒）",
      "🚶 「走 10 分鐘」當作 reset 按鈕",
      "🎵 心情歌單分類（生氣 / 難過 / 焦慮各一個）",
      "🛁 安撫五感清單：聽 / 看 / 聞 / 嚐 / 摸",
      "🌳 找一個專屬的「冷靜地方」（樹下、窗邊、棉被裡）",
    ],
    bestPartner: { style: "connect", reason: "🫂 連結型會把你拉出來與人接觸" },
    tipForGrowth:
      "安撫型的孩子不是「太被動」，是「智慧地等浪過」。請尊重他的暫離需求，再鼓勵他試著說出來。",
  },

  connect: {
    style: "connect",
    emoji: "🫂",
    nickname: "連結型",
    oneLiner: "找家人、找朋友、找老師 — 不一個人扛。",
    gradient: "from-amber-300 via-orange-300 to-rose-400",
    description: [
      "你知道「不一個人扛」的重要。難過時你會找人陪、害怕時你會找人撐、生氣時你會跟人說。你相信支持的力量。",
      "這讓你比別人更快走出陰暗，也讓你成為別人遇到事時第一個想到的人。你的擁抱會發光。",
    ],
    strengths: [
      "尋求支持的勇氣超大",
      "人際信任感強",
      "懂得互相照顧 → 朋友多",
      "情緒不會悶住變成大爆發",
    ],
    growthAreas: [
      "🧠 試試「先想想再求助」 — 自己思考一次有時就 OK",
      "🧘 也學「自己安撫自己」 — 別人不在身邊時的能力",
      "🌸 學會「不靠別人回應也敢說」 — 表達本身就有療癒",
    ],
    toolbox: [
      "📞 三個「隨時可以打」的人名單（家人 + 朋友 + 老師各 1）",
      "🤝 「我需要 ___」直接說（陪伴 / 建議 / 抱抱 / 安靜聽我說）",
      "📨 寫信給未來的自己：「現在的我想跟你說...」",
      "🎯 主動關心一個朋友 — 給比拿更療癒",
      "🐶 跟動物 / 植物建立連結也算（不一定要人）",
    ],
    bestPartner: { style: "solve", reason: "🧠 思考型會給你具體建議補上感性" },
    tipForGrowth:
      "連結型的孩子不是「太依賴」，是「懂得求助」。請肯定他的勇氣，再示範「自己也是很棒的陪伴對象」。",
  },
};

/** 從分數推導主要因應風格 (取最高分；同分依固定優先序 express > connect > calm > solve 避免無謂飄移) */
export function deriveSelStyle(scores: SelScores): SelStyle {
  const order: SelStyle[] = ["express", "connect", "calm", "solve"];
  let max = -1;
  let best: SelStyle = "express";
  for (const k of order) {
    if (scores[k] > max) {
      max = scores[k];
      best = k;
    }
  }
  return best;
}

export function getSelStyleInfo(style: SelStyle): SelStyleInfo {
  return STYLE_DATA[style];
}

export const ALL_SEL_STYLES: SelStyle[] = ["express", "solve", "calm", "connect"];

/** 給強度條用：把分數轉成 4 軸百分比 (sum to 100) */
export function selStrengthPercents(scores: SelScores): Record<SelAxis, number> {
  const total = scores.express + scores.solve + scores.calm + scores.connect;
  if (total === 0) return { express: 25, solve: 25, calm: 25, connect: 25 };
  return {
    express: Math.round((scores.express / total) * 100),
    solve: Math.round((scores.solve / total) * 100),
    calm: Math.round((scores.calm / total) * 100),
    connect: Math.round((scores.connect / total) * 100),
  };
}
