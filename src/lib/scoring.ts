import type { MBTIType, ScoreDelta, Scores } from "./types";

export const initialScores: Scores = { EI: 0, SN: 0, TF: 0, JP: 0 };

/**
 * 套用一個選項的分數變化。
 * 正數軸: E, S, T, J → 加正
 * 負數軸: I, N, F, P → 加負
 */
export function applyDelta(scores: Scores, delta: ScoreDelta): Scores {
  return {
    EI: scores.EI + (delta.E ?? 0) - (delta.I ?? 0),
    SN: scores.SN + (delta.S ?? 0) - (delta.N ?? 0),
    TF: scores.TF + (delta.T ?? 0) - (delta.F ?? 0),
    JP: scores.JP + (delta.J ?? 0) - (delta.P ?? 0),
  };
}

/**
 * 從分數推導 MBTI 型。tie 時的傾向 (避免全 0 給隨便):
 *   EI: 平手 → I (內向，較常見)
 *   SN: 平手 → N
 *   TF: 平手 → F
 *   JP: 平手 → P
 */
export function deriveType(scores: Scores): MBTIType {
  const e = scores.EI > 0 ? "E" : "I";
  const s = scores.SN > 0 ? "S" : "N";
  const t = scores.TF > 0 ? "T" : "F";
  const j = scores.JP > 0 ? "J" : "P";
  return (e + s + t + j) as MBTIType;
}

/**
 * 對外用的傾向強度 (0~100)，方便結果頁顯示
 * 每維度上限約 22 (38 場景，每選項約 1~3 分到 1~2 維度)
 */
export function strengthBars(scores: Scores) {
  const norm = (v: number) => {
    const ratio = Math.max(-1, Math.min(1, v / 22));
    return Math.round(50 + ratio * 50);
  };
  return {
    E: norm(scores.EI),       // 0~100，越大越 E
    I: 100 - norm(scores.EI),
    S: norm(scores.SN),
    N: 100 - norm(scores.SN),
    T: norm(scores.TF),
    F: 100 - norm(scores.TF),
    J: norm(scores.JP),
    P: 100 - norm(scores.JP),
  };
}
