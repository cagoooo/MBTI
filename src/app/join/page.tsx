"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import { getRoomMeta, joinRoom } from "@/lib/classroom-rtdb";
import { isFirebaseAvailable } from "@/lib/firebase";
import { playSound } from "@/lib/sound";

const AVATARS = ["🧑", "👧", "🧒", "👦", "🌸", "⚡", "🌙", "🎨", "📚", "🤝", "🏃", "🍰", "🦄", "🔬", "🎵", "🌟"];

function JoinPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 從 URL 拿 ?room=
  useEffect(() => {
    const r = params.get("room");
    if (r) setRoomCode(r.toUpperCase());
  }, [params]);

  async function handleJoin() {
    setError(null);
    const code = roomCode.trim().toUpperCase();
    if (code.length < 4) {
      setError("請輸入房號（老師會給你）");
      return;
    }
    if (name.trim().length === 0) {
      setError("請輸入你的名字（給老師看的）");
      return;
    }
    if (!isFirebaseAvailable()) {
      setError("還沒設定好班級模式（請聯絡老師）");
      return;
    }
    setBusy(true);
    playSound("coin");
    try {
      const r = await joinRoom({ roomCode: code, name: name.trim(), avatar });
      if ("error" in r) {
        setError(r.error);
        setBusy(false);
        return;
      }
      // 把 room / student uid 存 sessionStorage 給遊戲頁讀
      sessionStorage.setItem("mbti-class-session", JSON.stringify({
        roomCode: r.roomCode,
        studentUid: r.studentUid,
        joinedAt: Date.now(),
      }));
      // 依房間 mode 決定跳哪一頁 (O2)
      const meta = await getRoomMeta(code);
      const target = meta?.mode === "sel" ? "/sel" : "/game";
      router.push(`${target}?room=${r.roomCode}`);
    } catch (e) {
      setError(`加入失敗：${e instanceof Error ? e.message : String(e)}`);
      setBusy(false);
    }
  }

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <HomeToButton />
        </div>

        <header className="text-center mb-8">
          <p className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
            🎓 班級模式
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            <span className="shimmer-text">加入老師的房間</span>
          </h1>
          <p className="text-[var(--color-ink)]/70">
            輸入房號 + 自己的名字
            <br />
            全班一起玩，老師看大家進度
          </p>
        </header>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">房號</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="例：ABC123"
              className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 focus:border-[var(--color-coral)] focus:outline-none font-mono text-2xl tracking-widest text-center"
              disabled={busy}
              autoCapitalize="characters"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">你的名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="老師會看到，用真名或綽號都可以"
              className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 focus:border-[var(--color-coral)] focus:outline-none"
              disabled={busy}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">選一個 emoji 當你的小頭像</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setAvatar(a);
                    playSound("pop");
                  }}
                  className={`aspect-square rounded-xl text-2xl transition ${
                    avatar === a
                      ? "bg-[var(--color-coral)] scale-110 ring-2 ring-[var(--color-coral)]/40"
                      : "bg-[var(--color-cream)] hover:bg-[var(--color-coral)]/20"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 text-sm text-rose-800">
              ⚠️ {error}
            </div>
          )}
          <SoundButton
            sound="coin"
            onClick={handleJoin}
            disabled={busy}
            className="btn-3d w-full px-6 py-4 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90 disabled:opacity-50"
          >
            {busy ? "加入中..." : "🚀 加入並開始玩"}
          </SoundButton>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <JoinPageInner />
    </Suspense>
  );
}
