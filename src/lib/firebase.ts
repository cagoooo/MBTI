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
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  signOut as fbSignOut,
  linkWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
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
let authReadyPromise: Promise<void> | null = null;

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
 * 確保有登入 (anonymous fallback)。
 * 同一個瀏覽器穩定拿到同一個 uid (localStorage 持久化)。
 * 升級到 Google 帳號後 uid 不變 (用 linkWithPopup)，舊資料無痛保留。
 */
function waitAuthReady(authInstance: Auth): Promise<void> {
  if (authReadyPromise) return authReadyPromise;

  if (authInstance.currentUser) {
    authReadyPromise = Promise.resolve();
    return authReadyPromise;
  }

  authReadyPromise = new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(authInstance, () => {
      unsub();
      resolve();
    });
  });
  return authReadyPromise;
}

export async function ensureSignedIn(): Promise<string | null> {
  const init = ensureInit();
  if (!init) return null;

  // 等待 Auth 狀態初始化完成，避免舊有 session 被覆蓋
  await waitAuthReady(init.auth);

  if (init.auth.currentUser) return init.auth.currentUser.uid;
  try {
    const cred = await signInAnonymously(init.auth);
    return cred.user.uid;
  } catch (e) {
    console.warn("[firebase] anon sign-in failed", e);
    return null;
  }
}

/**
 * 訂閱當前 auth 狀態 (拿 user 物件含 displayName / photoURL / isAnonymous)。
 * 回傳 unsubscribe。
 */
export function subscribeAuth(cb: (user: User | null) => void): () => void {
  const init = ensureInit();
  if (!init) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(init.auth, cb);
}

/** 拿當前 user 物件 (沒登入回 null) */
export function getCurrentUser(): User | null {
  const init = ensureInit();
  if (!init) return null;
  return init.auth.currentUser;
}

/**
 * Google OAuth 登入 (跨裝置同步)。
 * 如果已經是 anonymous user，會用 linkWithPopup 升級，**保留同個 uid**，
 * 所有 classHistory / 房間擁有權無痛繼承。
 * 如果 anonymous link 失敗 (例如此 Google 帳號已綁過別的 uid)，
 * fall back 用 signInWithPopup (會切換到 Google 那邊的既有 uid)。
 */
export async function signInWithGoogle(): Promise<
  { ok: true; uid: string; user: User; upgraded: boolean } | { ok: false; error: string }
> {
  const init = ensureInit();
  if (!init) return { ok: false, error: "Firebase 未設定" };
  const provider = new GoogleAuthProvider();
  // 提示帳號選擇器，方便老師選自己的學校 google 帳號
  provider.setCustomParameters({ prompt: "select_account" });

  const current = init.auth.currentUser;
  // anonymous → upgrade 路徑
  if (current && current.isAnonymous) {
    try {
      const cred = await linkWithPopup(current, provider);
      return { ok: true, uid: cred.user.uid, user: cred.user, upgraded: true };
    } catch (e) {
      const err = e as { code?: string; message?: string };
      // 這個 Google 帳號已綁過別的 uid → 提取 credential 進行登入，避免重複彈窗
      if (err.code === "auth/credential-already-in-use" || err.code === "auth/email-already-in-use") {
        try {
          const credential = GoogleAuthProvider.credentialFromError(e as any);
          if (credential) {
            const cred = await signInWithCredential(init.auth, credential);
            return { ok: true, uid: cred.user.uid, user: cred.user, upgraded: false };
          }
          // 若無法提取 credential，才 fallback 到原本的 signInWithPopup
          const cred = await signInWithPopup(init.auth, provider);
          return { ok: true, uid: cred.user.uid, user: cred.user, upgraded: false };
        } catch (e2) {
          return { ok: false, error: (e2 as Error).message };
        }
      }
      return { ok: false, error: err.message ?? "Google 登入失敗" };
    }
  }

  // 沒有 anonymous current → 直接 popup 登入
  try {
    const cred = await signInWithPopup(init.auth, provider);
    return { ok: true, uid: cred.user.uid, user: cred.user, upgraded: false };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** 登出 (回到「沒有 user」狀態；下次 ensureSignedIn 會再生一個新的 anonymous uid) */
export async function signOut(): Promise<void> {
  const init = ensureInit();
  if (!init) return;
  await fbSignOut(init.auth);
}
