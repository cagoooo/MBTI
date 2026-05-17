"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import HomeToButton from "@/components/HomeToButton";
import SoundButton from "@/components/SoundButton";
import {
  endRoom,
  pinScene,
  reauthorizeTeacher,
  subscribeRoom,
  type RoomSnapshot,
  type StudentEntry,
} from "@/lib/classroom-rtdb";
import { ensureSignedIn, isFirebaseAvailable } from "@/lib/firebase";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import { playSound } from "@/lib/sound";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <TeacherDashboard />
    </Suspense>
  );
}

function TeacherDashboard() {
  const search = useSearchParams();
  const roomCode = (search.get("code") ?? "").toUpperCase();

  const [snap, setSnap] = useState<RoomSnapshot | null>(null);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [pwInput, setPwInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [joinUrl, setJoinUrl] = useState<string>("");

  // 1. 確認密碼 (從 sessionStorage 拿 / 或要使用者輸入)
  useEffect(() => {
    if (!roomCode) return;
    if (typeof window === "undefined") return;
    if (!isFirebaseAvailable()) {
      setAuthError("Firebase 還沒設定好");
      return;
    }
    void ensureSignedIn();
    const cached = sessionStorage.getItem(`mbti-teacher-${roomCode}`);
    if (cached) {
      void reauthorizeTeacher(roomCode, cached).then((ok) => {
        if (ok) setAuthorized(true);
        else {
          sessionStorage.removeItem(`mbti-teacher-${roomCode}`);
          setAuthError("密碼已失效，請重新輸入");
        }
      });
    }
  }, [roomCode]);

  // 2. 訂閱 RTDB
  useEffect(() => {
    if (!authorized || !roomCode) return;
    const unsub = subscribeRoom(roomCode, setSnap);
    return () => unsub();
  }, [authorized, roomCode]);

  // 3. 生成 QR code
  useEffect(() => {
    if (!roomCode || typeof window === "undefined") return;
    const origin = window.location.origin;
    const url = `${origin}${BASE_PATH}/join?room=${roomCode}`;
    setJoinUrl(url);
    QRCode.toDataURL(url, { width: 260, margin: 2 }).then(setQrDataUrl).catch(() => {});
  }, [roomCode]);

  async function handleAuth() {
    setAuthError(null);
    if (!pwInput) {
      setAuthError("請輸入密碼");
      return;
    }
    playSound("click");
    const ok = await reauthorizeTeacher(roomCode, pwInput);
    if (ok) {
      sessionStorage.setItem(`mbti-teacher-${roomCode}`, pwInput);
      setAuthorized(true);
      playSound("coin");
    } else {
      setAuthError("密碼錯誤");
      playSound("toggleOff");
    }
  }

  async function handleEndRoom() {
    if (!confirm("確定要結束會議？學生端會看到「老師已結束會議」")) return;
    playSound("whoosh");
    await endRoom(roomCode);
  }

  const students = snap?.students ?? {};
  const studentList = Object.entries(students).map(([uid, s]) => ({ uid, ...s }));
  const totalStudents = studentList.length;
  const doneStudents = studentList.filter((s) => s.finalType);
  const pinnedScene = snap?.teacherControl?.pinnedScene;

  // 統計每個場景有多少人
  const sceneCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of studentList) {
      const key = s.finalType ? "__done__" : s.currentScene ?? "__waiting__";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [studentList]);

  // 統計 final type 分布
  const typeCounts = useMemo(() => {
    const m: Partial<Record<MBTIType, number>> = {};
    for (const s of doneStudents) {
      if (s.finalType && ALL_TYPES.includes(s.finalType as MBTIType)) {
        const t = s.finalType as MBTIType;
        m[t] = (m[t] ?? 0) + 1;
      }
    }
    return m;
  }, [doneStudents]);

  // 未授權：顯示密碼框
  if (!authorized) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <HomeToButton />
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
            <h1 className="text-2xl font-black mb-2">🔐 老師密碼驗證</h1>
            <p className="text-sm text-[var(--color-ink)]/70 mb-4">
              房號：<span className="font-mono font-black text-[var(--color-coral)]">{roomCode}</span>
              <br />
              輸入建房時設定的密碼回到 dashboard
            </p>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              placeholder="老師密碼"
              className="w-full p-3 rounded-2xl border-2 border-[var(--color-ink)]/15 focus:border-[var(--color-coral)] focus:outline-none mb-3"
              autoFocus
            />
            {authError && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 text-sm text-rose-800 mb-3">
                ⚠️ {authError}
              </div>
            )}
            <SoundButton
              sound="click"
              onClick={handleAuth}
              className="btn-3d w-full px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black"
            >
              進入 Dashboard
            </SoundButton>
          </div>
        </div>
      </div>
    );
  }

  const isRoomEnded = snap?.meta?.isActive === false;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <HomeToButton />
          <div className="text-xs text-[var(--color-ink)]/50">
            {snap?.meta?.teacherName ? `👩‍🏫 ${snap.meta.teacherName}` : ""}
          </div>
        </div>

        {/* Header: 房號 + QR + 統計 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 房號 + QR */}
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl md:col-span-2">
            <div className="text-xs uppercase tracking-widest opacity-80 mb-1">📡 房號</div>
            <div className="text-6xl sm:text-7xl font-black tracking-widest font-mono mb-3 drop-shadow-lg">
              {roomCode}
            </div>
            <div className="text-sm opacity-90 break-all">{joinUrl}</div>
            {isRoomEnded && (
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">
                ⛔ 已結束
              </div>
            )}
          </div>
          {qrDataUrl && (
            <div className="bg-white rounded-3xl p-5 border-2 border-[var(--color-ink)]/10 flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR code" className="w-full max-w-[200px]" />
              <p className="text-xs text-[var(--color-ink)]/60 mt-2 text-center">📱 手機掃描加入</p>
            </div>
          )}
        </section>

        {/* 摘要 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="加入學生" value={totalStudents} color="bg-sky-100 text-sky-900" />
          <Stat label="完成" value={doneStudents.length} color="bg-emerald-100 text-emerald-900" />
          <Stat label="進行中" value={totalStudents - doneStudents.length} color="bg-amber-100 text-amber-900" />
          <Stat label="出現型" value={Object.keys(typeCounts).length} color="bg-rose-100 text-rose-900" />
        </section>

        {/* 場景進度分布 */}
        {sceneCounts.size > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 mb-6">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2">
              <span>📍</span> 學生目前場景分布
            </h3>
            <div className="space-y-2">
              {Array.from(sceneCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([scene, count]) => {
                  const isCurrentPin = scene === pinnedScene;
                  const label =
                    scene === "__done__"
                      ? "✅ 已完成"
                      : scene === "__waiting__"
                      ? "🚪 剛加入"
                      : scene;
                  return (
                    <div
                      key={scene}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                        isCurrentPin
                          ? "border-rose-400 bg-rose-50"
                          : "border-[var(--color-ink)]/10 bg-[var(--color-cream)]"
                      }`}
                    >
                      <div className="flex-1 font-mono text-sm">{label}</div>
                      <div className="font-black text-lg">{count} 位</div>
                      {scene !== "__done__" && scene !== "__waiting__" && (
                        <SoundButton
                          sound={isCurrentPin ? "toggleOff" : "click"}
                          onClick={() => pinScene(roomCode, isCurrentPin ? null : scene, "")}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            isCurrentPin
                              ? "bg-rose-500 text-white"
                              : "bg-white border-2 border-[var(--color-ink)]/15 hover:border-rose-400"
                          }`}
                        >
                          {isCurrentPin ? "📌 已 Pin (點取消)" : "📌 Pin 全班"}
                        </SoundButton>
                      )}
                    </div>
                  );
                })}
            </div>
            {pinnedScene && (
              <p className="text-xs text-rose-700 mt-3">
                ⚠️ 全班正在 <strong>{pinnedScene}</strong> 場景被 pin 住，學生看不到下一場景，討論結束後請點「取消 Pin」。
              </p>
            )}
          </section>
        )}

        {/* 學生清單 */}
        <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 mb-6">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2">
            <span>👥</span> 學生清單 ({totalStudents})
          </h3>
          {totalStudents === 0 ? (
            <p className="text-[var(--color-ink)]/50 text-center py-6">
              還沒有學生加入，把房號 / QR code 投影出來給學生吧 ✨
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {studentList.map((s) => (
                <StudentCard key={s.uid} s={s} />
              ))}
            </div>
          )}
        </section>

        {/* 已完成的 MBTI 分布 */}
        {doneStudents.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 mb-6">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2">
              <span>🎯</span> 已完成的同學 ({doneStudents.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {doneStudents.map((s) => {
                const info = getMBTIInfo(s.finalType as MBTIType);
                return (
                  <div
                    key={s.uid}
                    className={`bg-gradient-to-r ${info.gradient} rounded-xl px-3 py-2 text-white text-sm font-bold flex items-center gap-2`}
                  >
                    <span className="text-lg">{info.emoji}</span>
                    <span className="truncate flex-1">{s.name}</span>
                    <span className="text-xs opacity-90">{s.finalType}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 結束會議 */}
        {!isRoomEnded && (
          <section className="flex justify-end">
            <SoundButton
              sound="whoosh"
              onClick={handleEndRoom}
              className="btn-3d px-5 py-3 rounded-2xl bg-rose-500 text-white font-black hover:bg-rose-600"
            >
              ⛔ 結束會議
            </SoundButton>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-xs font-bold opacity-80">{label}</div>
      <div className="text-3xl font-black mt-1">{value}</div>
    </div>
  );
}

function StudentCard({ s }: { s: StudentEntry & { uid: string } }) {
  const isDone = !!s.finalType;
  const isStale = s.lastSeen && Date.now() - s.lastSeen > 30_000;
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-xl border-2 ${
        isDone
          ? "border-emerald-300 bg-emerald-50"
          : isStale
          ? "border-amber-200 bg-amber-50 opacity-70"
          : "border-[var(--color-ink)]/10 bg-[var(--color-cream)]"
      }`}
    >
      <span className="text-2xl shrink-0">{s.avatar ?? "🧑"}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{s.name}</div>
        <div className="text-xs text-[var(--color-ink)]/60 font-mono truncate">
          {isDone ? `✓ ${s.finalType}` : s.currentScene ?? "剛加入"}
        </div>
      </div>
    </div>
  );
}
