/**
 * 音效系統 — 用 Pixabay CC0 真實音效檔（HTML5 Audio）
 *
 * 短音效 SFX (10 種，pool 模式，連點不互相打斷):
 *   click pageTurn reveal unlock tap pop whoosh coin toggleOn toggleOff
 *
 * 背景音樂 BGM (8 track，自動 cross-fade):
 *   home    - Kawaii Friends (4.7MB) - 首頁可愛 future bass
 *   game    - Playful Kids Toys (2.9MB) - 遊戲輕快兒童感
 *   result  - The Fun Starts Here (3.5MB) - 結果開心慶祝感
 *   sport   - Sport Warm Up (2.5MB) - 校隊熱血上揚
 *   art     - Gentle Piano (3.2MB) - 藝術夢幻寧靜
 *   study   - Curious Mind (2.8MB) - 學術好奇探索
 *   friend  - Warm Ukulele (3.1MB) - 友誼溫暖
 *   service - 暫用 art-gentle-piano (公民關懷暫用藝術組柔和鋼琴, 未來可換)
 *
 * 切頁時 BgmController 呼叫 playBgm(trackId) → 自動 cross-fade 過渡
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

export type BgmTrackId = "home" | "game" | "result" | "sport" | "art" | "study" | "friend" | "service";

/**
 * Next.js 15 App Router + static export + GitHub Pages 子路徑用 (依 skill nextjs-app-router-basepath-runtime)
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

interface BgmTrack {
  file: string;
  volume: number;
  credit: string;
}

const BGM_TRACKS: Record<BgmTrackId, BgmTrack> = {
  home: {
    file: "home-kawaii-friends.mp3",
    volume: 0.3,
    credit: "Kawaii Friends by ckotty3 (Pixabay CC0)",
  },
  game: {
    file: "game-playful-kids.mp3",
    volume: 0.25,
    credit: "Playful - Kids Toys Vlog Music by fassounds (Pixabay CC0)",
  },
  result: {
    file: "result-fun-starts-here.mp3",
    volume: 0.28,
    credit: "The Fun Starts Here by mmaudio (Pixabay CC0)",
  },
  sport: {
    file: "sport-warm-up.mp3",
    volume: 0.25,
    credit: "Sport Warm Up Music by slrathna (Pixabay CC0)",
  },
  art: {
    file: "art-gentle-piano.mp3",
    volume: 0.3,
    credit: "Gentle - Peaceful Gentle Music by bombinsound (Pixabay CC0)",
  },
  study: {
    file: "study-curious-mind.mp3",
    volume: 0.28,
    credit: "Children Music Loop - Curious Mind by sonican (Pixabay CC0)",
  },
  friend: {
    file: "friend-warm-uke.mp3",
    volume: 0.3,
    credit: "Warm by the_mountain (Pixabay CC0)",
  },
  service: {
    // 服務組目前暫用藝術組的柔和鋼琴 — 跟「公民關懷」氣質契合
    // 未來可換成專屬曲目 (建議搜「peaceful community」「heartwarming choral」)
    file: "art-gentle-piano.mp3",
    volume: 0.28,
    credit: "Gentle - Peaceful Gentle Music by bombinsound (Pixabay CC0) — 服務組暫用",
  },
};

const STORAGE_KEY_MUTE = "mbti-sound-muted";
const STORAGE_KEY_BGM = "mbti-bgm-on";

function sfxSrc(kind: SoundKind): string {
  return `${BASE_PATH}/audio/sfx/${SFX_FILES[kind]}`;
}

function bgmSrc(id: BgmTrackId): string {
  return `${BASE_PATH}/audio/bgm/${BGM_TRACKS[id].file}`;
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
  return v === null ? true : v === "1";
}

export function setBgmOn(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_BGM, v ? "1" : "0");
  if (v && currentBgmId) playBgm(currentBgmId); // re-fire
  else if (!v) stopBgm();
}

// ─────────────────── 短音效 Pool ───────────────────

const sfxPool: Partial<Record<SoundKind, HTMLAudioElement[]>> = {};
const POOL_SIZE = 3;

function getSfxAudio(kind: SoundKind): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let pool = sfxPool[kind];
  if (!pool) {
    pool = [];
    sfxPool[kind] = pool;
  }
  for (const a of pool) {
    if (a.paused || a.ended) {
      a.currentTime = 0;
      return a;
    }
  }
  if (pool.length < POOL_SIZE) {
    const a = new Audio(sfxSrc(kind));
    a.preload = "auto";
    pool.push(a);
    return a;
  }
  const a = pool[0];
  a.currentTime = 0;
  return a;
}

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

export function unlock() {
  if (typeof window === "undefined") return;
  preloadAll();
}

export function playSound(kind: SoundKind) {
  if (typeof window === "undefined") return;
  if (isMuted()) return;
  const a = getSfxAudio(kind);
  if (!a) return;
  a.volume = SFX_VOLUMES[kind] ?? 0.6;
  a.play().catch(() => {});
}

// ─────────────────── 多 Track BGM ───────────────────

let currentBgmId: BgmTrackId | null = null;
let currentBgmAudio: HTMLAudioElement | null = null;

function fadeIn(audio: HTMLAudioElement, target: number, durationMs = 1600) {
  const steps = 20;
  const stepMs = durationMs / steps;
  let i = 0;
  audio.volume = 0;
  const iv = setInterval(() => {
    // 若 audio 已被其他 track 取代，停止這個 fade
    if (audio !== currentBgmAudio) {
      clearInterval(iv);
      return;
    }
    i++;
    audio.volume = Math.min(target, (i / steps) * target);
    if (i >= steps) clearInterval(iv);
  }, stepMs);
}

function fadeOut(audio: HTMLAudioElement, onDone: () => void, durationMs = 900) {
  const start = audio.volume;
  const steps = 15;
  const stepMs = durationMs / steps;
  let i = 0;
  const iv = setInterval(() => {
    i++;
    audio.volume = Math.max(0, start * (1 - i / steps));
    if (i >= steps) {
      clearInterval(iv);
      onDone();
    }
  }, stepMs);
}

/**
 * 切換到指定 BGM track。若已是當前 track 就不動。
 * 切換時自動 cross-fade（舊的淡出、新的淡入）。
 */
export function playBgm(trackId: BgmTrackId) {
  if (typeof window === "undefined") return;
  if (!isBgmOn() || isMuted()) {
    // 即使不能播，記住目標 track（之後使用者開啟 BGM 時用）
    currentBgmId = trackId;
    return;
  }
  // 已是同一 track 且在播 → no-op
  if (currentBgmId === trackId && currentBgmAudio && !currentBgmAudio.paused) {
    return;
  }

  const oldAudio = currentBgmAudio;
  currentBgmId = trackId;

  const track = BGM_TRACKS[trackId];
  const newAudio = new Audio(bgmSrc(trackId));
  newAudio.loop = true;
  newAudio.preload = "auto";
  newAudio.volume = 0;
  currentBgmAudio = newAudio;

  newAudio
    .play()
    .then(() => {
      fadeIn(newAudio, track.volume, 1600);
    })
    .catch(() => {
      // autoplay blocked — 復原狀態
      if (currentBgmAudio === newAudio) {
        currentBgmAudio = oldAudio;
      }
    });

  // 淡出舊 track
  if (oldAudio && oldAudio !== newAudio) {
    fadeOut(oldAudio, () => {
      try { oldAudio.pause(); } catch {}
    }, 900);
  }
}

/** 完全停止 BGM */
export function stopBgm() {
  if (!currentBgmAudio) return;
  const audio = currentBgmAudio;
  currentBgmAudio = null;
  // currentBgmId 不清空 — 之後重開 BGM 還可以回到同一 track
  fadeOut(audio, () => {
    try { audio.pause(); } catch {}
  }, 800);
}

/** 向後相容：呼叫者沒指定 track 時預設 home */
export function startBgm() {
  playBgm(currentBgmId ?? "home");
}

/** 取得當前 track 的作者署名（給 footer / about 用） */
export function getBgmCredit(trackId: BgmTrackId): string {
  return BGM_TRACKS[trackId].credit;
}
