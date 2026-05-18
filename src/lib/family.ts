/**
 * 🏡 家庭篇 Story Pack
 *
 * 設計參考:
 *   - 兒福聯盟兒少壓力調查 (家庭衝突是第二大壓力源,僅次於課業)
 *   - 教育部「家庭教育」議題 + 「人權教育」議題
 *   - 美國 SAMHSA Child Trauma Toolkit 兒童創傷工具包
 *
 * 6 個情境涵蓋國小生家庭最常遇到的情況:
 *   1. 😣 父母吵架夜
 *   2. 😢 被責罵 (誤會)
 *   3. 🌀 隔代教養衝突
 *   4. 👶 新成員加入 (弟妹 / 繼父母)
 *   5. 🏥 家人生病 (慢性)
 *   6. 📦 家庭搬家
 *
 * 4 種「家庭因應風格」(依最高分軸):
 *   🌸 表達者 — 把情緒說出來、寫出來、畫出來
 *   🧠 思考者 — 想清楚再行動、找原因、給自己解釋
 *   🧘 安撫者 — 靜下來、深呼吸、做喜歡的事
 *   🫂 連結者 — 找信任的人聊、抱抱、求助
 *
 * ⚠️ Flag 機制 (重要!):
 *   每個情境的 choice 有 `flagLevel`:
 *     - "normal": 一般選擇 (0)
 *     - "watch": 需要關心 — 該選項暗示孩子可能遇到嚴重情況 (1)
 *     - "urgent": 強烈建議找大人 — 觸發「資源頁」+ 老師通知 (2)
 *
 *   結果頁根據 flag 總分顯示不同提示:
 *     - 0-2: 一般肯定 + 工具箱
 *     - 3-5: 「你似乎遇到比較重的事 — 找信任的大人聊聊很重要」+ 諮詢資源
 *     - 6+:   「請聯絡這些專線」直接顯示 1980/113/1995/110 + 鼓勵尋求協助
 *
 * 老師導讀:
 *   - 課前提醒「這個 pack 處理家庭議題,可能觸發孩子情緒,請在輔導課情境使用」
 *   - 課後給老師「flag 摘要」(學生匿名,但顯示有幾人觸發 watch/urgent)
 *   - 老師可主動關懷
 */

export type FamilyAxis = "express" | "think" | "calm" | "connect";

export type FlagLevel = "normal" | "watch" | "urgent";

export interface FamilyChoice {
  text: string;
  emoji: string;
  delta: Partial<Record<FamilyAxis, number>>;
  followUp: string;
  /** Flag 機制:該選項是否暗示孩子遇到嚴重狀況 */
  flagLevel?: FlagLevel;
}

export interface FamilyScenario {
  id: string;
  emoji: string;
  title: string;
  text: string[];
  choices: FamilyChoice[];
}

export const FAMILY_SCENARIOS: FamilyScenario[] = [
  // 1. 父母吵架
  {
    id: "family_01",
    emoji: "😣",
    title: "爸媽又吵架了",
    text: [
      "深夜 11 點,你在房間聽到客廳傳來爸媽爭吵的聲音。",
      "雖然聽不清楚,但你知道他們又在吵了 — 這週第三次。",
      "你的胃緊起來,睡不著。",
    ],
    choices: [
      {
        text: "戴上耳機聽喜歡的音樂,告訴自己「大人的事不是我的責任」",
        emoji: "🎧",
        delta: { calm: 2, think: 1 },
        followUp: "你保護了自己的情緒空間 — 這是很成熟的事。記住:你不需要解決大人的問題 ☁️",
      },
      {
        text: "寫一封信給自己:「我聽到了。我擔心。但我可以好好的」",
        emoji: "📔",
        delta: { express: 3 },
        followUp: "把情緒寫出來,就不會卡在心裡。你的日記是 24 小時的傾聽者 💖",
      },
      {
        text: "明天找最信任的阿姨 / 阿嬤 / 老師說:「我家最近很吵」",
        emoji: "📞",
        delta: { connect: 3 },
        followUp: "你不必一個人扛 — 找一個信任的大人聊就是力量。你不是「告狀」,你是在照顧自己 🫂",
      },
      {
        text: "怕極了,想衝出去叫他們不要吵 — 我覺得是我的錯",
        emoji: "💔",
        delta: { express: 1, connect: 1 },
        followUp: "你的心很善良 — 但聽我說:**大人吵架絕對不是你的錯**。請明天一定要告訴一個你信任的大人 (老師 / 阿嬤 / 阿姨),讓他們知道你有多擔心。",
        flagLevel: "watch",
      },
    ],
  },
  // 2. 被責罵 (誤會)
  {
    id: "family_02",
    emoji: "😢",
    title: "被冤枉了",
    text: [
      "媽媽看到客廳花瓶破了,大聲對你說:「一定是你打破的,你看!」",
      "但其實是貓咪撞倒的,你連碰都沒碰。",
      "你想解釋,但媽媽已經氣到聽不進去了。",
    ],
    choices: [
      {
        text: "深呼吸,等媽媽冷靜下來再說:「我可以告訴你發生什麼嗎?」",
        emoji: "🌬️",
        delta: { calm: 2, think: 1 },
        followUp: "你用「等對方準備好」打破誤會 — 比當場吵贏更有效。20 分鐘後媽媽聽完真相,主動道歉 ☁️",
      },
      {
        text: "在房間哭一場,把委屈先發洩出來",
        emoji: "😭",
        delta: { express: 3 },
        followUp: "哭是身體的解壓閥,沒有什麼好丟臉的。哭完你想清楚要怎麼說,反而更冷靜了 💧",
      },
      {
        text: "寫一張紙條留在媽媽桌上:「不是我打破的。是貓。我很委屈。」",
        emoji: "📝",
        delta: { express: 2, think: 1 },
        followUp: "用文字而不是吵架,媽媽看到紙條會更願意聽。隔天她主動抱你 + 道歉 💌",
      },
      {
        text: "找爸爸 / 爺爺奶奶 / 兄姊當「見證人」一起跟媽媽說",
        emoji: "🫂",
        delta: { connect: 3 },
        followUp: "找第三方協助說明 — 不是告狀,是讓媽媽從不同視角聽到。家人聯手澄清更有效 ✨",
      },
    ],
  },
  // 3. 隔代教養衝突 (跟阿公阿嬤的世代差距)
  {
    id: "family_03",
    emoji: "🌀",
    title: "阿嬤不懂我",
    text: [
      "你跟阿嬤住,她很愛你但很多事不懂 — 像是「為什麼要玩手機」「為什麼要交那麼多錢買鞋」。",
      "今天她又說:「你們現在小孩真難帶,我們以前哪有這些?」",
      "你一肚子委屈 — 不是不愛阿嬤,是真的被誤會。",
    ],
    choices: [
      {
        text: "找一個她心情好的時候,慢慢解釋:「阿嬤,我們同學...」",
        emoji: "💬",
        delta: { connect: 2, express: 1 },
        followUp: "選對時機聊天事半功倍。阿嬤聽完說:「原來如此...阿嬤不懂的事你慢慢教我。」你們的距離拉近了 ❤️",
      },
      {
        text: "寫一封信給阿嬤,把心裡的委屈用文字說清楚",
        emoji: "💌",
        delta: { express: 3 },
        followUp: "阿嬤雖然不太會回信,但她把信壓在枕頭下「天天看」。書面表達常比口語更深 💖",
      },
      {
        text: "深呼吸告訴自己:「她不是針對我,只是不熟悉這個時代」",
        emoji: "🧘",
        delta: { calm: 3 },
        followUp: "你選擇「理解她的視角」 — 這是很成熟的轉念。世代差距不會消失,但你的耐心會減少摩擦 ☁️",
      },
      {
        text: "找爸爸 / 媽媽當「翻譯」,請他們幫忙轉達",
        emoji: "🌉",
        delta: { connect: 3, think: 1 },
        followUp: "爸媽是兩代之間的橋。他們聽完幫你跟阿嬤說明,阿嬤更容易接受。家人就是這樣互相補位的 ✨",
      },
    ],
  },
  // 4. 新成員加入
  {
    id: "family_04",
    emoji: "👶",
    title: "弟弟出生了",
    text: [
      "媽媽從醫院回家,帶回小小的弟弟。",
      "全家人都圍著他笑、拍照、發限動。",
      "你站在旁邊看,心裡有一種說不出的感覺 — 既開心又有點失落。",
    ],
    choices: [
      {
        text: "跟媽媽說:「我也想被抱抱」 — 直接表達需求",
        emoji: "🤗",
        delta: { express: 3 },
        followUp: "媽媽愣一下,然後緊緊抱你:「對不起,媽媽差點忘記你也還是寶寶。」你被看見了 💖",
      },
      {
        text: "寫日記:「我覺得我變第二名了,但我也愛弟弟」",
        emoji: "📔",
        delta: { express: 2, think: 1 },
        followUp: "兩種感受同時存在是正常的 — 「我嫉妒 + 我愛他」不矛盾。寫出來讓兩種情緒都有位置 🌱",
      },
      {
        text: "主動學習當哥哥 / 姊姊,幫忙拿尿布、唱歌給弟弟聽",
        emoji: "👨‍👧‍👦",
        delta: { connect: 2, think: 1 },
        followUp: "你用「行動」找到自己在新家庭的位置 — 你不是被取代,你是升級了 ✨ 弟弟長大會崇拜你。",
      },
      {
        text: "覺得被冷落,故意做些讓媽媽生氣的事引起注意",
        emoji: "😤",
        delta: { express: 1 },
        followUp: "這是「退化行為」,大人通常會更生氣。下次試試**直接說**「我覺得被冷落了」 — 大人聽得懂、也願意調整 💡",
        flagLevel: "watch",
      },
    ],
  },
  // 5. 家人生病
  {
    id: "family_05",
    emoji: "🏥",
    title: "阿公生病了",
    text: [
      "阿公最近常忘事,昨天他叫你的時候叫成隔壁鄰居的名字。",
      "媽媽說阿公可能有失智症,要去看醫生。",
      "你既擔心又害怕 — 阿公以後會不會不認得我?",
    ],
    choices: [
      {
        text: "深呼吸告訴自己:「就算他忘了我的名字,他還是會感受到我的愛」",
        emoji: "🧘",
        delta: { calm: 3 },
        followUp: "你的轉念很成熟 — 失智症會偷走記憶,但偷不走感情。阿公會用他的方式記得你 ☁️",
      },
      {
        text: "找媽媽問:「阿公會怎樣?我可以怎麼幫?」",
        emoji: "🫂",
        delta: { connect: 3 },
        followUp: "媽媽抱你:「謝謝你關心阿公。最重要是耐心 — 他講重複的話我們就再聽一次。」你成為照顧團隊的一員 ❤️",
      },
      {
        text: "查網路看「國小生可以幫失智長者做什麼」",
        emoji: "🔍",
        delta: { think: 3 },
        followUp: "你查到很多溫柔的小事 — 看老照片、聽老歌、慢慢說話。資訊變成行動,你變成阿公的「記憶夥伴」🧠",
      },
      {
        text: "畫一本「我跟阿公的故事」繪本,給阿公看",
        emoji: "🎨",
        delta: { express: 2, connect: 1 },
        followUp: "阿公翻著你的畫,慢慢回想起每個故事。藝術是「跟失憶共處」的好工具 💝",
      },
    ],
  },
  // 6. 家庭搬家
  {
    id: "family_06",
    emoji: "📦",
    title: "我們要搬家了",
    text: [
      "爸媽宣布:「下個月我們要搬到新北市,你要轉學。」",
      "你愣住 — 學校的好朋友、熟悉的便利商店、家附近的公園,都要說再見。",
      "你的心裡有一團複雜的東西。",
    ],
    choices: [
      {
        text: "辦一個「再見派對」邀請所有好朋友,留下美好回憶",
        emoji: "🎉",
        delta: { connect: 2, express: 2 },
        followUp: "你把「告別」變成「慶祝」 — 派對結束時你哭了又笑了,朋友送你滿滿的卡片 💖",
      },
      {
        text: "做一本「我的舊家紀念冊」 — 拍照、寫信、收集小東西",
        emoji: "📔",
        delta: { express: 3 },
        followUp: "你的紀念冊變成「未來的時光膠囊」 — 5 年後翻開,你會謝謝那時候的自己用心紀錄 ✨",
      },
      {
        text: "上網查新學校的資料,看新家附近有什麼好玩的",
        emoji: "🔍",
        delta: { think: 3 },
        followUp: "把未知變成可預期 — 你發現新家附近有圖書館和球場。期待感慢慢追上失落感 🌱",
      },
      {
        text: "跟爸媽說:「我會難過,可以給我幾天的時間消化嗎?」",
        emoji: "💬",
        delta: { express: 2, connect: 1 },
        followUp: "爸媽愣一下,然後感動:「你願意說出來,媽媽很欣慰。我們陪你慢慢過渡。」承認情緒是大人的能力 💝",
      },
    ],
  },
];

// ─────────────────── 計分 & Flag ───────────────────

export interface FamilyScores {
  express: number;
  think: number;
  calm: number;
  connect: number;
}

export const initialFamilyScores: FamilyScores = {
  express: 0,
  think: 0,
  calm: 0,
  connect: 0,
};

/** 加總所有選擇的 flag 等級 */
export function calcFlagScore(choices: FamilyChoice[]): number {
  return choices.reduce((sum, c) => {
    if (c.flagLevel === "watch") return sum + 1;
    if (c.flagLevel === "urgent") return sum + 2;
    return sum;
  }, 0);
}

export type FamilyStyle = "express" | "think" | "calm" | "connect";

export interface FamilyStyleInfo {
  key: FamilyStyle;
  emoji: string;
  name: string;
  oneLiner: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  toolbox: Array<{ emoji: string; name: string; how: string }>;
  color: string;
}

export const FAMILY_STYLES: Record<FamilyStyle, FamilyStyleInfo> = {
  express: {
    key: "express",
    emoji: "🌸",
    name: "表達者",
    oneLiner: "把家裡的情緒用文字 / 畫 / 話說出來的療癒者。",
    description:
      "你習慣把家裡的事「說出來、寫出來、畫出來」。" +
      "不會把情緒悶在心裡,知道「表達」就是消化的開始。日記、聊天、塗鴉是你的好朋友。",
    strengths: ["情緒表達流暢", "不容易內傷", "用創作消化壓力", "說真話的勇氣", "感染身邊人也敢表達"],
    growthAreas: ["不是每件事都需要立刻說 — 也可以沉澱", "表達時也聽對方的感受", "選對時機跟對人"],
    toolbox: [
      { emoji: "📔", name: "情緒日記", how: "睡前 5 分鐘寫今天的感受 (不寫事件,只寫情緒)" },
      { emoji: "🎨", name: "畫情緒色", how: "用顏色畫今天的心情,不用畫得像" },
      { emoji: "💌", name: "寫信給家人", how: "說不出口的話用寫的,寄不寄都 OK" },
      { emoji: "🎵", name: "情緒歌單", how: "為不同心情建一個歌單,讓音樂幫你表達" },
      { emoji: "🎤", name: "找信任的人說話", how: "找一個會「聽」不會「教訓」的人聊" },
    ],
    color: "from-pink-300 via-rose-300 to-fuchsia-400",
  },
  think: {
    key: "think",
    emoji: "🧠",
    name: "思考者",
    oneLiner: "想清楚原因、找方法、自己給自己解釋的小哲學家。",
    description:
      "你遇到家裡的事會先「想」 — 為什麼會這樣?他為什麼這樣說?我可以怎麼做?" +
      "你不容易被情緒帶走,擅長用邏輯框住複雜的家庭情境。你的「想清楚」往往帶來真正的轉變。",
    strengths: ["分析能力強", "不情緒化", "能看到事情的多面", "想出解決方案", "成熟的旁觀視角"],
    growthAreas: [
      "也要允許自己「感受」,不只是「想」",
      "想太多會卡住,有時候直接行動更好",
      "請信任的人幫忙當「鏡子」",
    ],
    toolbox: [
      { emoji: "🗺️", name: "問題地圖", how: "把複雜的家庭事件畫成關係圖,看誰跟誰的問題" },
      { emoji: "📚", name: "查資料", how: "上網或圖書館找「兒童心理 / 家庭關係」相關書籍" },
      { emoji: "💭", name: "三個視角練習", how: "我看 / 對方看 / 第三人看 — 比較三種版本" },
      { emoji: "📝", name: "如果...會怎樣", how: "寫下不同行動的後果預測" },
      { emoji: "⏸️", name: "24 小時規則", how: "重要決定先等 24 小時再做" },
    ],
    color: "from-indigo-300 via-blue-300 to-cyan-400",
  },
  calm: {
    key: "calm",
    emoji: "🧘",
    name: "安撫者",
    oneLiner: "深呼吸、暫離、做喜歡的事,給自己情緒空間。",
    description:
      "你遇到家庭壓力時的第一直覺是「先穩住自己」 — 深呼吸、走開、聽音樂、看雲。" +
      "你知道情緒激動時做的決定常常會後悔,所以你先讓自己冷靜。這是一種「情緒自我照顧」的高級能力。",
    strengths: ["情緒穩定", "不會做衝動決定", "懂得自我照顧", "壓力下還能思考", "是家中的「平靜之島」"],
    growthAreas: [
      "別把所有事都自己消化,也要說出來",
      "「冷靜」不是「壓抑」 — 要分清楚",
      "適度連結別人也是力量",
    ],
    toolbox: [
      { emoji: "🌬️", name: "4-7-8 呼吸法", how: "吸氣 4 秒 → 屏息 7 秒 → 吐氣 8 秒,重複 3 次" },
      { emoji: "🚶", name: "5 分鐘散步", how: "離開家裡到附近巷子走 5 分鐘,讓血液流動" },
      { emoji: "🛁", name: "感官重置", how: "洗熱水澡 / 抱毛毯 / 摸植物,用身體穩住" },
      { emoji: "📚", name: "閱讀逃避", how: "讀完全跟現實無關的書,給大腦放假" },
      { emoji: "🎧", name: "白噪音 + 音樂", how: "戴耳機聽喜歡的聲音,過濾家裡的吵雜" },
    ],
    color: "from-emerald-300 via-teal-300 to-cyan-400",
  },
  connect: {
    key: "connect",
    emoji: "🫂",
    name: "連結者",
    oneLiner: "知道求助是力量,信任的大人是你最強的後援。",
    description:
      "你懂得「家裡的事一個人扛太重,要找人聊」 — 找媽媽、找阿姨、找老師、找最好的朋友。" +
      "你不害怕讓別人知道你的家庭,因為你相信被理解才能被支持。你是「健康依附」的高手。",
    strengths: ["懂得求助", "信任的大人多", "情感網絡強", "說真話的勇氣", "幫朋友也敢這樣做"],
    growthAreas: [
      "也要學會自己消化一些",
      "不是每件事都要說給每個人聽",
      "選對「願意聽不會評斷」的人",
    ],
    toolbox: [
      { emoji: "📞", name: "信任名單", how: "列 3 個你 100% 信任的大人,把電話 / LINE 存好" },
      { emoji: "🫂", name: "求助話術", how: "「我家裡最近有點事,我想跟你聊聊」 — 不需要先解釋全部" },
      { emoji: "💌", name: "感謝週", how: "每週寫一張卡片給支持過你的人,維繫關係" },
      { emoji: "👥", name: "同齡夥伴", how: "找一個「也經歷過類似事」的朋友,互相支持" },
      { emoji: "📚", name: "輔導室", how: "學校的輔導老師受過訓練,聊任何事都會保密" },
    ],
    color: "from-amber-300 via-orange-300 to-rose-400",
  },
};

/** 算出主導風格 */
export function calcFamilyStyle(scores: FamilyScores): FamilyStyle {
  const entries = Object.entries(scores) as Array<[FamilyStyle, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/** 緊急資源 (flag score 高時顯示) */
export const EMERGENCY_RESOURCES = [
  { emoji: "📞", name: "教育部反霸凌專線", number: "0800-200-885", who: "校園 / 家庭暴力 / 性騷擾" },
  { emoji: "🆘", name: "113 婦幼保護專線", number: "113", who: "家人對你不好 (打、罵、忽視)" },
  { emoji: "💚", name: "1980 張老師專線", number: "1980", who: "心情很重需要有人聊" },
  { emoji: "🩺", name: "1995 生命線", number: "1995", who: "感覺撐不下去的時候" },
  { emoji: "🚓", name: "110 警察", number: "110", who: "立刻有危險的時候" },
];
