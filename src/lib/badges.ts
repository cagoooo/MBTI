import { ALL_TYPES, type MBTIType } from "./types";

export interface BadgeProgress {
  /** 已解鎖的 16 型 */
  unlockedTypes: MBTIType[];
  /** 玩過的支線 (branch key: sport/art/study/friend) */
  branchesPlayed: string[];
  /** 玩遊戲的不同日期 */
  daysPlayed: string[]; // ISO date "2026-05-17"
  /** 最近一次遊戲時間 */
  lastPlay?: string;
}

const KEY = "mbti-badges";

export const EMPTY: BadgeProgress = {
  unlockedTypes: [],
  branchesPlayed: [],
  daysPlayed: [],
};

export function loadProgress(): BadgeProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as BadgeProgress;
    return {
      unlockedTypes: Array.isArray(p.unlockedTypes) ? p.unlockedTypes.filter((t) => ALL_TYPES.includes(t)) : [],
      branchesPlayed: Array.isArray(p.branchesPlayed) ? p.branchesPlayed : [],
      daysPlayed: Array.isArray(p.daysPlayed) ? p.daysPlayed : [],
      lastPlay: typeof p.lastPlay === "string" ? p.lastPlay : undefined,
    };
  } catch {
    return EMPTY;
  }
}

export function saveProgress(p: BadgeProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/**
 * 解鎖一個 MBTI 型 + 可選的支線標籤。
 * 回傳「這次新增的徽章描述」(可能空陣列)
 */
export interface UnlockEvent {
  kind: "type" | "milestone" | "branch" | "special";
  title: string;
  description: string;
  emoji: string;
}

export function unlockResult(type: MBTIType, branch?: string): UnlockEvent[] {
  const p = loadProgress();
  const events: UnlockEvent[] = [];

  const wasUnlocked = p.unlockedTypes.includes(type);
  if (!wasUnlocked) {
    p.unlockedTypes = [...p.unlockedTypes, type];
    events.push({ kind: "type", title: `新解鎖：${type}`, description: `你解鎖了第 ${p.unlockedTypes.length} 個人格類型！`, emoji: "🎉" });
  }

  if (branch && branch !== "main" && !p.branchesPlayed.includes(branch)) {
    p.branchesPlayed = [...p.branchesPlayed, branch];
    const branchName: Record<string, string> = { sport: "校隊組", art: "藝術組", study: "學術組", friend: "友誼組" };
    events.push({ kind: "branch", title: `走過 ${branchName[branch] ?? branch} 支線`, description: `你已體驗 ${p.branchesPlayed.length}/4 條支線。`, emoji: "🌳" });
  }

  // 紀錄當日
  const today = new Date().toISOString().slice(0, 10);
  if (!p.daysPlayed.includes(today)) {
    p.daysPlayed = [...p.daysPlayed, today].slice(-30); // 保留最近 30 天
  }
  p.lastPlay = new Date().toISOString();

  // 里程碑
  const COUNT = p.unlockedTypes.length;
  for (const m of [4, 8, 12, 16]) {
    if (COUNT === m) {
      events.push({
        kind: "milestone",
        title: m === 16 ? "全圖鑑達人！" : `已解鎖 ${m}/16 型`,
        description:
          m === 4 ? "已踏出探索的第一步！" :
          m === 8 ? "已解鎖一半人格類型，越來越懂自己了！" :
          m === 12 ? "再 4 個就全部蒐集完成！" :
          "你解鎖了全部 16 型！MBTI 圖鑑王者就是你！",
        emoji: m === 16 ? "👑" : m === 12 ? "💎" : m === 8 ? "🌟" : "⭐",
      });
    }
  }

  // 特殊：4 條支線都走完
  if (p.branchesPlayed.length === 4 && events.some((e) => e.kind === "branch")) {
    events.push({
      kind: "special",
      title: "校園全才！",
      description: "你已體驗過四條校園支線 — 運動、藝術、學術、友誼通通走過。",
      emoji: "🏆",
    });
  }

  // 特殊：連玩 7 天
  if (p.daysPlayed.length >= 7) {
    const dates = p.daysPlayed.slice(-7).map((d) => new Date(d).getTime()).sort((x, y) => x - y);
    const gaps = dates.slice(1).map((d, i) => Math.round((d - dates[i]) / 86400000));
    if (gaps.every((g) => g <= 2)) {
      events.push({
        kind: "special",
        title: "全勤達人！",
        description: "你連續多日來這裡玩，是個探索人格的小博士！",
        emoji: "📅",
      });
    }
  }

  saveProgress(p);
  return events;
}

export function resetBadges() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
