#!/usr/bin/env node
/**
 * Build script: 生成 public/version.json
 * 內含 commit hash + build time，給 SW + 前端版本檢查用。
 *
 * 自動在 `npm run build` 前透過 prebuild npm script 跑。
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
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

const payload = {
  version,
  buildTime,
  commitMessage,
};

writeFileSync(join(publicDir, "version.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");

// 同時寫一份 .env.local 給 Next.js 在 build 時透過 process.env.NEXT_PUBLIC_APP_VERSION 拿到
// (避免 client 還要額外 fetch version.json 才知道自己跑哪版)
const envLine = `NEXT_PUBLIC_APP_VERSION=${version}\n`;
writeFileSync(join(process.cwd(), ".env.production"), envLine, "utf8");

console.log(`[gen-version] version=${version}`);
console.log(`[gen-version] wrote public/version.json + .env.production`);
