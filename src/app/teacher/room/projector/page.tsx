"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeRoom, type RoomSnapshot } from "@/lib/classroom-rtdb";
import { ensureSignedIn, isFirebaseAvailable } from "@/lib/firebase";
import { getScene } from "@/lib/scenes";
import { getMBTIInfo } from "@/lib/mbti";
import { ALL_TYPES, type MBTIType } from "@/lib/types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ProjectorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <Projector />
    </Suspense>
  );
}

function Projector() {
  const search = useSearchParams();
  const roomCode = (search.get("code") ?? "").toUpperCase();
  const [snap, setSnap] = useState<RoomSnapshot | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!roomCode) return;
    if (!isFirebaseAvailable()) return;
    void ensureSignedIn();
    const unsub = subscribeRoom(roomCode, setSnap);
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || typeof window === "undefined") return;
    const url = `${window.location.origin}${BASE_PATH}/join?room=${roomCode}`;
    QRCode.toDataURL(url, { width: 480, margin: 2 }).then(setQrDataUrl).catch(() => {});
  }, [roomCode]);

  const students = snap?.students ?? {};
  const studentList = Object.entries(students).map(([uid, s]) => ({ uid, ...s }));
  const doneStudents = studentList.filter((s) => s.finalType);
  const pinnedScene = snap?.teacherControl?.pinnedScene;
  const pinnedSceneData = pinnedScene ? getScene(pinnedScene) : null;

  // Pinned scene 投票分布
  const voteCounts = useMemo(() => {
    if (!pinnedScene || !pinnedSceneData) return [] as Array<{ index: number; count: number }>;
    const counts = pinnedSceneData.choices.map((_, idx) => ({ index: idx, count: 0 }));
    for (const s of studentList) {
      if (s.currentScene === pinnedScene && typeof s.votingChoice === "number" && s.votingScene === pinnedScene) {
        const c = counts[s.votingChoice];
        if (c) c.count++;
      }
    }
    return counts;
  }, [pinnedScene, pinnedSceneData, studentList]);

  // MBTI 分布
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

  // 投影模式：黑底大字
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 text-white">
      {/* 沒 pin 也沒人完成 → 大房號 + QR */}
      {!pinnedScene && doneStudents.length === 0 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <p className="text-2xl sm:text-3xl uppercase tracking-[0.5em] opacity-70 mb-4">
            📡 加入房號
          </p>
          <div className="text-8xl sm:text-9xl md:text-[12rem] font-black tracking-widest font-mono shimmer-text mb-8 drop-shadow-2xl">
            {roomCode}
          </div>
          {qrDataUrl && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR" className="w-64 sm:w-80" />
            </div>
          )}
          <p className="text-xl mt-6 opacity-80">
            手機掃 QR / 電腦進 <strong>cagoooo.github.io/MBTI/join</strong>
          </p>

          {/* 加入學生跑馬燈 */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center max-w-5xl">
            <AnimatePresence>
              {studentList.map((s) => (
                <motion.div
                  key={s.uid}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2 flex items-center gap-2 border border-white/20"
                >
                  <span className="text-2xl">{s.avatar ?? "🧑"}</span>
                  <span className="font-bold">{s.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-lg mt-6 opacity-60">
            目前 <strong className="text-3xl text-yellow-300">{studentList.length}</strong> 位同學加入
          </p>
        </div>
      )}

      {/* Pinned 時：全螢幕投票分布 */}
      {pinnedScene && pinnedSceneData && (
        <div className="min-h-screen flex flex-col p-8">
          <div className="text-center mb-6">
            <p className="text-lg uppercase tracking-[0.4em] opacity-70 mb-1">📌 即時投票</p>
            <h1 className="text-4xl sm:text-5xl font-black drop-shadow">{pinnedSceneData.location}</h1>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-6 sm:p-8 mb-6 border border-white/20">
            {pinnedSceneData.text.map((p, i) => (
              <p key={i} className="text-xl sm:text-2xl leading-relaxed mb-2">{p}</p>
            ))}
          </div>

          <div className="space-y-4 flex-1">
            {pinnedSceneData.choices.map((choice, idx) => {
              const data = voteCounts[idx];
              const total = voteCounts.reduce((s, c) => s + c.count, 0);
              const pct = total === 0 ? 0 : Math.round((data.count / total) * 100);
              return (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/20">
                  <div className="flex items-start gap-3 mb-3">
                    {choice.emoji && <span className="text-4xl">{choice.emoji}</span>}
                    <span className="flex-1 text-xl sm:text-2xl font-medium leading-snug">{choice.text}</span>
                    <span className="text-3xl sm:text-4xl font-black text-yellow-300 shrink-0">
                      {data.count}
                    </span>
                  </div>
                  <div className="h-5 rounded-full bg-white/20 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-yellow-300 via-pink-400 to-rose-500"
                    />
                  </div>
                  <div className="text-sm opacity-70 mt-1 text-right">{pct}%</div>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-6 text-lg opacity-70">
            房號 <strong className="font-mono text-yellow-300">{roomCode}</strong> ・ {studentList.length} 位學生在線
          </p>
        </div>
      )}

      {/* 沒 pin 但有人完成 → 結果即時分布 */}
      {!pinnedScene && doneStudents.length > 0 && (
        <div className="min-h-screen flex flex-col p-8">
          <div className="text-center mb-6">
            <p className="text-lg uppercase tracking-[0.4em] opacity-70 mb-1">🎉 班級 MBTI 分布</p>
            <h1 className="text-4xl sm:text-5xl font-black drop-shadow">
              {doneStudents.length} / {studentList.length} 位完成
            </h1>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 flex-1">
            {ALL_TYPES.map((t) => {
              const count = typeCounts[t] ?? 0;
              const info = getMBTIInfo(t);
              return (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-3xl p-4 text-center ${
                    count > 0
                      ? `bg-gradient-to-br ${info.gradient} shadow-xl`
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="text-4xl mb-1">{count > 0 ? info.emoji : "❔"}</div>
                  <div className={`text-2xl font-black ${count > 0 ? "text-white drop-shadow" : "opacity-30"}`}>
                    {t}
                  </div>
                  <div className={`text-xl font-black ${count > 0 ? "text-yellow-100" : "opacity-30"}`}>
                    {count}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center mt-6 text-lg opacity-70">
            房號 <strong className="font-mono text-yellow-300">{roomCode}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
