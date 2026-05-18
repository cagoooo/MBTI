#!/usr/bin/env node
/**
 * Skill-aware lint — 跑 3 個 skill 對應的 pattern 檢查
 *
 * 觸發: pre-commit hook (.githooks/pre-commit) 或手動 `npm run skill-lint`
 *
 * 3 個 check 對應 3 個 ~/.claude/skills/ 固化過的踩雷:
 *
 *   1. nextjs-ssg-hydration-window-check
 *      → grep render 階段 (非 useEffect / 非 event handler) 呼叫
 *        isFirebaseAvailable() / typeof window 等會 server/client 答案不同的函式
 *
 *   2. firebase-rules-client-schema-sync
 *      → 偵測 staged 改動: 若改了 createX/updateX/set/update 等 RTDB 寫入函式
 *        但沒同時改 database.rules.json → 警告
 *
 *   3. tailwind-hidden-vs-custom-display-conflict
 *      → grep className="xxx hidden lg:flex" 等混用 custom class + Tailwind hidden,
 *        對比 globals.css 該 custom class 是否寫死 display:flex/grid
 *
 * 找到問題 → exit 1 阻擋 commit + 印出對應 skill 文件路徑
 * 全乾淨 → exit 0
 *
 * 設計原則:
 *   - 0 npm dependency, 純 Node.js fs/child_process
 *   - 跑 < 200ms
 *   - 只查 staged files (git diff --cached --name-only), 不掃全 repo
 *   - 手動跑時可加 --all 掃全專案 (CI 用)
 */

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const HOME = process.env.USERPROFILE || process.env.HOME || "";
const SKILLS_DIR = join(HOME, ".claude", "skills");
const ALL_MODE = process.argv.includes("--all");

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

let errorCount = 0;
let warningCount = 0;

function header(text) {
  console.log(`\n${CYAN}━━━ ${text} ━━━${RESET}`);
}

function error(skill, file, line, msg, suggestion) {
  errorCount++;
  console.log(`${RED}✗ ${skill}${RESET}`);
  console.log(`  ${file}:${line}`);
  console.log(`  ${msg}`);
  if (suggestion) console.log(`  ${DIM}→ ${suggestion}${RESET}`);
  const skillPath = join(SKILLS_DIR, skill, "SKILL.md");
  if (existsSync(skillPath)) {
    console.log(`  ${DIM}skill: ${skillPath}${RESET}`);
  }
  console.log();
}

function warn(skill, file, msg, suggestion) {
  warningCount++;
  console.log(`${YELLOW}⚠ ${skill}${RESET}`);
  console.log(`  ${file}`);
  console.log(`  ${msg}`);
  if (suggestion) console.log(`  ${DIM}→ ${suggestion}${RESET}`);
  console.log();
}

function ok(msg) {
  console.log(`${GREEN}✓${RESET} ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────
// 收集要檢查的檔案
// ─────────────────────────────────────────────────────────────────────

function getStagedFiles() {
  try {
    const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
      encoding: "utf8",
    });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getAllSourceFiles() {
  try {
    const out = execSync(
      'git ls-files "src/**/*.tsx" "src/**/*.ts" "database.rules.json"',
      { encoding: "utf8" },
    );
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const allFiles = ALL_MODE ? getAllSourceFiles() : getStagedFiles();
const tsxFiles = allFiles.filter(
  (f) => f.startsWith("src/") && (f.endsWith(".tsx") || f.endsWith(".ts")),
);
const rulesChanged = allFiles.includes("database.rules.json");

if (tsxFiles.length === 0 && !rulesChanged && !ALL_MODE) {
  console.log(`${DIM}skill-lint: no relevant files staged, skipping${RESET}`);
  process.exit(0);
}

console.log(
  `${CYAN}🔍 skill-lint${RESET} ${DIM}(${ALL_MODE ? "all-mode" : "staged-mode"}, ${tsxFiles.length} tsx files${rulesChanged ? " + rules" : ""})${RESET}`,
);

// ─────────────────────────────────────────────────────────────────────
// Check 1: nextjs-ssg-hydration-window-check
// 在 JSX render 階段直接呼叫 isFirebaseAvailable() / typeof window
// ─────────────────────────────────────────────────────────────────────

header("Check 1: SSG hydration safety");

const HYDRATION_PATTERNS = [
  /\{\s*!?isFirebaseAvailable\(\)\s*&&/g,
  /\{\s*!?isSupabaseAvailable\(\)\s*&&/g,
  /\{\s*typeof\s+window\s*!==?\s*["']undefined["']\s*&&/g,
  /\{\s*localStorage\./g,
  /\{\s*sessionStorage\./g,
  /\{\s*document\.cookie/g,
];

const HYDRATION_SAFE_FILES = new Set([
  // useEffect 內合法用 isFirebaseAvailable
  // 我們只用簡單 regex, 邏輯 false positive 由人工 review
]);

function checkHydration(file, content) {
  const lines = content.split("\n");
  // 簡單 heuristic: 看 pattern 出現的「上一行」是否在 useEffect / function 內
  // 真正準確需要 AST, 這裡只報「render 直接 inline」的最高風險 case
  lines.forEach((line, i) => {
    for (const pat of HYDRATION_PATTERNS) {
      pat.lastIndex = 0;
      if (pat.test(line) && !line.trim().startsWith("//")) {
        // 排除 useEffect / function 內 (簡單看上下文)
        const context = lines.slice(Math.max(0, i - 10), i).join("\n");
        const insideEffect =
          /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*$/.test(context) ||
          /function\s+\w+\s*\([^)]*\)\s*\{[^}]*$/.test(context) ||
          /async\s+function/.test(context.split("\n").slice(-3).join("\n"));
        if (!insideEffect) {
          error(
            "nextjs-ssg-hydration-window-check",
            file,
            i + 1,
            `Render-time call may differ on server vs client → React #418 hydration mismatch`,
            "Gate behind a mounted state: const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), [])",
          );
        }
      }
    }
  });
}

for (const f of tsxFiles) {
  const path = join(ROOT, f);
  if (!existsSync(path)) continue;
  const content = readFileSync(path, "utf8");
  // 只查 client component
  if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) continue;
  if (HYDRATION_SAFE_FILES.has(f)) continue;
  checkHydration(f, content);
}

if (errorCount === 0) ok("hydration safety");

// ─────────────────────────────────────────────────────────────────────
// Check 2: firebase-rules-client-schema-sync
// 改了 createX/updateX 寫入物件但沒改 rules
// ─────────────────────────────────────────────────────────────────────

header("Check 2: Firebase rules vs client schema sync");

const RTDB_WRITE_FILES = ["src/lib/classroom-rtdb.ts", "src/lib/firebase.ts"];
const rtdbFileChanged = tsxFiles.some((f) =>
  RTDB_WRITE_FILES.some((rtdb) => f.endsWith(rtdb)),
);

if (rtdbFileChanged && !rulesChanged) {
  // 進一步檢查 staged diff 有沒有新增 set/update/push 或新欄位
  try {
    const diff = execSync("git diff --cached src/lib/classroom-rtdb.ts src/lib/firebase.ts", {
      encoding: "utf8",
    });
    // 看 + 行有沒有: set(/update(/push( 或新增 interface 欄位 (+ key: type;)
    const hasWriteOps = /^\+.*(?:set|update|push|setStudentSel|updateSelProgress)\s*\(/m.test(diff);
    const hasNewField = /^\+\s+\w+:\s+(?:string|number|boolean|"[^"]+")/m.test(diff);
    if (hasWriteOps || hasNewField) {
      warn(
        "firebase-rules-client-schema-sync",
        RTDB_WRITE_FILES.find((f) => allFiles.some((af) => af.endsWith(f))) || "src/lib/classroom-rtdb.ts",
        "Changed RTDB write code (set/update/push or new interface field) but database.rules.json not staged",
        "If you added a new field, update database.rules.json validator and run `firebase deploy --only database`",
      );
    } else {
      ok("RTDB write code changed but no schema diff detected");
    }
  } catch {
    ok("no RTDB write changes");
  }
} else if (rulesChanged) {
  ok("database.rules.json changed (assumed paired with client write)");
} else {
  ok("no RTDB write changes");
}

// ─────────────────────────────────────────────────────────────────────
// Check 3: tailwind-hidden-vs-custom-display-conflict
// className="xxx hidden lg:flex" 跟 globals.css 寫死 display 衝突
// ─────────────────────────────────────────────────────────────────────

header("Check 3: Tailwind hidden vs custom display conflict");

// 從 globals.css 找出有寫死 display: flex/grid/block 的 class
let cssOverrides = new Map(); // className → "flex" | "grid" | etc.
const globalsCssPath = join(ROOT, "src", "app", "globals.css");
if (existsSync(globalsCssPath)) {
  const css = readFileSync(globalsCssPath, "utf8");
  // 找 ^.className { ... display: X ... }
  const blockRegex = /^\.([\w-]+)\s*\{([^}]*)\}/gm;
  let m;
  while ((m = blockRegex.exec(css)) !== null) {
    const name = m[1];
    const body = m[2];
    const displayMatch = body.match(/(?:^|;|\s)display\s*:\s*(flex|grid|block|inline-flex|inline-grid|inline-block)\s*(?:;|$)/);
    if (displayMatch) {
      // 排除註解 / media query 內
      if (!body.includes("/*") || displayMatch.index > body.indexOf("*/")) {
        cssOverrides.set(name, displayMatch[1]);
      }
    }
  }
}

const TAILWIND_HIDDEN_RE = /className\s*=\s*["'`]([^"'`]*hidden\s+(?:sm|md|lg|xl|2xl):(?:flex|grid|block)[^"'`]*)["'`]/g;

let conflictFound = false;
for (const f of tsxFiles) {
  const path = join(ROOT, f);
  if (!existsSync(path)) continue;
  const content = readFileSync(path, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    TAILWIND_HIDDEN_RE.lastIndex = 0;
    let match;
    while ((match = TAILWIND_HIDDEN_RE.exec(line)) !== null) {
      const className = match[1];
      const customClasses = className
        .split(/\s+/)
        .filter((c) => !c.startsWith("hidden") && !/^(sm|md|lg|xl|2xl):/.test(c));
      for (const cc of customClasses) {
        if (cssOverrides.has(cc)) {
          error(
            "tailwind-hidden-vs-custom-display-conflict",
            f,
            i + 1,
            `class .${cc} hardcodes display:${cssOverrides.get(cc)} in globals.css → overrides Tailwind .hidden, mobile element won't hide`,
            `Remove display from .${cc} in globals.css and let Tailwind 'hidden md:flex' control it`,
          );
          conflictFound = true;
        }
      }
    }
  });
}
if (!conflictFound) ok("no Tailwind hidden vs custom display conflicts");

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log();
if (errorCount > 0) {
  console.log(
    `${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`,
  );
  console.log(`${RED}✗ skill-lint FAILED: ${errorCount} error(s), ${warningCount} warning(s)${RESET}`);
  console.log(`${DIM}commit blocked. Fix above issues or skip with: git commit --no-verify${RESET}`);
  console.log(
    `${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`,
  );
  process.exit(1);
} else if (warningCount > 0) {
  console.log(
    `${YELLOW}⚠ skill-lint: ${warningCount} warning(s) — review but allowed${RESET}`,
  );
  process.exit(0);
} else {
  console.log(`${GREEN}✓ skill-lint passed${RESET}`);
  process.exit(0);
}
