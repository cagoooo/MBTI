#!/usr/bin/env node
/**
 * 掃 source code 抓所有中文字 → 用 pinyin package 轉注音 → 存成 JSON map
 *
 * 為什麼 build-time 而非 runtime：
 *   - `pinyin` package 含 5MB+ 詞典，不能塞 client bundle
 *   - 用過的字 < 2000 個，map JSON 只 ~50KB
 *   - 編輯 scenes/mbti 時記得跑一次重新生成
 *
 * 用法：npm run gen:zhuyin
 */

import { readFileSync, writeFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import pinyin from "pinyin";

// 掃這些檔案內所有出現的中文字
const SOURCE_GLOBS = [
  "src/lib/scenes.ts",
  "src/lib/mbti.ts",
  "src/lib/match.ts",
  "src/components/CampusIntro.tsx",
  "src/components/PrintSheet.tsx",
  "src/components/ShareButtons.tsx",
  "src/components/Footer.tsx",
  "src/app/page.tsx",
  "src/app/game/page.tsx",
  "src/app/result/[type]/page.tsx",
  "src/app/types/page.tsx",
  "src/app/types/[type]/page.tsx",
];

let allText = "";
for (const p of SOURCE_GLOBS) {
  try {
    allText += readFileSync(join(process.cwd(), p), "utf8");
  } catch {
    // 跳過不存在的檔案
  }
}

// 提取所有 CJK 統一漢字 (基本範圍 U+4E00-U+9FFF)
const chars = new Set(allText.match(/[一-鿿]/g) ?? []);

// 用 pinyin package 跑注音模式
const fn = typeof pinyin === "function" ? pinyin : pinyin.default ?? pinyin.pinyin;
if (typeof fn !== "function") {
  throw new Error("pinyin package: 找不到正確的 export，請查 npm 版本");
}

// pinyin 4.x API: pinyin(text, { style: STYLE_BOPOMOFO })
const STYLE_BOPOMOFO = pinyin.STYLE_BOPOMOFO ?? 8;

const map = {};
let success = 0;
let fallback = 0;

for (const ch of chars) {
  try {
    const result = fn(ch, { style: STYLE_BOPOMOFO, segment: false, heteronym: false });
    if (result?.[0]?.[0]) {
      map[ch] = result[0][0];
      success++;
    } else {
      fallback++;
    }
  } catch {
    fallback++;
  }
}

// 寫成 JSON (排序 key 確保 deterministic)
const sortedKeys = Object.keys(map).sort();
const sortedMap = {};
for (const k of sortedKeys) sortedMap[k] = map[k];

const outPath = join(process.cwd(), "src/lib/zhuyin-map.json");
writeFileSync(outPath, JSON.stringify(sortedMap, null, 0) + "\n", "utf8");

const sizeKb = (Buffer.byteLength(JSON.stringify(sortedMap)) / 1024).toFixed(1);
console.log(`[gen-zhuyin] 掃 ${chars.size} 個獨特中文字`);
console.log(`[gen-zhuyin] 成功 ${success} / 失敗 ${fallback}`);
console.log(`[gen-zhuyin] 寫入 src/lib/zhuyin-map.json (${sizeKb} KB)`);
