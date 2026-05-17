/**
 * 文字轉語音（TTS）— 用 Web Speech API（瀏覽器內建，免費、零延遲、不需 API key）
 *
 * 中文聲音選擇優先順序：
 *   1. Google 國語（台灣） → Chrome 內建最自然
 *   2. Microsoft 曉雨 / 雅婷 → Edge 內建台灣女聲
 *   3. 任何 zh-TW
 *   4. 任何 zh-* (大陸 / 香港)
 *   5. fallback 第一個 voice
 *
 * autoplay policy：speechSynthesis.speak() 在使用者第一次互動前會被無聲忽略。
 * 不需要特別 unlock — 一旦使用者點過按鈕就 OK。
 */

import { getTtsRate } from "./settings";

const STORAGE_KEY = "mbti-tts-on";

let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;
let speakingNow = false;

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isTtsOn(): boolean {
  if (typeof window === "undefined") return false;
  // 預設「關閉」— 避免初次進站就被嚇到
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function setTtsOn(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  if (!v) stop();
}

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const tests: Array<(v: SpeechSynthesisVoice) => boolean> = [
    (v) => v.lang === "zh-TW" && /Google/i.test(v.name),
    (v) => v.lang === "zh-TW" && /(Hsiao|Yating|Pei|曉|雅)/i.test(v.name),
    (v) => v.lang === "zh-TW",
    (v) => /zh[-_]Hant/i.test(v.lang),
    (v) => v.lang.startsWith("zh") && /Google/i.test(v.name),
    (v) => v.lang.startsWith("zh"),
  ];
  for (const test of tests) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0] ?? null;
}

/**
 * 初始化：等 voiceschanged event 後選定 voice。
 * 第一次互動時呼叫，後續 speak() 才有正確 voice。
 */
export function initTts(): Promise<void> {
  if (!isTtsAvailable()) return Promise.resolve();
  if (voicesLoaded) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const tryPick = () => {
      const v = pickBestVoice();
      if (v) {
        selectedVoice = v;
        voicesLoaded = true;
        resolve();
        return true;
      }
      return false;
    };
    if (tryPick()) return;
    const handler = () => {
      if (tryPick()) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    window.speechSynthesis.onvoiceschanged = handler;
    // 1.5s timeout fallback (有些瀏覽器不觸發 onvoiceschanged)
    setTimeout(() => {
      if (!voicesLoaded) {
        voicesLoaded = true;
        selectedVoice = pickBestVoice();
        resolve();
      }
    }, 1500);
  });
}

export function getCurrentVoiceName(): string | null {
  return selectedVoice?.name ?? null;
}

interface SpeakOptions {
  /** 0.1 ~ 10，預設 1.0；國小學生建議 0.95 - 1.05 */
  rate?: number;
  /** 0 ~ 2，預設 1，提高一點更親切 */
  pitch?: number;
  /** 0 ~ 1，預設 1 */
  volume?: number;
}

/**
 * 唸出文字。若 TTS 關閉或瀏覽器不支援則 no-op。
 * 會自動 cancel 前一段未念完的 utterance。
 */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!isTtsAvailable() || !isTtsOn()) return;
  if (!text || !text.trim()) return;

  // 確保 voice 已選定
  if (!voicesLoaded) {
    void initTts().then(() => speak(text, opts));
    return;
  }

  // cancel 前一個 utterance（避免疊在一起）
  try {
    window.speechSynthesis.cancel();
  } catch {}

  const u = new SpeechSynthesisUtterance(text);
  if (selectedVoice) u.voice = selectedVoice;
  u.lang = selectedVoice?.lang ?? "zh-TW";
  // 使用者透過 SettingsPanel 設的 rate 是基準，opts.rate 可微調 (例：1.05 的話會乘上 base)
  u.rate = (opts.rate ?? 1.0) * (getTtsRate() / 1.0);
  u.pitch = opts.pitch ?? 1.08;
  u.volume = opts.volume ?? 1.0;

  speakingNow = true;
  u.onend = () => {
    speakingNow = false;
  };
  u.onerror = () => {
    speakingNow = false;
  };

  try {
    window.speechSynthesis.speak(u);
  } catch {
    speakingNow = false;
  }
}

/** 停止當前唸誦 */
export function stop(): void {
  if (!isTtsAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
  speakingNow = false;
}

export function isSpeaking(): boolean {
  if (!isTtsAvailable()) return false;
  return speakingNow || window.speechSynthesis.speaking;
}

/**
 * NPC 語音輪廓 — 每個角色用不同 pitch / rate 增加辨識度
 * pitch 越高越尖銳 (高音調)；rate 越大越快
 *
 * 設計原則：跟角色 MBTI 個性吻合
 *   E + F 系列 → 較快較高 (活潑熱情)
 *   I + T 系列 → 較慢較低 (沉穩思考)
 *   F (情感系) → 偏高 (溫柔親切)
 *   T (思考系) → 偏低 (冷靜理性)
 */
interface VoiceProfile {
  pitch: number;
  rate: number;
}

const NARRATOR: VoiceProfile = { pitch: 1.0, rate: 1.0 };

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  // 8 位主要 NPC (CampusIntro 角色)
  "小芸":   { pitch: 1.25, rate: 1.1 },   // ENFP 活潑可愛
  "阿哲":   { pitch: 0.88, rate: 0.95 },  // INTJ 慢條斯理沉穩
  "小傑":   { pitch: 1.05, rate: 1.2 },   // ESTP 急性子衝勁
  "雅雯":   { pitch: 1.18, rate: 0.92 },  // INFJ 溫柔輕語
  "宇航":   { pitch: 1.1,  rate: 0.95 },  // ISFP 安靜溫和
  "凱莉":   { pitch: 0.95, rate: 1.05 },  // ENTJ 沉穩有力
  "小宇":   { pitch: 1.0,  rate: 1.0 },   // INTP 平靜均速
  "婷婷":   { pitch: 1.15, rate: 1.05 },  // ESFJ 熱情溫暖

  // 老師 / 大人
  "林老師": { pitch: 1.05, rate: 0.95 },  // 班導，溫和帶笑
  "張教練": { pitch: 0.85, rate: 1.1 },   // 校隊教練，渾厚有力
  "陳老師": { pitch: 1.1,  rate: 0.92 },  // 美術老師，文藝柔和
  "王老師": { pitch: 0.95, rate: 0.98 },  // 自然老師，理性沉穩
  "校長":   { pitch: 0.85, rate: 0.9 },   // 慢且權威
  "美術陳老師": { pitch: 1.1, rate: 0.92 },
  "自然王老師": { pitch: 0.95, rate: 0.98 },

  // 場景中的其他角色 (短暫出現)
  "服務隊長":     { pitch: 1.05, rate: 1.05 },
  "司儀同學":     { pitch: 1.1,  rate: 1.1 },
  "高年級學長":   { pitch: 0.92, rate: 1.0 },
  "校刊主編學姊": { pitch: 1.12, rate: 1.0 },
  "驚慌的學弟":   { pitch: 1.3,  rate: 1.15 },  // 慌張高音快語
  "隊友小傑":     { pitch: 1.05, rate: 1.2 },
  "兩個好朋友":   { pitch: 1.15, rate: 1.05 },
  "同學小芸":     { pitch: 1.25, rate: 1.1 },

  // 旁白 / 主角 OS
  "你的內心":   NARRATOR,
  "你的肚子":   NARRATOR,
  "你":         NARRATOR,
};

/** 取得某個 speaker 的 voice profile (找不到就用旁白) */
export function getVoiceProfile(speaker?: string): VoiceProfile {
  if (!speaker) return NARRATOR;
  return VOICE_PROFILES[speaker] ?? NARRATOR;
}

/**
 * 快捷：把場景的多個段落串成一段唸（自動加標點停頓）
 * 場景結構：location / speaker / text[]
 * 自動套用對應 speaker 的 voice profile
 */
export function speakScene(parts: {
  location?: string;
  speaker?: string;
  text: string[];
}): void {
  const segments: string[] = [];
  if (parts.location) segments.push(parts.location);
  if (parts.speaker) segments.push(`${parts.speaker} 說：`);
  segments.push(...parts.text);
  const full = segments.filter(Boolean).join("。");

  // 用 speaker 對應的 profile，沒指定就 NARRATOR
  const profile = getVoiceProfile(parts.speaker);
  speak(full, { rate: profile.rate, pitch: profile.pitch });
}
