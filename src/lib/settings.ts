/**
 * 適性設定（字級、TTS 速度等）— 純前端 localStorage 持久化
 *
 * 設計原則：
 *   - 所有設定都有 default，沒設定也 work
 *   - 改變時用 CustomEvent 通知整站 (跨元件同步)
 *   - SSR safe (typeof window guard)
 */

// ─────────────────── 字級 ───────────────────

export type FontScale = "sm" | "md" | "lg" | "xl";

const FONT_SCALE_KEY = "mbti-font-scale";
const FONT_SCALE_VALUES: Record<FontScale, number> = {
  sm: 0.9,   // 小（適合視力好的成人）
  md: 1.0,   // 中（預設）
  lg: 1.15,  // 大（適合中年級）
  xl: 1.3,   // 特大（適合低年級 / 視力弱者）
};

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  sm: "小",
  md: "中",
  lg: "大",
  xl: "特大",
};

export function getFontScale(): FontScale {
  if (typeof window === "undefined") return "md";
  const v = localStorage.getItem(FONT_SCALE_KEY) as FontScale | null;
  return v && v in FONT_SCALE_VALUES ? v : "md";
}

export function setFontScale(v: FontScale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FONT_SCALE_KEY, v);
  applyFontScale(v);
  window.dispatchEvent(new CustomEvent("mbti-settings-change", { detail: { fontScale: v } }));
}

/** 套用到 root，全站文字會跟著放大縮小 */
export function applyFontScale(v?: FontScale) {
  if (typeof window === "undefined") return;
  const scale = v ?? getFontScale();
  document.documentElement.style.setProperty("--font-scale", String(FONT_SCALE_VALUES[scale]));
}

// ─────────────────── TTS 速度 ───────────────────

const TTS_RATE_KEY = "mbti-tts-rate";
const TTS_RATE_MIN = 0.7;
const TTS_RATE_MAX = 1.5;
const TTS_RATE_DEFAULT = 1.0;

export function getTtsRate(): number {
  if (typeof window === "undefined") return TTS_RATE_DEFAULT;
  const raw = localStorage.getItem(TTS_RATE_KEY);
  if (!raw) return TTS_RATE_DEFAULT;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return TTS_RATE_DEFAULT;
  return Math.max(TTS_RATE_MIN, Math.min(TTS_RATE_MAX, n));
}

export function setTtsRate(rate: number) {
  if (typeof window === "undefined") return;
  const clamped = Math.max(TTS_RATE_MIN, Math.min(TTS_RATE_MAX, rate));
  localStorage.setItem(TTS_RATE_KEY, String(clamped));
  window.dispatchEvent(new CustomEvent("mbti-settings-change", { detail: { ttsRate: clamped } }));
}

export const TTS_RATE_BOUNDS = { min: TTS_RATE_MIN, max: TTS_RATE_MAX, default: TTS_RATE_DEFAULT };
