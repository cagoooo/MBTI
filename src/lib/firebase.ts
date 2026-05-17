/**
 * Firebase 初始化（mbti-classroom-smes）
 *
 * 用於「全班即時同步玩」功能（#41-42）。
 * 純 client SDK，所有讀寫透過 RTDB Security Rules 控制。
 *
 * Web API key 是公開設計（依 skill `gcp-api-key-secure-create` 對 Firebase Web key 的說明），
 * 透過 GitHub Actions 的 NEXT_PUBLIC_FIREBASE_* env 在 build 時 inline 進 client bundle。
 * 安全靠 Security Rules + API key referrer 限制。
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

function ensureInit(): { app: FirebaseApp; auth: Auth; db: Database } | null {
  if (typeof window === "undefined") return null;
  if (!config.apiKey || !config.databaseURL) {
    // build 時沒設 env，回 null 讓上層 fall back
    return null;
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(config);
    auth = getAuth(app);
    db = getDatabase(app);
  }
  return { app: app!, auth: auth!, db: db! };
}

export function isFirebaseAvailable(): boolean {
  return !!ensureInit();
}

export function getDb(): Database | null {
  return ensureInit()?.db ?? null;
}

export function getAuthInstance(): Auth | null {
  return ensureInit()?.auth ?? null;
}

/**
 * 確保有匿名登入。同一個瀏覽器會穩定拿到同一個 uid（localStorage 持久化）。
 * 老師端 / 學生端都用同樣機制 — 角色靠房間 meta 區分。
 */
export async function ensureSignedIn(): Promise<string | null> {
  const init = ensureInit();
  if (!init) return null;
  if (init.auth.currentUser) return init.auth.currentUser.uid;
  try {
    const cred = await signInAnonymously(init.auth);
    return cred.user.uid;
  } catch (e) {
    console.warn("[firebase] anon sign-in failed", e);
    return null;
  }
}
