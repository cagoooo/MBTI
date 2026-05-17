/**
 * 我的學習歷程冊 — 跨 session 的學生個人成長軌跡
 *
 * 為什麼用 localStorage 而非 sessionStorage:
 *   - sessionStorage 開關瀏覽器就清掉，無法做「半年來的變化」
 *   - localStorage 跨日跨週留存，學期末看軌跡才有意義
 *   - 學生在同一裝置（家用平板/教室電腦）才能累積
 *
 * 三種紀錄類型:
 *   MBTI:  type + 4 軸分數 + 走的支線 + 是否猜對課前
 *   SEL:   風格 + 4 軸分數
 *   GUESS: 猜中率 + 對的題數 + 全部題數
 *
 * 隱私設計:
 *   - 純前端，不上傳任何後端
 *   - 學生 + 家長可一鍵刪除全部
 *   - 老師看不到（這是學生個人冊）
 */

import type { MBTIType, Scores } from "./types";
import type { SelStyle } from "./sel";

const KEY = "mbti-history-v1";
const MAX_ENTRIES = 100; // 防止 localStorage 爆掉，超過就 FIFO 砍掉最舊的

export type HistoryKind = "mbti" | "sel" | "guess";

export interface HistoryEntryBase {
  id: string; // 用 timestamp + random 確保唯一
  kind: HistoryKind;
  at: number; // timestamp
  /** 可選的標籤 — 如「期初測」「期末測」「五年級上學期」*/
  label?: string;
}

export interface MbtiHistoryEntry extends HistoryEntryBase {
  kind: "mbti";
  type: MBTIType;
  scores: Scores;
  branch?: string;
  /** 課前猜的型，若有的話 */
  pretestGuess?: MBTIType;
  /** 課前猜對幾軸 0-4 */
  pretestMatched?: number;
}

export interface SelHistoryEntry extends HistoryEntryBase {
  kind: "sel";
  style: SelStyle;
  scores: { express: number; solve: number; calm: number; connect: number };
}

export interface GuessHistoryEntry extends HistoryEntryBase {
  kind: "guess";
  total: number;
  correct: number;
  /** 4 軸個別正確率 */
  axes?: { EI: number; SN: number; TF: number; JP: number };
}

export type HistoryEntry = MbtiHistoryEntry | SelHistoryEntry | GuessHistoryEntry;

// ─────────────────── CRUD ───────────────────

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

// 接收 union 而非 Omit<union> — TS 在 union + Omit + spread 時不會正確 narrow
type NewHistoryEntry =
  | (Omit<MbtiHistoryEntry, "id" | "at"> & { at?: number })
  | (Omit<SelHistoryEntry, "id" | "at"> & { at?: number })
  | (Omit<GuessHistoryEntry, "id" | "at"> & { at?: number });

export function addHistory(entry: NewHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const list = loadHistory();
    const full = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: entry.at ?? Date.now(),
    } as HistoryEntry;
    list.push(full);
    // FIFO 超過上限砍最舊的
    while (list.length > MAX_ENTRIES) list.shift();
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("mbti-history-change"));
  } catch {}
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("mbti-history-change"));
  } catch {}
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("mbti-history-change"));
  } catch {}
}

// ─────────────────── 查詢工具 ───────────────────

/** 依時間正序排好 (從舊到新)，方便畫時間軸 */
export function getHistorySorted(): HistoryEntry[] {
  return loadHistory().sort((a, b) => a.at - b.at);
}

/** 依時間倒序 (從新到舊)，列表預設用這個 */
export function getHistoryDesc(): HistoryEntry[] {
  return loadHistory().sort((a, b) => b.at - a.at);
}

/** 拿某種類型的歷史 */
export function getHistoryByKind<K extends HistoryKind>(kind: K): Array<Extract<HistoryEntry, { kind: K }>> {
  return loadHistory().filter((e) => e.kind === kind) as Array<Extract<HistoryEntry, { kind: K }>>;
}

/** 統計：跑過幾次 MBTI / SEL / Guess */
export function getCountByKind(): Record<HistoryKind, number> {
  const list = loadHistory();
  return {
    mbti: list.filter((e) => e.kind === "mbti").length,
    sel: list.filter((e) => e.kind === "sel").length,
    guess: list.filter((e) => e.kind === "guess").length,
  };
}

/** 找出 MBTI 變化的次數 (例如 ENFP→ENFJ 算 1 次變化) */
export function countMbtiChanges(): number {
  const mbtis = getHistoryByKind("mbti").sort((a, b) => a.at - b.at);
  let changes = 0;
  for (let i = 1; i < mbtis.length; i++) {
    if (mbtis[i].type !== mbtis[i - 1].type) changes++;
  }
  return changes;
}

/** 找出 SEL 風格變化的次數 */
export function countSelChanges(): number {
  const sels = getHistoryByKind("sel").sort((a, b) => a.at - b.at);
  let changes = 0;
  for (let i = 1; i < sels.length; i++) {
    if (sels[i].style !== sels[i - 1].style) changes++;
  }
  return changes;
}

/** 依時間區段分群 (給時間軸用) */
export function groupByMonth(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const map: Record<string, HistoryEntry[]> = {};
  for (const e of entries) {
    const d = new Date(e.at);
    const key = `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, "0")}月`;
    if (!map[key]) map[key] = [];
    map[key].push(e);
  }
  return map;
}
