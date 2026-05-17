/**
 * 音效系統 — 用 Pixabay CC0 真實音效檔（HTML5 Audio）
 *
 * 音效類型（10 種）:
 *   click      - Marimba Bloop 1 主動作叮聲
 *   tap        - Marimba Bloop 2 輕量按鈕
 *   pop        - Bubble Pop Q 彈感
 *   pageTurn   - Page Turn 翻書聲
 *   reveal     - Cute Level Up 3 結果揭曉
 *   unlock     - Cute Level Up 2 徽章解鎖
 *   coin       - UI Digital Coin Collect 完成 / 確認
 *   whoosh     - Cartoony Whoosh 過場
 *   toggleOn   - Menu Select Button 開啟
 *   toggleOff  - UI Button Cancel/Back 關閉
 *
 * 背景音樂:
 *   Pixabay CC0 "Kawaii Friends" by ckotty3
 */

export type SoundKind =
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

/**
 * Next.js 15 App Router + static export + GitHub Pages 子路徑部署用 (依 skill nextjs-app-router-basepath-runtime)
 * 必須是 process.env.NEXT_PUBLIC_BASE_PATH，build time 由 Webpack inline 進 client bundle
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SFX_FILES: Record<SoundKind, string> = {
  click: "click.mp3",
  tap: "tap.mp3",
  pop: "pop.mp3",
  pageTurn: "pageTurn.mp3",
  reveal: "reveal.mp3",
  unlock: "unlock.mp3",
  coin: "coin.mp3",
  whoosh: "whoosh.mp3",
  toggleOn: "toggleOn.mp3",
  toggleOff: "toggleOff.mp3",
};

/** 每個音效的基礎音量 (0~1)，避免大聲音效太擾人 */
const SFX_VOLUMES: Record<SoundKind, number> = {
  click: 0.65,
  tap: 0.55,
  pop: 0.7,
  pageTurn: 0.55,
  reveal: 0.6,
  unlock: 0.6,
  coin: 0.65,
  whoosh: 0.5,
  toggleOn: 0.55,
  toggleOff: 0.55,
};

const STORAGE_KEY_MUTE = "mbti-sound-muted";
const STORAGE_KEY_BGM = "mbti-bgm-on";

function bgmSrc(): string {
  return `${BASE_PATH}/audio/bgm-kawaii-friends.mp3`;
}

function sfxSrc(kind: SoundKind): string {
  return `${BASE_PATH}/audio/sfx/${SFX_FILES[kind]}`;
}

// ─────────────────── 設定持久化 ───────────────────

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_MUTE) === "1";
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MUTE, v ? "1" : "0");
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

// ─────────────────── 短音效 Pool ───────────────────

/**
 * 每種音效保留 3 個 Audio instance 形成 pool，連點時不會互相打斷。
 * 找到 idle 的就 reuse，全部 busy 才 reset 第一個。
 */
const sfxPool: Partial<Record<SoundKind, HTMLAudioElement[]>> = {};
const POOL_SIZE = 3;

function getSfxAudio(kind: SoundKind): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let pool = sfxPool[kind];
  if (!pool) {
    pool = [];
    sfxPool[kind] = pool;
  }
  // 找 idle instance
  for (const a of pool) {
    if (a.paused || a.ended) {
      a.currentTime = 0;
      return a;
    }
  }
  // 未滿則新建
  if (pool.length < POOL_SIZE) {
    const a = new Audio(sfxSrc(kind));
    a.preload = "auto";
    pool.push(a);
    return a;
  }
  // pool 滿，搶第一個
  const a = pool[0];
  a.currentTime = 0;
  return a;
}

/**
 * 預載入所有音效（在 unlock 時呼叫，提早讓瀏覽器 cache mp3）
 */
function preloadAll() {
  if (typeof window === "undefined") return;
  for (const kind of Object.keys(SFX_FILES) as SoundKind[]) {
    if (!sfxPool[kind]) {
      const a = new Audio(sfxSrc(kind));
      a.preload = "auto";
      sfxPool[kind] = [a];
    }
  }
}

/** 觸發任何音效前要先呼叫（autoplay policy unlock，會在使用者第一次互動時自動呼叫） */
export function unlock() {
  if (typeof window === "undefined") return;
  preloadAll();
}

/** 播放短音效 */
export function playSound(kind: SoundKind) {
  if (typeof window === "undefined") return;
  if (isMuted()) return;
  const a = getSfxAudio(kind);
  if (!a) return;
  a.volume = SFX_VOLUMES[kind] ?? 0.6;
  a.play().catch(() => {
    // autoplay 被擋 / 載入失敗 — 靜靜忽略
  });
}

// ─────────────────── 背景音樂 ───────────────────

let bgmAudio: HTMLAudioElement | null = null;
let bgmStarted = false;

/** 背景音樂：播放 Pixabay CC0 「Kawaii Friends」(by ckotty3) */
export function startBgm() {
  if (typeof window === "undefined") return;
  if (!isBgmOn() || isMuted()) return;
  if (bgmStarted) return;
  bgmStarted = true;

  if (!bgmAudio) {
    bgmAudio = new Audio(bgmSrc());
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = 0;
  }

  const TARGET = 0.3;
  bgmAudio.volume = 0;
  bgmAudio
    .play()
    .then(() => {
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
    })
    .catch(() => {
      // autoplay 被擋 — 靜靜失敗
      bgmStarted = false;
    });
}

export function stopBgm() {
  if (!bgmStarted || !bgmAudio) return;
  bgmStarted = false;
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
