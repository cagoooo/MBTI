/**
 * 注音查詢 (build-time 預先生成的 1328 個常用字 → 注音 map)
 * 來源: scripts/gen-zhuyin.mjs 從 scenes / mbti / 元件文字掃出來
 */

import map from "./zhuyin-map.json";

const ZHUYIN: Record<string, string> = map as Record<string, string>;

const CJK_RE = /[一-鿿]/;

export function isCjk(ch: string): boolean {
  return CJK_RE.test(ch);
}

export function getZhuyin(ch: string): string | undefined {
  return ZHUYIN[ch];
}

export const ZHUYIN_MAP_SIZE = Object.keys(ZHUYIN).length;
