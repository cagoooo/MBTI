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
  u.rate = opts.rate ?? 1.0;
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
 * 快捷：把場景的多個段落串成一段唸（自動加標點停頓）
 * 場景結構：location / speaker / text[]
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
  // 用全形句號連接，TTS 會把它當段落停頓
  const full = segments.filter(Boolean).join("。");
  speak(full, { rate: 1.0, pitch: 1.08 });
}
