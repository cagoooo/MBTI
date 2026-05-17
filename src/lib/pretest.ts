/**
 * 課前快測（pre-test）— 學生開始 RPG 前先猜自己是哪型
 *
 * 設計：4 個情境式二選一 = 8 秒做完，不是「迷你問卷」是「快速直覺」
 * 收集後算出 4 字母 MBTI，與最終結果對比
 * 存 sessionStorage，跑完一次就清掉 (避免污染下次玩)
 *
 * 教育用途：
 *   - 課程紀錄：學生原本怎麼看自己 → 跑過 RPG 後有沒有不同
 *   - 反思素材：「你猜對了！」/「跟想像不同？」
 *   - 家長日報告材料
 */

import type { MBTIType } from "./types";

const KEY = "mbti-pretest-guess";

/** 一題對應一個 MBTI 軸的兩個方向 */
export interface PretestQuestion {
  id: "EI" | "SN" | "TF" | "JP";
  icon: string;
  prompt: string;
  options: [
    { letter: "E" | "S" | "T" | "J"; emoji: string; label: string; tag: string },
    { letter: "I" | "N" | "F" | "P"; emoji: string; label: string; tag: string },
  ];
}

export const PRETEST_QUESTIONS: PretestQuestion[] = [
  {
    id: "EI",
    icon: "🎉",
    prompt: "下課時，比較像你的是？",
    options: [
      { letter: "E", emoji: "👯", label: "找一群人玩鬼抓人", tag: "活力派" },
      { letter: "I", emoji: "📖", label: "找個安靜角落看小說", tag: "充電派" },
    ],
  },
  {
    id: "SN",
    icon: "🧠",
    prompt: "老師說「明天交一份報告」，你會？",
    options: [
      { letter: "S", emoji: "📝", label: "先把題目要的條列出來", tag: "務實派" },
      { letter: "N", emoji: "💡", label: "想一個跟別人都不一樣的角度", tag: "創意派" },
    ],
  },
  {
    id: "TF",
    icon: "🤔",
    prompt: "好朋友被欺負很難過，你會先...",
    options: [
      { letter: "T", emoji: "🛠️", label: "幫他想對付對方的辦法", tag: "解決派" },
      { letter: "F", emoji: "🫂", label: "抱抱他、陪他哭", tag: "共感派" },
    ],
  },
  {
    id: "JP",
    icon: "📅",
    prompt: "週末安排，比較像你的是？",
    options: [
      { letter: "J", emoji: "✅", label: "早上排好整天行程", tag: "計畫派" },
      { letter: "P", emoji: "🎲", label: "看心情，臨時決定就好", tag: "隨興派" },
    ],
  },
];

export interface PretestAnswers {
  EI?: "E" | "I";
  SN?: "S" | "N";
  TF?: "T" | "F";
  JP?: "J" | "P";
}

/** 把 4 軸答案組合成 MBTI 字串 */
export function assembleType(ans: PretestAnswers): MBTIType | null {
  const { EI, SN, TF, JP } = ans;
  if (!EI || !SN || !TF || !JP) return null;
  return `${EI}${SN}${TF}${JP}` as MBTIType;
}

export function savePretestGuess(guess: MBTIType, answers: PretestAnswers): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ guess, answers, at: Date.now() }));
  } catch {}
}

export interface SavedPretest {
  guess: MBTIType;
  answers: PretestAnswers;
  at: number;
}

export function loadPretestGuess(): SavedPretest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedPretest;
  } catch {
    return null;
  }
}

export function clearPretestGuess(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** 比對課前猜測與課後結果，回傳「相同字母個數」(0~4) */
export function countMatchedAxes(guess: MBTIType, actual: MBTIType): number {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === actual[i]) count++;
  }
  return count;
}

/** 給對應分數的人話文案 */
export function describeMatch(matched: number): { emoji: string; title: string; subtitle: string } {
  if (matched === 4) {
    return {
      emoji: "🎯",
      title: "完全猜中！",
      subtitle: "你超了解自己！日記、反思、自我覺察一定常做吧 ✨",
    };
  }
  if (matched === 3) {
    return {
      emoji: "✨",
      title: "幾乎全中！",
      subtitle: "只差一個字母，你對自己的認識已經很深囉～",
    };
  }
  if (matched === 2) {
    return {
      emoji: "🤔",
      title: "中了一半",
      subtitle: "故事中的選擇，讓你看到自己原來還有另一面",
    };
  }
  if (matched === 1) {
    return {
      emoji: "💡",
      title: "跟想像不同",
      subtitle: "原來你比想像中更多元！這就是 MBTI 探索的樂趣",
    };
  }
  return {
    emoji: "🌈",
    title: "完全顛覆！",
    subtitle: "故事中的你跟想像中超不同 — 這代表你願意嘗試各種樣子，超棒的！",
  };
}
