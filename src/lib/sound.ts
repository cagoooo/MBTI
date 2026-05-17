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

type SoundKind = "click" | "pageTurn" | "reveal" | "unlock";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// 背景音樂用 HTML5 Audio 播放真實 mp3 (Pixabay CC0)
let bgmAudio: HTMLAudioElement | null = null;
let bgmStarted = false;

const STORAGE_KEY_MUTE = "mbti-sound-muted";
const STORAGE_KEY_BGM = "mbti-bgm-on";

/** BGM 檔案路徑 (Next.js basePath 自動由 assetPrefix 處理) */
function bgmSrc(): string {
  const base = (typeof window !== "undefined" && (window as unknown as { __NEXT_DATA__?: { assetPrefix?: string } }).__NEXT_DATA__?.assetPrefix) || "";
  return `${base}/audio/bgm-kawaii-friends.mp3`;
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
