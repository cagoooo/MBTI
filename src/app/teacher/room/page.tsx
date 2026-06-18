"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import SiteNav from "@/components/SiteNav";
import SoundButton from "@/components/SoundButton";
import {
  clearAllVotes,
  endRoom,
  pinScene,
  reauthorizeTeacher,
  subscribeRoom,
  type RoomSnapshot,
  type StudentEntry,
} from "@/lib/classroom-rtdb";
import { getScene } from "@/lib/scenes";
import { ensureSignedIn, isFirebaseAvailable } from "@/lib/firebase";
import { ALL_TYPES, type MBTIType, type Branch } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import { playSound } from "@/lib/sound";
import appConfig from "../../../../app.config";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const BRANCH_GRAD: Record<Branch | "main", string> = {
  sport: "linear-gradient(135deg, var(--tape-coral), var(--coral))",
  art: "linear-gradient(135deg, var(--tape-rose), var(--rose))",
  study: "linear-gradient(135deg, var(--tape-sky), var(--sky))",
  friend: "linear-gradient(135deg, var(--tape-mint), var(--mint))",
  service: "linear-gradient(135deg, var(--tape-sunny), var(--sunny))",
  main: "linear-gradient(135deg, var(--paper-2), var(--muted))",
};

const BRANCH_NAME: Record<Branch | "main", string> = {
  sport: "🏃 校隊",
  art: "🎨 藝術",
  study: "📚 學術",
  friend: "🤝 友誼",
  service: "🌍 服務",
  main: "📖 主線",
};

const BRANCH_COLOR: Record<Branch | "main", string> = {
  sport: "var(--coral)",
  art: "var(--rose)",
  study: "var(--sky)",
  friend: "var(--mint)",
  service: "var(--sunny)",
  main: "var(--ink)",
};

const TYPE_GROUP: Record<MBTIType, "NT" | "NF" | "SJ" | "SP"> = {
  INTJ: "NT", INTP: "NT", ENTJ: "NT", ENTP: "NT",
  INFJ: "NF", INFP: "NF", ENFJ: "NF", ENFP: "NF",
  ISTJ: "SJ", ISFJ: "SJ", ESTJ: "SJ", ESFJ: "SJ",
  ISTP: "SP", ISFP: "SP", ESTP: "SP", ESFP: "SP",
};

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
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

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

  useEffect(() => {
    if (!authorized || !roomCode) return;
    setStartedAt(Date.now());
    const unsub = subscribeRoom(roomCode, setSnap);
    return () => unsub();
  }, [authorized, roomCode]);

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

  const students = snap?.students ?? {};
  const studentList = Object.entries(students).map(([uid, s]) => ({ uid, ...s }));
  const totalStudents = studentList.length;
  const doneStudents = studentList.filter((s) => s.finalType);
  const pinnedScene = snap?.teacherControl?.pinnedScene;

  async function handleEndRoom() {
    if (!confirm("確定要結束會議？學生端會看到「老師已結束會議」")) return;
    playSound("whoosh");
    await endRoom(roomCode);
    const completedRoster = doneStudents
      .map((s) => `${s.name} ${s.finalType}`)
      .join("\n");
    if (completedRoster) {
      try {
        sessionStorage.setItem(`mbti-class-roster-${roomCode}`, completedRoster);
      } catch {}
      window.location.href = `${BASE_PATH || ""}/class-stats?from=${roomCode}`;
    }
  }

  // 不必結束房間，隨時把「目前已完成測驗的學生」名單帶進班級統計
  function handleViewStats() {
    const completedRoster = doneStudents
      .map((s) => `${s.name} ${s.finalType}`)
      .join("\n");
    if (!completedRoster) {
      alert("還沒有學生完成測驗，等學生作答出 MBTI 結果後就會自動帶入囉 🙂");
      return;
    }
    playSound("coin");
    try {
      sessionStorage.setItem(`mbti-class-roster-${roomCode}`, completedRoster);
    } catch {}
    window.location.href = `${BASE_PATH || ""}/class-stats?from=${roomCode}`;
  }

  const pinnedSceneData = pinnedScene ? getScene(pinnedScene) : null;
  const voteCounts = useMemo(() => {
    if (!pinnedScene || !pinnedSceneData) return [] as Array<{ index: number; count: number; voters: string[] }>;
    const counts = pinnedSceneData.choices.map((_, idx) => ({
      index: idx,
      count: 0,
      voters: [] as string[],
    }));
    for (const s of studentList) {
      if (s.currentScene === pinnedScene && typeof s.votingChoice === "number" && s.votingScene === pinnedScene) {
        const c = counts[s.votingChoice];
        if (c) {
          c.count++;
          c.voters.push(s.name);
        }
      }
    }
    return counts;
  }, [pinnedScene, pinnedSceneData, studentList]);

  const undecidedStudents = useMemo(() => {
    if (!pinnedScene) return [] as typeof studentList;
    return studentList.filter(
      (s) =>
        s.currentScene === pinnedScene &&
        !s.finalType &&
        (typeof s.votingChoice !== "number" || s.votingScene !== pinnedScene),
    );
  }, [pinnedScene, studentList]);

  async function handleUnpin() {
    playSound("toggleOff");
    await clearAllVotes(roomCode, students);
    await pinScene(roomCode, null, "");
  }

  const sceneCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of studentList) {
      const key = s.finalType ? "__done__" : s.currentScene ?? "__waiting__";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [studentList]);

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

  const activeCount = studentList.filter((s) => {
    if (s.finalType) return false;
    if (!s.lastSeen) return false;
    return now - s.lastSeen < 30_000;
  }).length;

  const avgScene = useMemo(() => {
    const sceneNumbers = studentList
      .map((s) => {
        if (s.finalType) return 30;
        const m = (s.currentScene ?? "").match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);
    if (sceneNumbers.length === 0) return null;
    const avg = sceneNumbers.reduce((a, b) => a + b, 0) / sceneNumbers.length;
    return Math.round(avg * 10) / 10;
  }, [studentList]);

  const elapsedMs = now - startedAt;
  const elapsedMin = Math.floor(elapsedMs / 60_000);
  const elapsedSec = Math.floor((elapsedMs % 60_000) / 1000);
  const elapsedDisplay = `${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`;

  // 未授權 → 密碼框（用 v3.17 風格）
  if (!authorized) {
    return (
      <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
        <SiteNav active="/teacher/room" />
        <section style={{ padding: "60px 0 40px", maxWidth: 480, margin: "0 auto" }}>
          <div className="tape plum rotate-n2" style={{ marginBottom: 20 }}>🔐 TEACHER · LOGIN</div>
          <h1 className="f-serif" style={{ fontWeight: 900, fontSize: 44, lineHeight: 1, margin: "0 0 20px" }}>
            老師密碼<br /><span style={{ color: "var(--coral)" }}>驗證</span>
          </h1>

          <div
            style={{
              background: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "8px 8px 0 var(--ink)",
              padding: "28px 32px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -16,
                left: 24,
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "6px 16px",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 3,
              }}
            >
              📡 ROOM · {roomCode || "??????"}
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "8px 0 16px", lineHeight: 1.6 }}>
              輸入建房時設定的密碼回到 dashboard。
            </p>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              placeholder="老師密碼"
              className="roster-textarea"
              style={{
                width: "100%",
                minHeight: "auto",
                padding: "14px 16px",
                fontSize: 16,
                backgroundImage: "none",
                lineHeight: 1.5,
              }}
              autoFocus
            />
            {authError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "var(--paper-warm)",
                  border: "2px solid var(--coral)",
                  fontSize: 13,
                  color: "var(--coral)",
                  fontWeight: 700,
                }}
              >
                ⚠️ {authError}
              </div>
            )}
            <SoundButton
              sound="click"
              onClick={handleAuth}
              className="btn-start"
              style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
            >
              進入 Dashboard
              <span className="arrow">→</span>
            </SoundButton>
          </div>
        </section>
      </div>
    );
  }

  const isRoomEnded = snap?.meta?.isActive === false;

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/teacher/room" />

      {/* HERO */}
      <section style={{ padding: "32px 0 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div className="tape plum rotate-n2" style={{ marginBottom: 14 }}>
              🎓 TEACHER · CONTROL · ROOM
            </div>
            <h1
              className="f-serif"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 5.5vw, 72px)",
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              即時房間 · <span style={{ color: "var(--coral)" }}>{roomCode}</span>
            </h1>
            {snap?.meta?.teacherName && (
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-soft)" }}>
                👩‍🏫 {snap.meta.teacherName}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "#fff",
                border: `2px solid ${isRoomEnded ? "var(--muted)" : "var(--mint)"}`,
                boxShadow: `3px 3px 0 ${isRoomEnded ? "var(--muted)" : "var(--mint)"}`,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 800,
                color: isRoomEnded ? "var(--muted)" : "var(--mint)",
              }}
            >
              <span className="live-dot" style={{ background: isRoomEnded ? "var(--muted)" : "var(--mint)", boxShadow: isRoomEnded ? "none" : "0 0 6px var(--mint)" }}></span>
              ● {isRoomEnded ? "ENDED" : "ONLINE"}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "#fff",
                border: "2px solid var(--ink)",
                boxShadow: "3px 3px 0 var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              ⏱ {elapsedDisplay} 已開課
            </span>
            <a
              href={`${BASE_PATH}/teacher/room/projector?code=${roomCode}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "var(--ink)",
                color: "var(--paper)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 2,
                textDecoration: "none",
              }}
            >
              📺 PROJECTOR
            </a>
          </div>
        </div>
      </section>

      {/* ROOM CARD */}
      <section style={{ paddingBottom: 8 }}>
        <div className="room-card">
          <div className="room-card-head">
            <div className="live">
              <span className="live-dot"></span>
              ◆ ROOM · CODE · SHARE WITH STUDENTS
            </div>
            <div style={{ color: "var(--muted)", display: "flex", gap: 24, flexWrap: "wrap" }}>
              <span>SAVE 01 · CAMPUS.SAV</span>
              <span style={{ color: "#88e0ff" }}>{new Date().toISOString().slice(0, 10)}</span>
            </div>
          </div>
          <div className="room-card-body">
            <div>
              <div className="hud" style={{ marginBottom: 6 }}>▸ 6 位數房號</div>
              <div className="room-code-big">
                {roomCode.split("").map((d, i) => (
                  <span key={i} className="digit">{d}</span>
                ))}
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7, marginTop: 14 }}>
                學生在<b>瀏覽器</b>輸入{" "}
                <span
                  className="f-mono"
                  style={{
                    background: "var(--paper-warm)",
                    padding: "2px 10px",
                    fontWeight: 800,
                    wordBreak: "break-all",
                  }}
                >
                  {joinUrl}
                </span>{" "}
                → 寫自己名字 → 開始玩。
              </div>
              {isRoomEnded && (
                <div
                  style={{
                    marginTop: 12,
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "var(--coral)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: 2,
                  }}
                >
                  ⛔ 已結束
                </div>
              )}
            </div>
            <div className="qr-placeholder">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrDataUrl} alt="QR code" />
              ) : (
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: 12 }}>QR LOADING...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KPI ROW */}
      <section>
        <div className="kpi-row">
          <div className="kpi coral">
            <div className="lbl">▸ TOTAL · 加入學生</div>
            <div className="num">{totalStudents}</div>
            <div className="delta">人已加入這次房間</div>
          </div>
          <div className="kpi mint">
            <div className="lbl">▸ ACTIVE · 進行中</div>
            <div className="num">{activeCount}</div>
            <div className="delta">● 過去 30s 有動作</div>
          </div>
          <div className="kpi sunny">
            <div className="lbl">▸ DONE · 已完成</div>
            <div className="num">{doneStudents.length}</div>
            <div className="delta">
              {totalStudents ? Math.round((doneStudents.length / totalStudents) * 100) : 0}% 全班完成
            </div>
          </div>
          <div className="kpi plum">
            <div className="lbl">▸ CURRENT · 平均場景</div>
            <div className="num">
              {avgScene ?? "--"}
              <span style={{ fontSize: 22, color: "var(--muted)", fontWeight: 400 }}>/30</span>
            </div>
            <div className="delta">{Object.keys(typeCounts).length} 種人格已現身</div>
          </div>
        </div>
      </section>

      {/* PIN SCENE BAR */}
      {pinnedScene && pinnedSceneData && (
        <section>
          <div className="pin-bar">
            <span className="tab">📌 PIN · 全班同步討論</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 18,
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 32 }}>🍽️</span>
                  <div>
                    <div className="hud" style={{ color: "var(--sunny)", marginBottom: 2 }}>
                      ▸ {pinnedScene} · {pinnedSceneData.location}
                    </div>
                    <div className="f-serif" style={{ fontWeight: 900, fontSize: 20 }}>
                      「{pinnedSceneData.text[0]?.slice(0, 40) ?? "討論場景"}」 — 你 PIN 在這場景
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  全班 {totalStudents} 位學生中{" "}
                  <b style={{ color: "var(--sunny)" }}>
                    {voteCounts.reduce((s, c) => s + c.count, 0)} 位
                  </b>
                  已投票，剩 {undecidedStudents.length} 位還沒選。
                </div>
              </div>

              {/* Real-time vote distribution */}
              <div style={{ marginTop: 8 }}>
                {pinnedSceneData.choices.map((choice, idx) => {
                  const data = voteCounts[idx];
                  const total = voteCounts.reduce((s, c) => s + c.count, 0);
                  const pct = total === 0 ? 0 : Math.round((data.count / total) * 100);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#fff",
                        border: "2px solid var(--ink)",
                        padding: "10px 12px",
                        marginBottom: 8,
                        boxShadow: "3px 3px 0 var(--ink)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {choice.emoji && <span style={{ fontSize: 18 }}>{choice.emoji}</span>}
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{choice.text}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 800,
                            fontSize: 13,
                            color: "var(--sunny)",
                          }}
                        >
                          {data.count} 位 · {pct}%
                        </span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill sunny" style={{ width: `${pct}%` }}></div>
                      </div>
                      {data.voters.length > 0 && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: "var(--ink-soft)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          🗳️ {data.voters.join("、")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {undecidedStudents.length > 0 && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--paper-warm)",
                    border: "2px dashed var(--sunny)",
                    fontSize: 13,
                    color: "var(--ink-soft)",
                  }}
                >
                  <b style={{ color: "#a87a16" }}>⏳ 還在想：</b>
                  {undecidedStudents.map((s) => s.name).join("、")}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SoundButton
                  sound="toggleOn"
                  onClick={handleUnpin}
                  className="btn-start"
                  style={{ background: "var(--mint)", boxShadow: "5px 5px 0 var(--ink)" }}
                >
                  ✅ 討論結束，放開全班
                  <span className="arrow">→</span>
                </SoundButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONTROL ROOM (student grid + sidebar) */}
      <section>
        <div className="section-header">
          <div className="diamond"></div>
          <div className="label">Live Students · {totalStudents} 位學生即時狀態</div>
          <div className="rule"></div>
        </div>

        <div className="control-room">
          {/* LEFT: student grid */}
          <div>
            {totalStudents === 0 ? (
              <div
                style={{
                  background: "var(--paper-warm)",
                  border: "2px dashed var(--line-strong)",
                  padding: "60px 24px",
                  textAlign: "center",
                  color: "var(--ink-soft)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🪑</div>
                <div className="f-serif" style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
                  還沒有學生加入
                </div>
                <div style={{ fontSize: 14 }}>把房號 / QR code 投影出來給學生吧 ✨</div>
              </div>
            ) : (
              <div className="student-grid">
                {studentList.map((s) => (
                  <StudentCard key={s.uid} s={s} now={now} />
                ))}
              </div>
            )}

            {totalStudents > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  background: "var(--paper-warm)",
                  borderLeft: "4px solid var(--ink)",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot active"></span> 進行中
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot idle"></span> 閒置 (&gt;30s)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot done"></span> 已完成
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot offline"></span> 離線
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: sidebar */}
          <aside>
            {/* Scene distribution / pin */}
            {sceneCounts.size > 0 && (
              <div className="sidebar-card">
                <span className="tab" style={{ background: "var(--plum)" }}>📍 SCENES · 場景分布</span>
                <div style={{ marginTop: 14, maxHeight: 320, overflowY: "auto" }}>
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
                      const canPin = scene !== "__done__" && scene !== "__waiting__";
                      return (
                        <div
                          key={scene}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            marginBottom: 6,
                            background: isCurrentPin ? "var(--paper-warm)" : "#fff",
                            border: `1.5px solid ${isCurrentPin ? "var(--sunny)" : "var(--line)"}`,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: isCurrentPin ? "#a87a16" : "var(--ink)",
                            }}
                          >
                            {label}
                          </div>
                          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 13 }}>
                            {count}
                          </div>
                          {canPin && (
                            <SoundButton
                              sound={isCurrentPin ? "toggleOff" : "click"}
                              onClick={() => (isCurrentPin ? handleUnpin() : pinScene(roomCode, scene, ""))}
                              style={{
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 800,
                                fontFamily: "var(--font-mono)",
                                background: isCurrentPin ? "var(--coral)" : "#fff",
                                color: isCurrentPin ? "#fff" : "var(--ink)",
                                border: "1.5px solid var(--ink)",
                                cursor: "pointer",
                                letterSpacing: 1,
                              }}
                            >
                              {isCurrentPin ? "✕ UNPIN" : "📌 PIN"}
                            </SoundButton>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Live MBTI distribution */}
            {doneStudents.length > 0 && (
              <div className="sidebar-card">
                <span className="tab" style={{ background: "var(--coral)" }}>📊 LIVE · MBTI 分佈</span>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                  {doneStudents.length} / {totalStudents} 完成 · 隨完成自動更新
                </div>
                <div style={{ marginTop: 14 }}>
                  {Object.entries(typeCounts)
                    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                    .map(([type, count]) => {
                      const t = type as MBTIType;
                      const info = getMBTIInfo(t);
                      const maxCount = Math.max(1, ...Object.values(typeCounts).filter((v): v is number => !!v));
                      const pct = ((count ?? 0) / maxCount) * 100;
                      return (
                        <div key={type} className="mini-bar" data-group={TYPE_GROUP[t]}>
                          <div className="code">
                            {info.emoji} {type}
                          </div>
                          <div className="track">
                            <div className="fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <div className="count">{count}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="sidebar-card">
              <span className="tab" style={{ background: "var(--ink)" }}>⚙ ACTIONS · 老師控制</span>
              <div style={{ marginTop: 14 }}>
                <a
                  href={`${BASE_PATH}/teacher/room/projector?code=${roomCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act-btn"
                >
                  <span className="emoji">🖥️</span>
                  <span>大螢幕投影模式</span>
                </a>
                <SoundButton sound="tap" onClick={handleViewStats} className="act-btn">
                  <span className="emoji">📊</span>
                  <span>看完整班級統計（{doneStudents.length} 人已完成）</span>
                </SoundButton>
                <a href={`${BASE_PATH}/guess`} className="act-btn">
                  <span className="emoji">🎲</span>
                  <span>進入猜朋友環節</span>
                </a>
                {!isRoomEnded && (
                  <SoundButton sound="whoosh" onClick={handleEndRoom} className="act-btn danger">
                    <span className="emoji">⏹</span>
                    <span>結束本次房間</span>
                  </SoundButton>
                )}
              </div>
            </div>

            {/* Tips */}
            <div
              className="sidebar-card"
              style={{ borderColor: "var(--mint)", boxShadow: "6px 6px 0 var(--mint)" }}
            >
              <span className="tab" style={{ background: "var(--mint)" }}>💡 教學提示</span>
              <ul
                style={{
                  margin: "14px 0 0",
                  paddingLeft: 18,
                  fontSize: 12.5,
                  lineHeight: 1.75,
                  color: "var(--ink-soft)",
                }}
              >
                <li>學生在<b>緩慢</b>時，按 PIN 鎖大家在同一場景集合</li>
                <li>結束前提醒學生<b>寫學習單</b>（A4 學習單入口）</li>
                <li>結束時房間會自動產生<b>班級統計報告</b></li>
                <li>下次同一組房號可<b>重複使用</b>（請學生用同樣暱稱）</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <footer
        style={{
          padding: "60px 0 80px",
          borderTop: "1.5px dashed var(--line-strong)",
          marginTop: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>
          <div className="f-serif" style={{ fontWeight: 900, fontSize: 28, lineHeight: 1, marginBottom: 6 }}>
            校園<span style={{ color: "var(--coral)" }}>奇遇</span>記
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            班級房間 · 老師後台 © 2026 · {appConfig.teacherName} · {appConfig.schoolFullName}
          </div>
        </div>
        <div className="hud">v3.17 · teacher-room</div>
      </footer>
    </div>
  );
}

function StudentCard({
  s,
  now,
}: {
  s: StudentEntry & { uid: string };
  now: number;
}) {
  const isDone = !!s.finalType;
  const isStale = s.lastSeen ? now - s.lastSeen > 60_000 : true;
  const isOffline = s.lastSeen ? now - s.lastSeen > 180_000 : true;
  const isActive = !isDone && !isStale && !isOffline;

  const status: "active" | "idle" | "done" | "offline" = isDone
    ? "done"
    : isOffline
    ? "offline"
    : isStale
    ? "idle"
    : "active";

  const branchKey: Branch | "main" = ((s.currentBranch as Branch | undefined) ?? "main");
  // 假設 30 場景估計進度
  const sceneNum = s.currentScene?.match(/(\d+)/)?.[1] ? parseInt(s.currentScene.match(/(\d+)/)![1], 10) : 0;
  const pct = isDone ? 100 : sceneNum > 0 ? Math.min(100, (sceneNum / 30) * 100) : 5;
  const initial = s.name?.slice(-1) ?? "?";

  const finalTypeInfo = isDone && s.finalType ? getMBTIInfo(s.finalType as MBTIType) : null;

  return (
    <div className="student" style={{ opacity: status === "offline" ? 0.55 : 1 }}>
      <div className="head">
        <div className="avatar" style={{ background: BRANCH_GRAD[branchKey] }}>
          {initial}
        </div>
        <span className="s-name">{s.name}</span>
        <span className={`status-dot ${status}`}></span>
      </div>
      <div className="scene-line">
        <span>{isDone ? "✓ 完成" : sceneNum > 0 ? `SCENE ${String(sceneNum).padStart(2, "0")}` : "剛加入"}</span>
        <span
          style={{
            padding: "1px 6px",
            background: BRANCH_COLOR[branchKey],
            color: "#fff",
            fontWeight: 800,
            fontSize: 9,
          }}
        >
          {BRANCH_NAME[branchKey]}
        </span>
      </div>
      <div className="s-progress">
        <div className={`fill ${isDone ? "done" : ""}`} style={{ width: `${pct}%` }}></div>
      </div>
      <div className="footer-line">
        {isDone && finalTypeInfo ? (
          <span className="result-pill">
            {finalTypeInfo.emoji} {s.finalType} · {finalTypeInfo.nickname}
          </span>
        ) : (
          <>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
              {sceneNum > 0 ? `${sceneNum} / 30` : "—"}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>{Math.round(pct)}%</span>
          </>
        )}
      </div>
    </div>
  );
}
