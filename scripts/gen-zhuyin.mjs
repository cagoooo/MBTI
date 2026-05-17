#!/usr/bin/env node
/**
 * 掃 source code 抓所有中文字 → 用 pinyin v4 轉拼音 → 用 pinyin-zhuyin 轉注音 → 存成 JSON map
 *
 * ⚠️ 注意：pinyin v4 已經拿掉 STYLE_BOPOMOFO（v2/v3 才有）
 *   所以這裡走兩段式：pinyin (帶聲調) → pinyin-zhuyin (出 ㄅㄆㄇ)
 *
 * 為什麼 build-time 而非 runtime：
 *   - `pinyin` package 含 5MB+ 詞典，不能塞 client bundle
 *   - 用過的字 < 2000 個，map JSON 只 ~50KB
 *   - 編輯 scenes/mbti 時記得跑一次重新生成
 *
 * 用法：npm run gen:zhuyin
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pinyinPkg from "pinyin";
import pinyinZhuyinPkg from "pinyin-zhuyin";

// pinyin v4 ESM/CJS interop — fn 是個函式
const pinyin = pinyinPkg.pinyin ?? pinyinPkg.default ?? pinyinPkg;
// pinyin-zhuyin 也走 default
const { pinyinToZhuyin } = pinyinZhuyinPkg.default ?? pinyinZhuyinPkg;

if (typeof pinyin !== "function") {
  throw new Error("pinyin package: 找不到正確的 export");
}
if (typeof pinyinToZhuyin !== "function") {
  throw new Error("pinyin-zhuyin package: 找不到 pinyinToZhuyin");
}

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

const map = {};
let success = 0;
let fallback = 0;

for (const ch of chars) {
  try {
    // 1) 取得帶聲調拼音 (預設 style: 'tone')
    const py = pinyin(ch, { segment: false, heteronym: false });
    const tonedPy = py?.[0]?.[0];
    if (!tonedPy) {
      fallback++;
      continue;
    }
    // 2) 拼音 → 注音
    const zhuyin = pinyinToZhuyin(tonedPy);
    if (zhuyin) {
      map[ch] = zhuyin;
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

// Sanity check：印幾個樣本確認真的是注音不是拼音
const samples = ["新", "教", "室", "門", "口", "你", "的", "內", "心"];
console.log("[gen-zhuyin] 抽樣：" + samples.map((c) => `${c}→${sortedMap[c] ?? "?"}`).join(" "));
