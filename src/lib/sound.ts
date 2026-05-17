/**
 * 音效系統 — 用 Web Audio API 程序生成所有音效
 * 不依賴外部 mp3 / wav 檔案，避免版權與載入問題
 *
 * 音效類型:
 *   click    — 選項點擊「叮」
 *   pageTurn — 場景翻頁的書頁聲（白噪音 + 低通濾波）
 *   reveal   — 結果揭曉煙火（多音上升 + 噪音爆）
 *   unlock   — 徽章解鎖的水晶聲
 *   bgm      — 首頁柔和環境音樂 (持續播放)
 */

/**
 * 音效類型清單（給 SoundButton / SoundLink 用）：
 *
 * 場景音 (遊戲故事)
 *   click      - 選項按鈕「叮」(主動作、選擇)
 *   pageTurn   - 場景翻頁書頁聲
 *   reveal     - 結果揭曉煙火樂
 *   unlock     - 徽章解鎖水晶聲
 *
 * UI 按鈕音 (依按鈕重要度區分)
 *   tap        - 輕點：小巧、用於次要按鈕、回主頁、tab 切換
 *   pop        - Q 彈：用於 modal 開啟、複製、新增動作
 *   whoosh     - 風聲：page navigation 過場
 *   coin       - 金幣：完成、確認、成就感的動作
 *   toggleOn   - 開啟：低→高 兩音上升
 *   toggleOff  - 關閉：高→低 兩音下降
 */
type SoundKind =
  | "click"
  | "pageTurn"
  | "reveal"
  | "unlock"
  | "tap"
  | "pop"
  | "whoosh"
  | "coin"
  | "toggleOn"
  | "toggleOff";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// 背景音樂用 HTML5 Audio 播放真實 mp3 (Pixabay CC0)
let bgmAudio: HTMLAudioElement | null = null;
let bgmStarted = false;

const STORAGE_KEY_MUTE = "mbti-sound-muted";
const STORAGE_KEY_BGM = "mbti-bgm-on";

/** BGM 檔案路徑
 *
 * 注意：Next.js 15 App Router + static export 模式下，`window.__NEXT_DATA__` 不存在（那是舊 Pages Router）。
 * 必須用 build time inline 的 `process.env.NEXT_PUBLIC_BASE_PATH`，這個會被 Webpack 直接替換成字串常數。
 * 在 GitHub Pages workflow 內，這個 env 是從 actions/configure-pages 的 base_path 出來，值會是 "/MBTI"。
 * Dev 環境 (npm run dev) 該值是 ""，所以 `/audio/...` 直接走 localhost root。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function bgmSrc(): string {
  return `${BASE_PATH}/audio/bgm-kawaii-friends.mp3`;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = isMuted() ? 0 : 0.55;
  masterGain.connect(ctx.destination);
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_MUTE) === "1";
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MUTE, v ? "1" : "0");
  if (masterGain && ctx) masterGain.gain.setTargetAtTime(v ? 0 : 0.55, ctx.currentTime, 0.02);
}

export function isBgmOn(): boolean {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem(STORAGE_KEY_BGM);
  return v === null ? true : v === "1"; // 預設開
}

export function setBgmOn(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_BGM, v ? "1" : "0");
  if (v) startBgm();
  else stopBgm();
}

/** 觸發任何音效前要先呼叫 (因為 autoplay policy)，會在使用者第一次互動時自動 unlock */
export function unlock() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
}

/** 短促音效 */
export function playSound(kind: SoundKind) {
  if (isMuted()) return;
  const c = ensureCtx();
  if (!c || !masterGain) return;
  if (c.state === "suspended") c.resume().catch(() => {});

  const now = c.currentTime;
  switch (kind) {
    case "click": {
      // 高音三角波短脈衝
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.06);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.25, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
      break;
    }
    case "pageTurn": {
      // 白噪音 + 低通濾波 + 短包絡
      const dur = 0.28;
      const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      noise.connect(filter).connect(g).connect(masterGain);
      noise.start(now);
      noise.stop(now + dur);
      break;
    }
    case "reveal": {
      // 上升和弦琶音 + 短噪音「煙火」
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C
      notes.forEach((freq, i) => {
        const t = now + i * 0.08;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(g).connect(masterGain!);
        osc.start(t);
        osc.stop(t + 0.55);
      });
      // 煙火噪音爆
      const burstAt = now + 0.45;
      const dur = 0.35;
      const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 800;
      const g = c.createGain();
      g.gain.setValueAtTime(0, burstAt);
      g.gain.linearRampToValueAtTime(0.18, burstAt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, burstAt + dur);
      noise.connect(filter).connect(g).connect(masterGain);
      noise.start(burstAt);
      noise.stop(burstAt + dur);
      break;
    }
    case "unlock": {
      // 水晶聲：三個泛音同時，短促
      const baseFreqs = [880, 1320, 1760];
      baseFreqs.forEach((freq) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.connect(g).connect(masterGain!);
        osc.start(now);
        osc.stop(now + 0.65);
      });
      break;
    }
    case "tap": {
      // 輕點：高頻 sine 短脈衝，小巧不擾人
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.04);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    }
    case "pop": {
      // Q 彈：sine sweep up，泡泡感
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.2, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case "whoosh": {
      // 風聲：白噪音 + 帶通濾波 sweep
      const dur = 0.22;
      const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.15, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      noise.connect(filter).connect(g).connect(masterGain);
      noise.start(now);
      noise.stop(now + dur);
      break;
    }
    case "coin": {
      // 金幣聲：兩個高音上升 (E5 → G5)，明顯成就感
      const freqs = [659.25, 783.99]; // E5, G5
      freqs.forEach((freq, i) => {
        const t = now + i * 0.08;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.1, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(g).connect(masterGain!);
        osc.start(t);
        osc.stop(t + 0.2);
      });
      break;
    }
    case "toggleOn": {
      // 開啟：兩音上升 (C5 → E5)
      const freqs = [523.25, 659.25];
      freqs.forEach((freq, i) => {
        const t = now + i * 0.05;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        osc.connect(g).connect(masterGain!);
        osc.start(t);
        osc.stop(t + 0.15);
      });
      break;
    }
    case "toggleOff": {
      // 關閉：兩音下降 (E5 → C5)
      const freqs = [659.25, 523.25];
      freqs.forEach((freq, i) => {
        const t = now + i * 0.05;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        osc.connect(g).connect(masterGain!);
        osc.start(t);
        osc.stop(t + 0.15);
      });
      break;
    }
  }
}

/** 背景音樂：播放 Pixabay CC0 的「Kawaii Friends」(by ckotty3) */
export function startBgm() {
  if (typeof window === "undefined") return;
  if (!isBgmOn() || isMuted()) return;
  if (bgmStarted) return;
  bgmStarted = true;

  if (!bgmAudio) {
    bgmAudio = new Audio(bgmSrc());
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = 0; // 從 0 開始淡入
  }

  // 淡入到 0.35
  const TARGET = 0.35;
  bgmAudio.volume = 0;
  bgmAudio.play().then(() => {
    if (!bgmAudio) return;
    const steps = 20;
    let i = 0;
    const iv = setInterval(() => {
      if (!bgmAudio || !bgmStarted) {
        clearInterval(iv);
        return;
      }
      i++;
      bgmAudio.volume = Math.min(TARGET, (i / steps) * TARGET);
      if (i >= steps) clearInterval(iv);
    }, 100);
  }).catch(() => {
    // autoplay 被擋住，靜靜失敗 — 使用者下次互動會再 trigger
    bgmStarted = false;
  });
}

export function stopBgm() {
  if (!bgmStarted || !bgmAudio) return;
  bgmStarted = false;
  // 淡出後暫停
  const audio = bgmAudio;
  const start = audio.volume;
  const steps = 15;
  let i = 0;
  const iv = setInterval(() => {
    i++;
    audio.volume = Math.max(0, start * (1 - i / steps));
    if (i >= steps) {
      clearInterval(iv);
      audio.pause();
    }
  }, 60);
}
