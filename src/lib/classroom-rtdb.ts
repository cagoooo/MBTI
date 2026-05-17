/**
 * Classroom RTDB API 層
 *
 * 「全班即時同步玩」(#41-42 Phase 1 MVP) 的資料層。
 *
 * 資料結構：
 *   rooms/{roomCode}/
 *     meta/         { teacherUid, teacherName, passwordHash, createdAt, isActive, scenarioVersion }
 *     students/{uid}/  { name, avatar, joinedAt, currentScene, currentBranch, score, lastSeen, finalType }
 *     teacherControl/  { pinnedScene, pinReason, broadcast }
 */

import {
  get,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
  onDisconnect,
  type Unsubscribe,
} from "firebase/database";
import { ensureSignedIn, getDb } from "./firebase";
import type { Scores } from "./types";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 I,O,0,1

export function generateRoomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

/**
 * 用 SubtleCrypto SHA-256 做密碼雜湊
 * （不用儲存明文密碼，雖然這只是房間防呆不是高安全性需求）
 */
export async function hashPassword(plain: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return `weak:${plain}`; // fallback (SSR)
  }
  const enc = new TextEncoder().encode(plain);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─────────────────── 老師端 ───────────────────

/** 房間模式：mbti 校園 RPG / sel 逆境特別篇 */
export type RoomMode = "mbti" | "sel";

export interface RoomMeta {
  teacherUid: string;
  teacherName: string;
  passwordHash: string;
  createdAt: number;
  isActive: boolean;
  scenarioVersion: string;
  /** 房間模式 (v3.16 加；舊房間沒此欄位視為 mbti 向後相容) */
  mode?: RoomMode;
}

export interface CreateRoomOptions {
  teacherName: string;
  password: string;
  scenarioVersion?: string;
  mode?: RoomMode;
}

/**
 * 老師建立房間。回傳房號 + 老師 uid。
 * 若房號已存在會自動重試。
 */
export async function createRoom(opts: CreateRoomOptions): Promise<{
  roomCode: string;
  teacherUid: string;
} | null> {
  const db = getDb();
  if (!db) return null;
  const teacherUid = await ensureSignedIn();
  if (!teacherUid) return null;

  const passwordHash = await hashPassword(opts.password);
  const meta: RoomMeta = {
    teacherUid,
    teacherName: opts.teacherName.slice(0, 30),
    passwordHash,
    createdAt: Date.now(),
    isActive: true,
    scenarioVersion: opts.scenarioVersion ?? "1.0",
    mode: opts.mode ?? "mbti",
  };

  // 嘗試 5 次避免碰撞
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode(6);
    const metaRef = ref(db, `rooms/${code}/meta`);
    const snapshot = await get(metaRef);
    if (snapshot.exists()) continue;
    await set(metaRef, meta);
    return { roomCode: code, teacherUid };
  }
  return null;
}

/** 老師端：用密碼驗證重新進入既有房間（重新整理後） */
export async function reauthorizeTeacher(roomCode: string, password: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const snap = await get(ref(db, `rooms/${roomCode}/meta`));
  if (!snap.exists()) return false;
  const meta = snap.val() as RoomMeta;
  const hash = await hashPassword(password);
  return hash === meta.passwordHash;
}

/** 房間是否存在 + 是否 active */
export async function getRoomMeta(roomCode: string): Promise<RoomMeta | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await get(ref(db, `rooms/${roomCode}/meta`));
  if (!snap.exists()) return null;
  return snap.val() as RoomMeta;
}

/** 訂閱整個房間（學生清單變動、老師控制變動） */
export interface RoomSnapshot {
  meta?: RoomMeta;
  students?: Record<string, StudentEntry>;
  teacherControl?: TeacherControl;
}

export function subscribeRoom(
  roomCode: string,
  callback: (snap: RoomSnapshot) => void,
): Unsubscribe {
  const db = getDb();
  if (!db) return () => {};
  const roomRef = ref(db, `rooms/${roomCode}`);
  return onValue(roomRef, (snap) => {
    callback((snap.val() as RoomSnapshot) ?? {});
  });
}

/** 老師 pin 某場景，所有學生會被強制停在這 */
export async function pinScene(
  roomCode: string,
  pinnedScene: string | null,
  reason = "",
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}/teacherControl`), {
    pinnedScene,
    pinReason: reason.slice(0, 100),
  });
}

/** 老師結束會議 (標記 isActive=false，學生端會顯示「老師結束會議」) */
export async function endRoom(roomCode: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  // 結束會議時順手把這次活動 snapshot 存進 history (給 B1 班級歷史用)
  try {
    await saveSessionToHistory(roomCode);
  } catch {
    // 失敗不阻塞 endRoom
  }
  await update(ref(db, `rooms/${roomCode}/meta`), { isActive: false });
}

// ─────────────────── 班級活動歷史 (B1) ───────────────────

export interface SessionSnapshot {
  /** 活動結束時間 */
  endedAt: number;
  /** 開始時間 (從 meta.createdAt) */
  startedAt: number;
  /** 房號 (給回顧時可以看是哪場) */
  roomCode: string;
  /** 房間模式 (mbti / sel)，舊資料沒此欄位視為 mbti */
  mode?: RoomMode;
  /** 老師取名 (用來顯示「三年五班期初活動」之類的) */
  sessionLabel?: string;
  /** 完成人數 (有 finalType 的) */
  completedCount: number;
  /** 總參與人數 (含中途離場) */
  totalCount: number;
  /** 16 型分布 {INTJ: 3, INTP: 1, ...} */
  typeDistribution: Record<string, number>;
  /** 4 軸偏好統計 (誰 E 誰 I 之類) */
  axisCount: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  /** 個別學生簡略結果 (姓名 + 型) — 給歷史頁面點開展開看 */
  students: Array<{ name: string; finalType: string }>;
  // SEL 房間額外資料
  /** SEL 4 風格分布 */
  selStyleDistribution?: Record<string, number>;
  /** SEL 學生名單 (姓名 + 風格) */
  selStudents?: Array<{ name: string; selStyle: string }>;
}

/**
 * 結束會議時把這場活動 snapshot 寫入 classHistory
 * Path: classHistory/{teacherUid}/{sessionId}
 * sessionId = `${createdAt}-${roomCode}` 確保排序與唯一
 */
export async function saveSessionToHistory(roomCode: string, sessionLabel?: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  const roomSnap = await get(ref(db, `rooms/${roomCode}`));
  if (!roomSnap.exists()) return;
  const room = roomSnap.val() as RoomSnapshot;
  if (!room.meta) return;

  const students = room.students ?? {};
  const mode: RoomMode = room.meta.mode ?? "mbti";

  // 完成的判斷依 mode 而定
  const completedStudents = Object.values(students).filter((s) =>
    mode === "sel" ? !!s.selStyle : !!s.finalType,
  );

  // 統計 16 型分布 (僅 mbti mode 才有)
  const typeDistribution: Record<string, number> = {};
  const axisCount = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  if (mode === "mbti") {
    for (const s of completedStudents) {
      const t = s.finalType!;
      typeDistribution[t] = (typeDistribution[t] ?? 0) + 1;
      if (t[0] === "E" || t[0] === "I") axisCount[t[0] as "E" | "I"]++;
      if (t[1] === "S" || t[1] === "N") axisCount[t[1] as "S" | "N"]++;
      if (t[2] === "T" || t[2] === "F") axisCount[t[2] as "T" | "F"]++;
      if (t[3] === "J" || t[3] === "P") axisCount[t[3] as "J" | "P"]++;
    }
  }

  // 統計 SEL 4 風格分布 (僅 sel mode 才有)
  const selStyleDistribution: Record<string, number> = {};
  const selStudents: Array<{ name: string; selStyle: string }> = [];
  if (mode === "sel") {
    for (const s of completedStudents) {
      const st = s.selStyle!;
      selStyleDistribution[st] = (selStyleDistribution[st] ?? 0) + 1;
      selStudents.push({ name: s.name, selStyle: st });
    }
  }

  const dateLabel = new Date(room.meta.createdAt).toLocaleDateString("zh-TW");
  const modeLabel = mode === "sel" ? "SEL 情緒探索" : "MBTI 校園奇遇記";
  const snapshot: SessionSnapshot = {
    endedAt: Date.now(),
    startedAt: room.meta.createdAt,
    roomCode,
    mode,
    sessionLabel: sessionLabel ?? `${modeLabel} ${dateLabel}`,
    completedCount: completedStudents.length,
    totalCount: Object.keys(students).length,
    typeDistribution,
    axisCount,
    students:
      mode === "mbti"
        ? completedStudents.map((s) => ({ name: s.name, finalType: s.finalType ?? "" }))
        : [],
    ...(mode === "sel" && { selStyleDistribution, selStudents }),
  };

  const sessionId = `${room.meta.createdAt}-${roomCode}`;
  const path = `classHistory/${room.meta.teacherUid}/${sessionId}`;
  await set(ref(db, path), snapshot);
}

/** 老師端：列出自己的歷史活動 (依時間倒序) */
export async function listTeacherHistory(teacherUid: string): Promise<
  Array<{ sessionId: string; snapshot: SessionSnapshot }>
> {
  const db = getDb();
  if (!db) return [];
  const snap = await get(ref(db, `classHistory/${teacherUid}`));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, SessionSnapshot>;
  return Object.entries(all)
    .map(([sessionId, snapshot]) => ({ sessionId, snapshot }))
    .sort((a, b) => b.snapshot.endedAt - a.snapshot.endedAt);
}

/** 訂閱歷史活動 (即時更新) */
export function subscribeTeacherHistory(
  teacherUid: string,
  callback: (items: Array<{ sessionId: string; snapshot: SessionSnapshot }>) => void,
): Unsubscribe {
  const db = getDb();
  if (!db) return () => {};
  return onValue(ref(db, `classHistory/${teacherUid}`), (snap) => {
    const all = (snap.val() as Record<string, SessionSnapshot> | null) ?? {};
    const items = Object.entries(all)
      .map(([sessionId, snapshot]) => ({ sessionId, snapshot }))
      .sort((a, b) => b.snapshot.endedAt - a.snapshot.endedAt);
    callback(items);
  });
}

/** 老師端：刪除某筆歷史 (誤觸 / 測試誤建) */
export async function deleteSessionHistory(teacherUid: string, sessionId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await remove(ref(db, `classHistory/${teacherUid}/${sessionId}`));
}

// ─────────────────── 學生端 ───────────────────

export interface StudentEntry {
  name: string;
  avatar?: string;
  joinedAt: number;
  currentScene?: string;
  currentBranch?: string;
  score?: Scores;
  lastSeen?: number;
  finalType?: string;
  lastChoiceIndex?: number;
  /** 在 pinned scene 暫時投票的選項 index (老師 unpin 後會清掉) */
  votingChoice?: number | null;
  /** 對應 votingChoice 是哪個場景的投票 (避免上一場景的投票誤套到當前場景) */
  votingScene?: string;
  // SEL 房間專用 (O2)
  /** 當前 SEL 場景 index (0-5) */
  selSceneIdx?: number;
  /** SEL 4 軸累積分數 */
  selScores?: { express: number; solve: number; calm: number; connect: number };
  /** SEL 最終風格 (完成時填) */
  selStyle?: string;
}

export interface JoinRoomOptions {
  roomCode: string;
  name: string;
  avatar?: string;
}

/**
 * 學生加入房間。回傳學生 uid（同瀏覽器穩定）。
 * 若房間不存在或 isActive=false，回 null + reason。
 */
export async function joinRoom(opts: JoinRoomOptions): Promise<{
  studentUid: string;
  roomCode: string;
} | { error: string }> {
  const db = getDb();
  if (!db) return { error: "Firebase 未設定" };

  const meta = await getRoomMeta(opts.roomCode);
  if (!meta) return { error: "找不到這個房間，請檢查房號" };
  if (!meta.isActive) return { error: "這個房間已經結束了" };

  const studentUid = await ensureSignedIn();
  if (!studentUid) return { error: "登入失敗，請重新整理試試" };

  const entry: StudentEntry = {
    name: opts.name.slice(0, 20),
    avatar: opts.avatar?.slice(0, 6) ?? "🧑",
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  const studentRef = ref(db, `rooms/${opts.roomCode}/students/${studentUid}`);
  await set(studentRef, entry);

  // disconnect 時自動清掉 lastSeen 標記 (presence)
  onDisconnect(ref(db, `rooms/${opts.roomCode}/students/${studentUid}/lastSeen`)).set(null);

  return { studentUid, roomCode: opts.roomCode };
}

/** 學生更新當前場景 + 分數 (每次選完選項呼叫) */
export async function updateStudentProgress(
  roomCode: string,
  studentUid: string,
  data: {
    currentScene: string;
    currentBranch: string;
    score: Scores;
    lastChoiceIndex?: number;
  },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const studentRef = ref(db, `rooms/${roomCode}/students/${studentUid}`);
  await update(studentRef, {
    ...data,
    lastSeen: Date.now(),
  });
}

/** 學生完成時填 final MBTI 類型 */
export async function setStudentFinalType(
  roomCode: string,
  studentUid: string,
  finalType: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}/students/${studentUid}`), {
    finalType,
    lastSeen: Date.now(),
  });
}

/** 學生離開房間（清掉自己） */
export async function leaveRoom(roomCode: string, studentUid: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await remove(ref(db, `rooms/${roomCode}/students/${studentUid}`));
}

// ─────────────────── SEL 房間專用 (O2) ───────────────────

/** SEL 學生進度上傳 (sceneIdx + 4 軸分數) */
export async function updateSelProgress(
  roomCode: string,
  studentUid: string,
  data: {
    currentSceneIdx: number;
    selScores: { express: number; solve: number; calm: number; connect: number };
  },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}/students/${studentUid}`), {
    selSceneIdx: data.currentSceneIdx,
    selScores: data.selScores,
    lastSeen: Date.now(),
  });
}

/** SEL 學生完成時填最終風格 */
export async function setStudentSelStyle(
  roomCode: string,
  studentUid: string,
  selStyle: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}/students/${studentUid}`), {
    selStyle,
    lastSeen: Date.now(),
  });
}

/** 學生在被 pin 的場景投票（不前進，老師 unpin 後自動套用） */
export async function setStudentVote(
  roomCode: string,
  studentUid: string,
  votingScene: string,
  votingChoice: number | null,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}/students/${studentUid}`), {
    votingChoice,
    votingScene,
    lastSeen: Date.now(),
  });
}

/** 老師 unpin 後清掉所有人的 votingChoice */
export async function clearAllVotes(
  roomCode: string,
  students: Record<string, StudentEntry>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const updates: Record<string, null> = {};
  for (const uid of Object.keys(students)) {
    updates[`rooms/${roomCode}/students/${uid}/votingChoice`] = null;
    updates[`rooms/${roomCode}/students/${uid}/votingScene`] = null;
  }
  await update(ref(db), updates);
}

// ─────────────────── 工具 ───────────────────

export interface TeacherControl {
  pinnedScene?: string | null;
  pinReason?: string;
  broadcast?: string;
}

/**
 * 統計工具：把學生清單轉成「場景 → 在場景的學生數」
 */
export function bucketStudentsByScene(students: Record<string, StudentEntry>): Map<string, StudentEntry[]> {
  const map = new Map<string, StudentEntry[]>();
  for (const s of Object.values(students)) {
    const key = s.finalType ? "__done__" : s.currentScene ?? "__waiting__";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}
