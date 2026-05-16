import { ALL_TYPES, type MBTIType } from "./types";

export interface ClassEntry {
  name?: string;
  type: MBTIType;
}

/**
 * 把使用者貼上的多種格式解析成 ClassEntry[]
 * 支援：
 *   一行一個：    INTJ
 *   名字 + 型別：小明 INTJ
 *                小明: INTJ
 *                小明  ENFP
 *   CSV：        INTJ, ENFP, ESTP
 *   混合都吃。
 */
export function parseClassInput(raw: string): { entries: ClassEntry[]; invalidLines: string[] } {
  const entries: ClassEntry[] = [];
  const invalidLines: string[] = [];
  const TYPE_RE = /\b([IE][SN][TF][JP])\b/i;

  const lines = raw
    .split(/[\n,;|]/g) // 換行、逗號、分號、豎線都當分隔
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const m = line.match(TYPE_RE);
    if (!m) {
      invalidLines.push(line);
      continue;
    }
    const type = m[1].toUpperCase() as MBTIType;
    if (!ALL_TYPES.includes(type)) {
      invalidLines.push(line);
      continue;
    }
    // 名字：型別前後的非空白字串去掉冒號 / 等號 / 數字
    const name = line
      .replace(m[1], "")
      .replace(/[:：=\-\d#.()（）　]+/g, " ")
      .trim();
    entries.push({ type, name: name || undefined });
  }

  return { entries, invalidLines };
}

export interface ClassStats {
  total: number;
  perType: Record<MBTIType, number>;
  perGroup: { name: string; key: string; count: number; types: MBTIType[] }[];
  axes: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  mostCommon: { type: MBTIType; count: number } | null;
  rarest: { type: MBTIType; count: number } | null;
  /** 在這個班沒有任何人是這型 */
  missingTypes: MBTIType[];
}

export function computeStats(entries: ClassEntry[]): ClassStats {
  const perType = Object.fromEntries(ALL_TYPES.map((t) => [t, 0])) as Record<MBTIType, number>;
  const axes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const e of entries) {
    perType[e.type]++;
    for (const ch of e.type.split("")) {
      if (ch in axes) (axes as Record<string, number>)[ch]++;
    }
  }

  const groups = [
    { name: "分析家 NT", key: "NT", types: ALL_TYPES.filter((t) => t.includes("NT")) },
    { name: "外交官 NF", key: "NF", types: ALL_TYPES.filter((t) => t.includes("NF")) },
    { name: "守護者 SJ", key: "SJ", types: ALL_TYPES.filter((t) => t[1] === "S" && t[3] === "J") },
    { name: "探險家 SP", key: "SP", types: ALL_TYPES.filter((t) => t[1] === "S" && t[3] === "P") },
  ];
  const perGroup = groups.map((g) => ({
    ...g,
    count: g.types.reduce((sum, t) => sum + perType[t], 0),
  }));

  // 找最多 / 最少 (只在 count > 0 的型裡找最少；最多在全部裡找)
  let mostCommon: { type: MBTIType; count: number } | null = null;
  let rarest: { type: MBTIType; count: number } | null = null;
  for (const t of ALL_TYPES) {
    const c = perType[t];
    if (c > 0) {
      if (!mostCommon || c > mostCommon.count) mostCommon = { type: t, count: c };
      if (!rarest || c < rarest.count) rarest = { type: t, count: c };
    }
  }
  const missingTypes = ALL_TYPES.filter((t) => perType[t] === 0);

  return {
    total: entries.length,
    perType,
    perGroup,
    axes,
    mostCommon,
    rarest,
    missingTypes,
  };
}
