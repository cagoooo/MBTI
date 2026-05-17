"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import { createRoom } from "@/lib/classroom-rtdb";
import { isFirebaseAvailable } from "@/lib/firebase";
import { playSound } from "@/lib/sound";

export default function NewRoomPage() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    if (teacherName.trim().length === 0) {
      setError("請輸入老師名字（給學生看的）");
      return;
    }
    if (password.length < 4) {
      setError("密碼至少 4 個字（之後重新整理頁面回到 dashboard 時要用）");
      return;
    }
    if (!isFirebaseAvailable()) {
      setError("Firebase 還沒設定好（NEXT_PUBLIC_FIREBASE_* env 未注入）。請聯絡管理員。");
      return;
    }
    setBusy(true);
    playSound("coin");
    try {
      const r = await createRoom({ teacherName: teacherName.trim(), password });
      if (!r) {
        setError("建立房間失敗，請稍後再試");
        setBusy(false);
        return;
      }
      // 把密碼存 sessionStorage 給 dashboard 用（重新整理會被 prompt 補輸入）
      sessionStorage.setItem(`mbti-teacher-${r.roomCode}`, password);
      router.push(`/teacher/room?code=${r.roomCode}`);
    } catch (e) {
      setError(`建立失敗：${e instanceof Error ? e.message : String(e)}`);
      setBusy(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <HomeToButton />
        </div>
        <header className="text-center mb-8">
          <p className="inline-block px-4 py-1.5 rounded-full bg-violet-100 border-2 border-violet-300 text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">
            👩‍🏫 老師專用
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            <span className="shimmer-text">建立班級房間</span>
          </h1>
          <p className="text-[var(--color-ink)]/70">
            建房後會拿到 6 位數房號 + QR code，給全班學生加入。
            <br />
            老師大螢幕即時看每位學生玩到哪。
          </p>
        </header>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">老師名字</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              maxLength={30}
              placeholder="例：阿凱老師"
              className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 focus:border-[var(--color-coral)] focus:outline-none"
              disabled={busy}
            />
            <p className="text-xs text-[var(--color-ink)]/50 mt-1">給學生在 dashboard 看的名字</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">房間密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={32}
              placeholder="4 個字以上"
              className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 focus:border-[var(--color-coral)] focus:outline-none"
              disabled={busy}
            />
            <p className="text-xs text-[var(--color-ink)]/50 mt-1">
              重新整理頁面時要用這個密碼回到 dashboard。學生不需要密碼，只要房號。
            </p>
          </div>
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 text-sm text-rose-800">
              ⚠️ {error}
            </div>
          )}
          <SoundButton
            sound="coin"
            onClick={handleCreate}
            disabled={busy}
            className="btn-3d w-full px-6 py-4 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90 disabled:opacity-50"
          >
            {busy ? "建立中..." : "🚀 建立房間"}
          </SoundButton>
        </div>

        <details className="mt-5 bg-[var(--color-cream)] rounded-2xl p-4 text-sm">
          <summary className="font-bold cursor-pointer">💡 怎麼用？</summary>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-[var(--color-ink)]/80">
            <li>建房後會看到 6 位數房號 + QR code</li>
            <li>把 QR code 投影到大螢幕（或寫房號在白板）</li>
            <li>學生掃 QR / 在電腦上 /join 輸入房號 + 自己名字</li>
            <li>大家開始玩，老師看儀表板進度</li>
            <li>關鍵場景按「📌 Pin」全班停下來討論</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
