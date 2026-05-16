// MBTI 四維度
export type Axis = "EI" | "SN" | "TF" | "JP";

// 16 型 MBTI
export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export const ALL_TYPES: MBTIType[] = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

// 分數 (E vs I, S vs N, T vs F, J vs P)
// 正數偏 E/S/T/J，負數偏 I/N/F/P
export interface Scores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

export interface ScoreDelta {
  E?: number;
  I?: number;
  S?: number;
  N?: number;
  T?: number;
  F?: number;
  J?: number;
  P?: number;
}

// 支線標籤
export type Branch = "main" | "sport" | "art" | "study" | "friend";

export interface Choice {
  /** 顯示文字 */
  text: string;
  /** emoji */
  emoji?: string;
  /** 加分 */
  delta: ScoreDelta;
  /** 下一個場景 id；不填則依場景的 next 預設 */
  next?: string;
  /** 設定支線（從這個選擇開始走某條支線） */
  setBranch?: Branch;
  /** 選後在故事日誌留下的一句話 (玩家會看到) */
  followUp?: string;
}

export interface Scene {
  /** 唯一 id */
  id: string;
  /** 場景所屬支線 (決定哪些玩家會看到) */
  branch: Branch;
  /** 章節編號（顯示用） */
  chapter: number;
  /** 場景背景 emoji 或關鍵字 */
  bg: string;
  /** 場景場地 (顯示用) */
  location: string;
  /** 角色名 (對話者) */
  speaker?: string;
  /** 角色 emoji */
  speakerEmoji?: string;
  /** 場景描述 / 對白 — 段落陣列 */
  text: string[];
  /** 選項 */
  choices: Choice[];
  /** 預設下一場景 id (若選項沒設 next 就走這個) */
  next?: string;
  /** 是否是結尾 */
  isEnding?: boolean;
}

export interface GameState {
  currentSceneId: string;
  scores: Scores;
  history: { sceneId: string; choiceIndex: number; followUp?: string }[];
  branch: Branch;
}
