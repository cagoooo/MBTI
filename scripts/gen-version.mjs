#!/usr/bin/env node
/**
 * Build script: 生成 public/version.json 並把 BUILD_VERSION 注入 public/sw.js
 *
 * ⚠️ 兩件事一起做:
 *   1. 寫 public/version.json (前端 polling 用)
 *   2. 把 public/sw.js 中的 BUILD_VERSION 替換成實際版本字串
 *      → 讓 sw.js 內容每次 build 都改變
 *      → 瀏覽器 register/update 時偵測到 byte 差 → 觸發 install 新 SW
 *      → activate 時自動清舊 cache + 通知 client (SwRegister 收到事件後跳 banner)
 *
 * 為什麼要動 sw.js?
 *   如果 sw.js 永遠一樣, 瀏覽器永遠不會 install 新 SW, 舊 cache 永遠不清。
 *   常見悲劇: 使用者卡在舊版本好幾天, 看不到任何更新 banner。
 *
 * 自動在 `npm run build` 前透過 prebuild npm script 跑。
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

function getCommitHash() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

function getCommitMessage() {
  try {
    return execSync("git log -1 --pretty=%s", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
      .slice(0, 80);
  } catch {
    return "";
  }
}

function buildVersionString() {
  const now = new Date();
  const stamp =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0") +
    "-" +
    String(now.getUTCHours()).padStart(2, "0") +
    String(now.getUTCMinutes()).padStart(2, "0");
  const commit = getCommitHash();
  return `${stamp}-${commit}`;
}

const version = buildVersionString();
const buildTime = new Date().toISOString();
const commitMessage = getCommitMessage();

const publicDir = join(process.cwd(), "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// ── 1) version.json ──────────────────────────────────────
const payload = { version, buildTime, commitMessage };
writeFileSync(join(publicDir, "version.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");

// ── 2) .env.production (給 Next.js 把 NEXT_PUBLIC_APP_VERSION 烤進 JS) ──
writeFileSync(join(process.cwd(), ".env.production"), `NEXT_PUBLIC_APP_VERSION=${version}\n`, "utf8");

// ── 3) 把 BUILD_VERSION 注入 sw.js ──────────────────────
const swPath = join(publicDir, "sw.js");
if (existsSync(swPath)) {
  let swContent = readFileSync(swPath, "utf8");
  const PLACEHOLDER_PATTERN = /const BUILD_VERSION = "[^"]+";/;
  const replacement = `const BUILD_VERSION = "${version}";`;
  if (PLACEHOLDER_PATTERN.test(swContent)) {
    swContent = swContent.replace(PLACEHOLDER_PATTERN, replacement);
    writeFileSync(swPath, swContent, "utf8");
    console.log(`[gen-version] 已注入 BUILD_VERSION 到 sw.js`);
  } else {
    console.warn(`[gen-version] ⚠️ 找不到 sw.js 中的 BUILD_VERSION 宣告 — SW 不會更新!`);
    console.warn(`[gen-version]    請確認 public/sw.js 第一段有 const BUILD_VERSION = "...";`);
  }
} else {
  console.warn(`[gen-version] ⚠️ public/sw.js 不存在, 跳過 SW 版本注入`);
}

console.log(`[gen-version] version=${version}`);
console.log(`[gen-version] wrote public/version.json + .env.production + sw.js (BUILD_VERSION)`);
