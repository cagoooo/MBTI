/**
 * 🎴 NPC 角色卡牌系統 (v3.21)
 *
 * 每個 NPC 變成可解鎖的「校園小卡」 — 越認識他們, 越知道身邊朋友的多元。
 *
 * 設計原則 (跟 CampusIntro 一致):
 *   - 「她是她」優先, 「代表某個群體」次之
 *   - 困擾段不寫成「他需要被你拯救」, 而是「他自己在處理的事, 你可以陪伴」
 *   - 夢想 / 需要朋友的方式都肯定不同價值觀
 *
 * 解鎖機制 (3 個維度, 各自獨立):
 *   - 🌟 基本面 (檔案 + 興趣) — 進到 /cards 第一次看就解鎖
 *   - 💭 夢想面 — 完成 MBTI 主故事任一次解鎖
 *   - 🫂 困擾面 — 完成 SEL 特別篇任一次解鎖
 *   - 🎁 需要朋友的方式 — 完成猜朋友 任一次解鎖
 *
 * 12 張全解鎖 + 4 面向都打開 → 「全班拼圖」總卡顯示
 */

import type { MBTIType } from "./types";

export type CardFace = "basic" | "dream" | "trouble" | "friendship";

export interface NpcCard {
  /** NPC id (跟 CampusIntro 對齊) */
  id: string;
  name: string;
  /** 主要 emoji 代表 */
  emoji: string;
  /** MBTI 型 */
  type: MBTIType;
  /** 卡片底色 gradient class */
  color: string;
  /** 興趣 (3 個) */
  interests: string[];
  /** 家庭一句話 (跟 CampusIntro 第 2 輪台詞一致) */
  family: string;
  /** 夢想 (1-2 句, 真實國小生視角) */
  dream: string;
  /** 困擾 (1-2 句, 他自己在處理的事, 不是悲情) */
  trouble: string;
  /** 需要朋友的方式 (1-2 句, 「我喜歡這樣被對待」) */
  friendship: string;
  /** 給你看完這張卡的「小提示」(1 句) */
  hint: string;
}

export const NPC_CARDS: NpcCard[] = [
  {
    id: "yun",
    name: "小芸",
    emoji: "🌸",
    type: "ENFP",
    color: "from-yellow-200 via-pink-200 to-rose-300",
    interests: ["跳繩", "畫漫畫", "認識新朋友"],
    family: "我有妹妹，她讀一年級。週末外婆會教我客家話。",
    dream: "我想當「快樂的老師」 — 把上課變得跟玩一樣有趣。",
    trouble: "我有時候太想被喜歡，會說「好啊」結果累壞自己。我在學習說「不」。",
    friendship: "如果你想找我，直接拍我肩膀 — 我不喜歡偷偷暗示，我喜歡光明正大的友情！",
    hint: "ENFP 的熱情會把整個教室點亮 — 但她自己也需要被注意到。",
  },
  {
    id: "zhe",
    name: "阿哲",
    emoji: "🤓",
    type: "INTJ",
    color: "from-purple-200 via-indigo-200 to-blue-300",
    interests: ["寫程式", "下棋", "看歷史書"],
    family: "爸爸是越南人，我會講一點越南話。下個月外婆要從越南來看我們。",
    dream: "我想當「會做事的工程師」 — 不只寫好程式，還能改變一個系統。",
    trouble: "有同學笑我講話有口音，我已經學會不理他們，但有時候還是會難過一下下。",
    friendship: "想跟我聊深的話題就好 — 不用噓寒問暖，直接問「你最近在想什麼？」我就會很開心。",
    hint: "INTJ 看似冷淡，但會記得你說過的每句重要的話。",
  },
  {
    id: "jie",
    name: "小傑",
    emoji: "⚡",
    type: "ESTP",
    color: "from-orange-200 via-amber-200 to-yellow-300",
    interests: ["躲避球", "滑板", "看大卡車"],
    family: "我跟爸爸住，他是貨運司機。姑姑常常來接我。",
    dream: "我想當消防員 — 跑得快、反應快、可以救人。",
    trouble: "我有時候動得太快，老師會說「你不能停下來嗎？」 — 我也想，但我的身體很想動。",
    friendship: "下課直接拉我去玩就好 — 我喜歡一起跑、一起跳，不需要太多話。",
    hint: "ESTP 的「動」是天賦不是缺點 — 找他做「需要動的事」就對了。",
  },
  {
    id: "yawen",
    name: "雅雯",
    emoji: "🌙",
    type: "INFJ",
    color: "from-indigo-200 via-purple-200 to-pink-300",
    interests: ["看小說", "寫日記", "聽 podcast"],
    family: "晚上奶奶接我回家，她每天煮我最愛吃的菜。每月初一我們會去廟裡。",
    dream: "我想當「會聽人心事的人」 — 心理師、輔導老師、或安寧志工都行。",
    trouble: "我很容易感受到別人的情緒，有時候會覺得「太多」，需要一個人安靜很久才能充電。",
    friendship: "需要我陪你的時候直接說 — 我會去。但也請尊重我獨處的時間，那是我充電的方式。",
    hint: "INFJ 是 16 型裡最稀有的 — 她默默看見每個人，記得提醒她「也讓人看見你」。",
  },
  {
    id: "yuhang",
    name: "宇航",
    emoji: "🎨",
    type: "ISFP",
    color: "from-rose-200 via-pink-200 to-fuchsia-300",
    interests: ["畫畫", "看夕陽", "養多肉植物"],
    family: "爺爺聽不見，所以我們在家用手語聊天。我常教爺爺新的手語。",
    dream: "我想當畫家 — 不一定要紅，但要畫出真正想畫的東西。",
    trouble: "別人說「畫得像不像」，我覺得不重要 — 但有時候我會被分數打擊到不想畫。",
    friendship: "看到我畫的東西，不要急著「評論」 — 先看就好，我會自己決定要不要解釋。",
    hint: "ISFP 在被打分數的環境裡會內傷 — 多問「你想表達什麼？」勝過「畫得好不好」。",
  },
  {
    id: "kelly",
    name: "凱莉",
    emoji: "👑",
    type: "ENTJ",
    color: "from-red-200 via-orange-200 to-amber-300",
    interests: ["當班長", "組讀書會", "看 NBA"],
    family: "我家有兩個媽媽，她們都超會煮菜。週末我們去看其他家庭的聚會 — 每個家都不一樣。",
    dream: "我想當校長 — 不是因為「大」，是因為可以讓一整個學校變更好。",
    trouble: "我容易被說「太兇」、「太強勢」 — 我自己也在學「不是所有人都喜歡被推著走」。",
    friendship: "跟我說你「真正的意見」就好 — 我不喜歡「聽好聽的」，我喜歡能討論的朋友。",
    hint: "ENTJ 的領導力是天生的 — 但她也需要被告知「你不必扛所有事」。",
  },
  {
    id: "yu",
    name: "小宇",
    emoji: "📚",
    type: "INTP",
    color: "from-sky-200 via-blue-200 to-cyan-300",
    interests: ["看百科全書", "拆東西", "問為什麼"],
    family: "我吃花生會起疹子，所以便當不能交換。同學都記得了，我超感動。",
    dream: "我想當研究員 — 研究我覺得很神奇的東西。可能是黑洞，也可能是螞蟻。",
    trouble: "我會卡在「想清楚」這件事上，常常忘了「也要做出來」。",
    friendship: "問我「為什麼」我會超開心 — 不要直接給我答案，跟我一起想。",
    hint: "INTP 的腦袋一刻不停 — 給他空間獨自鑽研，他會自己長出一片森林。",
  },
  {
    id: "tingting",
    name: "婷婷",
    emoji: "🍰",
    type: "ESFJ",
    color: "from-pink-200 via-rose-200 to-red-300",
    interests: ["烘焙", "辦慶生會", "幫人辮髮"],
    family: "我有兩個弟弟一個妹妹。媽媽在便當店工作，所以我傍晚 6 點才回家。",
    dream: "我想開一間小店 — 賣自己烤的麵包，認識每個來的客人。",
    trouble: "我有時候對人太好，會忘了自己也很累。我在學「也要照顧自己」。",
    friendship: "你不舒服時告訴我 — 我超會煮湯、會記得你的口味。但也讓我知道我哪裡做得太多。",
    hint: "ESFJ 把愛藏在每個細節 — 記得直接告訴她「謝謝你」。",
  },
  // ─── v3.20 新增的 4 個 NPC ───
  {
    id: "akiya",
    name: "Akiya",
    emoji: "🌿",
    type: "INFP",
    color: "from-emerald-200 via-teal-200 to-cyan-300",
    interests: ["族語歌謠", "看星星", "幫阿嬤種小米"],
    family: "我是阿美族，家在花蓮。每個寒暑假我回部落，跟阿嬤一起種小米。",
    dream: "我想當「會說族語的故事人」 — 把部落的故事用畫、用歌、用書留下來。",
    trouble: "在學校有時候被問「你會跳原住民舞嗎」 — 我會，但我不只是「會跳舞的原住民」。我有很多面。",
    friendship: "想認識我的部落很歡迎 — 但請先把我當「Akiya」，不是「原住民代表」。我會很樂意分享真正的我。",
    hint: "認識多元文化的第一步是「先認識這個人」，文化會自然從她身上發光。",
  },
  {
    id: "heng",
    name: "小恆",
    emoji: "⛪",
    type: "ISTJ",
    color: "from-cyan-200 via-sky-200 to-blue-300",
    interests: ["鋼琴", "整理筆記", "教會詩歌團"],
    family: "我們全家都是基督徒。週日上午要上主日學，所以週六派對我都早走。",
    dream: "我想當音樂老師 — 把鋼琴教得人人都能彈第一首歌。",
    trouble: "週日早上不能跟同學玩，有時候會覺得「為什麼我家跟別人不一樣」 — 但其實我也喜歡我的家。",
    friendship: "週六晚上的派對我會早走，請不要說「拜託留下來嘛」 — 直接祝我「主日學愉快」就好，我會很開心。",
    hint: "尊重不同信仰的家庭節奏，比「拉他融入」更友善。",
  },
  {
    id: "xiang",
    name: "阿翔",
    emoji: "🔧",
    type: "ISTP",
    color: "from-slate-200 via-gray-200 to-zinc-300",
    interests: ["修腳踏車", "拆家電", "玩樂高"],
    family: "爸爸是修車師傅，我從小幫他遞工具。週末他教我換機油。",
    dream: "我想接爸爸的店 — 把它變成「會修任何東西」的工作室，連大家壞掉的玩具都修。",
    trouble: "有同學說「修車不是低俗的工作嗎？」 — 我不會回他，但我心裡知道我爸爸是匠人。手藝是真本事。",
    friendship: "東西壞了直接拿來找我 — 我修不好的話我們一起想辦法。我不喜歡空話，喜歡實際解決問題。",
    hint: "ISTP 用做的、不用說的 — 看到他默默幫忙，記得肯定他的行動。",
  },
  {
    id: "shiqing",
    name: "詩晴",
    emoji: "💃",
    type: "ESFP",
    color: "from-fuchsia-200 via-pink-200 to-rose-300",
    interests: ["輪椅舞蹈", "唱歌", "辦表演"],
    family: "我家有爸媽，他們都鼓勵我做想做的事。輪椅是我的「夥伴」不是「限制」。",
    dream: "我想參加帕拉林匹克輪椅舞競賽 — 證明「不一樣」也可以發光。",
    trouble: "校外教學前老師常常先「替我決定」我能不能去 — 我希望大家先問我「妳希望我們怎麼做」。",
    friendship: "推輪椅前先問我「我可以幫忙推嗎？」 — 我會說「謝謝，我自己來」或「謝謝，這段路請幫我」。先問再做就是尊重。",
    hint: "融合教育的核心是「先問本人」，不是「替他決定」。",
  },
];

/** localStorage key prefix */
const STORAGE_KEY_PREFIX = "mbti-npc-card-";

/** 取得單一卡片解鎖狀態 (4 個面向各自獨立) */
export function getCardUnlocked(cardId: string): Record<CardFace, boolean> {
  if (typeof window === "undefined") {
    return { basic: false, dream: false, trouble: false, friendship: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + cardId);
    if (!raw) return { basic: false, dream: false, trouble: false, friendship: false };
    return JSON.parse(raw);
  } catch {
    return { basic: false, dream: false, trouble: false, friendship: false };
  }
}

export function setCardFaceUnlocked(cardId: string, face: CardFace): void {
  if (typeof window === "undefined") return;
  const current = getCardUnlocked(cardId);
  current[face] = true;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + cardId, JSON.stringify(current));
  } catch {}
}

/** 解鎖所有卡片的某個面向 (例如 MBTI 主故事完成 → 解鎖所有 dream) */
export function unlockAllByFace(face: CardFace): void {
  for (const card of NPC_CARDS) {
    setCardFaceUnlocked(card.id, face);
  }
}

/** 取得整體解鎖統計 */
export function getOverallStats(): {
  cardsWithAnyFace: number;
  totalFacesUnlocked: number;
  totalCards: number;
  allFacesByType: Record<CardFace, number>;
} {
  const allFacesByType: Record<CardFace, number> = {
    basic: 0,
    dream: 0,
    trouble: 0,
    friendship: 0,
  };
  let cardsWithAnyFace = 0;
  let totalFacesUnlocked = 0;
  for (const card of NPC_CARDS) {
    const unlocked = getCardUnlocked(card.id);
    let any = false;
    for (const face of ["basic", "dream", "trouble", "friendship"] as CardFace[]) {
      if (unlocked[face]) {
        allFacesByType[face]++;
        totalFacesUnlocked++;
        any = true;
      }
    }
    if (any) cardsWithAnyFace++;
  }
  return {
    cardsWithAnyFace,
    totalFacesUnlocked,
    totalCards: NPC_CARDS.length,
    allFacesByType,
  };
}

/** 是否全部 48 面都解鎖 (12 卡 × 4 面) */
export function isAllCardsComplete(): boolean {
  const { totalFacesUnlocked } = getOverallStats();
  return totalFacesUnlocked === NPC_CARDS.length * 4;
}
