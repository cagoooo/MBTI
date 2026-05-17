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

export interface RoomMeta {
  teacherUid: string;
  teacherName: string;
  passwordHash: string;
  createdAt: number;
  isActive: boolean;
  scenarioVersion: string;
}

export interface CreateRoomOptions {
  teacherName: string;
  password: string;
  scenarioVersion?: string;
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
  await update(ref(db, `rooms/${roomCode}/meta`), { isActive: false });
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
