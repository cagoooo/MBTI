"use client";

import { useEffect, useState } from "react";
import {
  ensureSignedIn,
  isFirebaseAvailable,
  signInWithGoogle,
  signOut,
  subscribeAuth,
} from "@/lib/firebase";
import type { User } from "firebase/auth";
import { playSound } from "@/lib/sound";

/**
 * Google OAuth 登入按鈕 — 老師專用
 *
 * 三種狀態:
 *   1. 未登入 / 匿名 → 顯示「🔑 Google 登入」(coral 按鈕)
 *   2. Google 已登入 → 顯示照片 + 名字 + 下拉登出
 *   3. Firebase 未設定 → 完全不顯示 (gracefully hidden)
 *
 * 升級流程:
 *   anonymous user 按登入 → linkWithPopup → 升級成 Google user
 *   **uid 保持不變** → 所有 classHistory / 房間擁有權無縫繼承
 *
 * 變體:
 *   - compact: 用在 SiteNav (只顯示頭像或小按鈕)
 *   - full: 用在 /teacher/dashboard 大顆完整按鈕
 */
interface Props {
  variant?: "compact" | "full";
}

export default function TeacherLoginButton({ variant = "compact" }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAvailable(isFirebaseAvailable());
    if (!isFirebaseAvailable()) return;
    // 第一次 mount 順手 ensureSignedIn (確保至少有 anonymous user)
    void ensureSignedIn();
    return subscribeAuth(setUser);
  }, []);

  // 點外面關 menu
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  if (!available) return null;

  const isSignedInWithGoogle = user && !user.isAnonymous;

  async function handleLogin() {
    setBusy(true);
    setError(null);
    playSound("coin");
    const r = await signInWithGoogle();
    setBusy(false);
    if (!r.ok) {
      // 使用者關閉 popup 不算錯誤
      if (!r.error.toLowerCase().includes("popup")) {
        setError(r.error);
      }
      playSound("toggleOff");
      return;
    }
    if (r.upgraded) {
      // 升級成功：之前的匿名 uid 保留 → 所有 classHistory 跟著轉移
      alert("✨ 登入成功！你之前在這個瀏覽器建立的班級資料已自動綁定到你的 Google 帳號，現在可以跨裝置同步了。");
    } else {
      alert("✨ 登入成功！可在任何裝置打開網站登入這個 Google 帳號看你的班級資料。");
    }
  }

  async function handleLogout() {
    if (!confirm("確定登出？登出後再來會回到匿名狀態，看不到你的班級歷史（資料還在雲端，下次登入又會看到）")) {
      return;
    }
    playSound("toggleOff");
    setMenuOpen(false);
    await signOut();
  }

  // ─── Compact (SiteNav) variant ─────────────────────
  if (variant === "compact") {
    if (!isSignedInWithGoogle) {
      return (
        <button
          onClick={handleLogin}
          disabled={busy}
          className="tts-btn-secondary"
          style={{
            padding: "6px 14px",
            fontSize: 12,
            background: "#fff",
            cursor: busy ? "wait" : "pointer",
          }}
          title="用 Google 登入：跨裝置同步班級資料"
        >
          {busy ? "登入中..." : "🔑 老師登入"}
        </button>
      );
    }
    // Signed in with Google
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px 4px 4px",
            background: "var(--paper-warm)",
            border: "2px solid var(--ink)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
          title="你的 Google 帳號"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName ?? "user"}
              referrerPolicy="no-referrer"
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "1.5px solid var(--ink)",
              }}
            />
          ) : (
            <span style={{ fontSize: 18 }}>👤</span>
          )}
          <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName?.split(" ")[0] ?? "已登入"}
          </span>
          <span style={{ fontSize: 10, color: "var(--muted)" }}>▾</span>
        </button>
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              minWidth: 240,
              background: "#fff",
              border: "2px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
              zIndex: 100,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px solid var(--ink)",
                  }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>👤</span>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.displayName ?? "Google 使用者"}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 200,
                  }}
                >
                  {user.email ?? user.uid.slice(0, 8)}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginBottom: 10,
                padding: "8px 10px",
                background: "var(--paper-warm)",
                borderLeft: "3px solid var(--mint)",
                lineHeight: 1.5,
              }}
            >
              ✓ 跨裝置同步啟用中。任何裝置登入此帳號都能看到你的班級歷史 + 設定。
            </div>
            <button
              onClick={handleLogout}
              className="tts-btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              🚪 登出
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Full (Dashboard) variant ─────────────────────
  if (!isSignedInWithGoogle) {
    return (
      <div
        style={{
          background: "#fff",
          border: "2.5px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--ink)",
          padding: "20px 24px",
          marginBottom: 24,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -14,
            left: 18,
            background: "var(--sunny)",
            color: "#5a4500",
            padding: "4px 14px",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: 4,
          }}
        >
          🔑 SIGN · IN
        </div>
        <h3 className="f-serif" style={{ fontWeight: 900, fontSize: 22, margin: "8px 0 6px" }}>
          想跨裝置看你的班級資料嗎？
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, margin: "0 0 14px" }}>
          現在你在<b>匿名模式</b>下使用 — 班級歷史 / 房間擁有權都只綁在這台瀏覽器。
          <br />
          用<b style={{ color: "var(--coral)" }}>學校 Google 帳號</b>登入後，
          所有資料會自動同步到雲端，回家、教室、行動裝置都看得到。
        </p>
        <button
          onClick={handleLogin}
          disabled={busy}
          className="btn-start"
          style={{
            padding: "14px 24px",
            fontSize: 16,
            justifyContent: "center",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          <GoogleIcon />
          <span>{busy ? "登入中..." : "用 Google 登入"}</span>
        </button>
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "#fde3ea",
              border: "2px solid var(--rose)",
              fontSize: 12,
              color: "#7a1a3a",
            }}
          >
            ⚠️ {error}
          </div>
        )}
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
          ✨ 你目前在這台瀏覽器建立的班級資料 (歷史 / 房間) 會在登入時<b>自動繼承</b>，不會遺失。
          <br />
          🔒 我們只用 Google 識別你是誰，不會讀取你的信件、Drive 或聯絡人。
        </p>
      </div>
    );
  }

  // Signed in (full variant)
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fff, var(--paper-warm))",
        border: "2.5px solid var(--mint)",
        boxShadow: "6px 6px 0 var(--mint)",
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      {user.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.photoURL}
          alt=""
          referrerPolicy="no-referrer"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "2.5px solid var(--ink)",
            boxShadow: "2px 2px 0 var(--ink)",
          }}
        />
      ) : (
        <span style={{ fontSize: 40 }}>👤</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{user.displayName ?? "Google 使用者"}</span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              background: "var(--mint)",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              letterSpacing: 1,
              fontWeight: 800,
            }}
          >
            ✓ 跨裝置同步中
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            marginTop: 2,
          }}
        >
          {user.email ?? user.uid.slice(0, 12)}
        </div>
      </div>
      <button onClick={handleLogout} className="tts-btn-secondary" style={{ flexShrink: 0 }}>
        🚪 登出
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ background: "#fff", borderRadius: 2, padding: 2 }}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
