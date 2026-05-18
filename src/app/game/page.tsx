"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getScene, START_SCENE_ID, TOTAL_CHAPTERS } from "@/lib/scenes";
import { applyDelta, deriveType, initialScores } from "@/lib/scoring";
import type { Branch, Choice, Scene, Scores } from "@/lib/types";
import ProgressDots from "@/components/ProgressDots";
import HomeToButton from "@/components/HomeToButton";
import BgmController from "@/components/BgmController";
import SoundButton from "@/components/SoundButton";
import { playSound, type BgmTrackId } from "@/lib/sound";
import { isTtsAvailable, isTtsOn, speakScene, stop as stopTts, speak as speakTts, pause as pauseTts, resume as resumeTts, subscribeStatus as subscribeTtsStatus } from "@/lib/tts";
import {
  setStudentVote,
  subscribeRoom,
  updateStudentProgress,
  type RoomSnapshot,
} from "@/lib/classroom-rtdb";
import { isFirebaseAvailable } from "@/lib/firebase";
import RubyText from "@/components/RubyText";
import PretestQuiz from "@/components/PretestQuiz";
import { countMatchedAxes, loadPretestGuess } from "@/lib/pretest";
import SceneBackground from "@/components/SceneBackground";
import NpcAvatar from "@/components/NpcAvatar";
import { addHistory } from "@/lib/history";
import SiteNav from "@/components/SiteNav";

/**
 * 場景所屬支線 → BGM track 對應
 * - main 主線 (開學週 scene_01~06 + 校慶結局 final_01~04) 用 game (Playful Kids 通用感)
 * - 四條支線各自的專屬 BGM (校隊熱血/藝術夢幻/學術好奇/友誼溫暖)
 */
const BRANCH_TO_BGM: Record<Branch, BgmTrackId> = {
  main: "game",
  sport: "sport",
  art: "art",
  study: "study",
  friend: "friend",
  service: "friend", // 服務組沿用友誼組的溫暖 BGM
};

interface HistoryEntry {
  sceneId: string;
  choiceIndex: number;
  followUp?: string;
  delta: Choice["delta"];
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">載入中...</div>}>
      <GameInner />
    </Suspense>
  );
}

interface ClassSession {
  roomCode: string;
  studentUid: string;
}

function GameInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCodeFromUrl = (searchParams.get("room") || "").toUpperCase();

  const [sceneId, setSceneId] = useState<string>(START_SCENE_ID);
  const [scores, setScores] = useState<Scores>(initialScores);
  const [branch, setBranch] = useState<Branch>("main");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showFollowUp, setShowFollowUp] = useState<string | null>(null);
  const [pendingNext, setPendingNext] = useState<{ id: string; isEnding: boolean } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  // TTS 播放狀態 (給 UI 顯示 ▶/⏸ 切換)
  const [ttsStatus, setTtsStatus] = useState<{ speaking: boolean; paused: boolean }>({
    speaking: false,
    paused: false,
  });

  useEffect(() => {
    if (!ttsEnabled) {
      setTtsStatus({ speaking: false, paused: false });
      return;
    }
    const unsub = subscribeTtsStatus(setTtsStatus);
    return unsub;
  }, [ttsEnabled]);

  // ─────── 課前快測 modal ───────
  // 只在「真的剛開始 (scene_01) + 沒進度 + 沒做過 pretest」時顯示
  const [showPretest, setShowPretest] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sceneId !== START_SCENE_ID) return;
    if (history.length > 0) return;
    if (loadPretestGuess()) return; // 已經做過
    setShowPretest(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────── 班級模式 sync hook ───────
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [pinnedScene, setPinnedScene] = useState<string | null>(null);
  const [pinReason, setPinReason] = useState<string>("");

  // 從 sessionStorage 拿 class session (從 /join 帶過來)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!roomCodeFromUrl) return;
    try {
      const raw = sessionStorage.getItem("mbti-class-session");
      if (!raw) return;
      const session = JSON.parse(raw) as ClassSession;
      if (session.roomCode === roomCodeFromUrl) {
        setClassSession(session);
      }
    } catch {}
  }, [roomCodeFromUrl]);

  // 訂閱房間，接收 pinnedScene 變動
  useEffect(() => {
    if (!classSession || !isFirebaseAvailable()) return;
    const unsub = subscribeRoom(classSession.roomCode, (snap: RoomSnapshot) => {
      setPinnedScene(snap.teacherControl?.pinnedScene ?? null);
      setPinReason(snap.teacherControl?.pinReason ?? "");
    });
    return () => unsub();
  }, [classSession]);

  // 進場景時上傳 progress (含初始 scene_01)
  useEffect(() => {
    if (!classSession || !isFirebaseAvailable()) return;
    void updateStudentProgress(classSession.roomCode, classSession.studentUid, {
      currentScene: sceneId,
      currentBranch: branch,
      score: scores,
    });
  }, [classSession, sceneId, branch, scores]);

  // 是否被老師 pin 住
  const isPinned = !!(classSession && pinnedScene && pinnedScene === sceneId);

  // pin 期間的投票暫存（解 pin 後自動套用）
  const [pendingVote, setPendingVote] = useState<{ sceneId: string; choiceIndex: number } | null>(null);

  // 監聽 unpin → 若有 pendingVote 且場景對應 → 自動 proceed
  useEffect(() => {
    if (!classSession) return;
    if (isPinned) return; // 還被 pin 中
    if (!pendingVote) return;
    if (pendingVote.sceneId !== sceneId) {
      setPendingVote(null);
      return;
    }
    // unpin 了，套用 pendingVote
    const choice = scene?.choices[pendingVote.choiceIndex];
    if (!choice) {
      setPendingVote(null);
      return;
    }
    // 清 RTDB votingChoice
    void setStudentVote(classSession.roomCode, classSession.studentUid, sceneId, null);
    setPendingVote(null);
    // 直接執行原本的 handleChoice (但要避免無限迴圈，所以稍延遲)
    const t = setTimeout(() => handleChoice(choice, pendingVote.choiceIndex), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinned, pendingVote, sceneId, classSession]);

  // 追蹤 TTS 開關狀態 (避免 SSR mismatch + 使用者中途切換)
  useEffect(() => {
    setTtsEnabled(isTtsAvailable() && isTtsOn());
    // localStorage 沒 storage event 在同一頁 tab，但我們可以監聽 sound-toggle 的 click
    function refresh() {
      setTtsEnabled(isTtsAvailable() && isTtsOn());
    }
    window.addEventListener("storage", refresh);
    // 每 1.5s polling 一次 (給同 tab 切換用，輕量)
    const iv = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(iv);
    };
  }, []);

  const scene: Scene | undefined = useMemo(() => getScene(sceneId), [sceneId]);

  // 場景切換時自動唸場景內容（若 TTS 開啟）
  useEffect(() => {
    if (!scene) return;
    if (showFollowUp) return; // followUp modal 開著時不唸
    if (!ttsEnabled) return;
    // 稍微延遲讓翻頁動畫先進來
    const t = setTimeout(() => {
      speakScene({
        location: scene.location,
        speaker: scene.speaker,
        text: scene.text,
      });
    }, 350);
    return () => {
      clearTimeout(t);
      // 切場景前停掉舊的
      stopTts();
    };
  }, [scene?.id, showFollowUp, ttsEnabled]);

  // followUp modal 開啟時唸 followUp 文字
  useEffect(() => {
    if (!showFollowUp) return;
    if (!ttsEnabled) return;
    speakTts(showFollowUp, { rate: 1.05, pitch: 1.1 });
    return () => { stopTts(); };
  }, [showFollowUp, ttsEnabled]);

  function speakCurrentScene() {
    if (!scene) return;
    playSound("tap");
    speakScene({
      location: scene.location,
      speaker: scene.speaker,
      text: scene.text,
    });
  }

  function pauseSpeaking() {
    playSound("toggleOff");
    pauseTts();
  }

  function resumeSpeaking() {
    playSound("tap");
    resumeTts();
  }

  function stopSpeaking() {
    playSound("toggleOff");
    stopTts();
  }

  /** 智慧切換: 沒在播 → 播；播放中 → 暫停；暫停中 → 繼續 */
  function toggleSpeaking() {
    if (ttsStatus.paused) {
      resumeSpeaking();
    } else if (ttsStatus.speaking) {
      pauseSpeaking();
    } else {
      speakCurrentScene();
    }
  }

  // Click choice
  function handleChoice(choice: Choice, index: number) {
    if (!scene || showFollowUp) return;
    if (isPinned) {
      // 被老師 pin 住，記錄投票但不前進
      playSound("pop");
      setPendingVote({ sceneId: scene.id, choiceIndex: index });
      if (classSession) {
        void setStudentVote(classSession.roomCode, classSession.studentUid, scene.id, index);
      }
      return;
    }
    playSound("click");

    const newScores = applyDelta(scores, choice.delta);
    setScores(newScores);

    if (choice.setBranch) setBranch(choice.setBranch);

    const nextId = choice.next ?? scene.next;
    const willEnd = scene.isEnding || !nextId;

    setHistory((h) => [
      ...h,
      { sceneId: scene.id, choiceIndex: index, followUp: choice.followUp, delta: choice.delta },
    ]);

    if (choice.followUp) {
      setShowFollowUp(choice.followUp);
      setPendingNext(willEnd ? { id: "__end__", isEnding: true } : { id: nextId!, isEnding: false });
    } else {
      proceed(willEnd ? "__end__" : nextId!, willEnd, newScores);
    }
  }

  function proceed(nextId: string, isEnding: boolean, finalScores: Scores) {
    if (isEnding || nextId === "__end__") {
      const type = deriveType(finalScores);
      try {
        sessionStorage.setItem(
          "mbti-result",
          JSON.stringify({ scores: finalScores, branch, historyLen: history.length + 1 }),
        );
        // U1 學習歷程冊：跨次 localStorage 紀錄
        const pretest = loadPretestGuess();
        addHistory({
          kind: "mbti",
          type,
          scores: finalScores,
          branch,
          pretestGuess: pretest?.guess,
          pretestMatched: pretest ? countMatchedAxes(pretest.guess, type) : undefined,
        });
      } catch {
        // ignore (private mode etc.)
      }
      // 班級模式：上傳 finalType 到 RTDB
      if (classSession) {
        import("@/lib/classroom-rtdb").then((mod) =>
          mod.setStudentFinalType(classSession.roomCode, classSession.studentUid, type),
        );
      }
      const suffix = classSession ? `?room=${classSession.roomCode}` : "";
      router.push(`/result/${type}${suffix}`);
      return;
    }
    setSceneId(nextId);
    playSound("pageTurn");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 班級模式：上傳當前場景 + 分數
    if (classSession) {
      void updateStudentProgress(classSession.roomCode, classSession.studentUid, {
        currentScene: nextId,
        currentBranch: branch,
        score: finalScores,
      });
    }
  }

  function dismissFollowUp() {
    if (!pendingNext) return;
    const next = pendingNext;
    setShowFollowUp(null);
    setPendingNext(null);
    proceed(next.id, next.isEnding, scores);
  }

  function handleRestart() {
    setSceneId(START_SCENE_ID);
    setScores(initialScores);
    setBranch("main");
    setHistory([]);
    setShowFollowUp(null);
    setPendingNext(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!scene) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-xl mb-4">場景找不到了 😢</p>
          <HomeToButton />
        </div>
      </div>
    );
  }

  // 進度計算 (從 history 推估 + chapter)
  const totalScenes = 30;
  const sceneNum = history.length + 1;

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0, paddingBottom: 0 }}>
      {/* 場景變動時自動切換 BGM track (依當前場景所屬支線) */}
      <BgmController track={scene ? BRANCH_TO_BGM[scene.branch] : "game"} />

      <SiteNav active="/game" ctaLabel="↻ 從頭" ctaHref="#" />

      {/* HUD bar — 新設計 (手機 vertical, desktop 3-col) */}
      <div
        className="game-hud-bar"
        style={{
          background: "#fff",
          border: "2px solid var(--ink)",
          boxShadow: "5px 5px 0 var(--ink)",
          padding: "16px 20px",
          margin: "28px 0 28px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -14,
            left: 16,
            background: "var(--coral)",
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: 800,
            padding: "4px 14px",
          }}
        >
          ◆ NOW PLAYING
        </div>
        <div>
          <div className="hud" style={{ marginBottom: 4 }}>
            CHAPTER {String(scene.chapter).padStart(2, "0")} · ACT {Math.min(sceneNum, 9)}/{totalScenes}
          </div>
          <div className="f-serif" style={{ fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
            {branch === "main" && "開學週 · 主線"}
            {branch === "sport" && "🏃 校隊組 · 汗水與勝負"}
            {branch === "art" && "🎨 藝術組 · 創作與表達"}
            {branch === "study" && "📚 學術組 · 好奇與發現"}
            {branch === "friend" && "🤝 友誼組 · 陪伴與成長"}
            {branch === "service" && "🌍 服務組 · 關心校園外的世界"}
          </div>
        </div>
        {/* Chapter dots — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: TOTAL_CHAPTERS }).map((_, i) => {
            const ch = i + 1;
            const done = ch < scene.chapter;
            const current = ch === scene.chapter;
            return (
              <div key={ch} className="flex items-center">
                <div
                  style={{
                    width: 22,
                    height: 22,
                    border: "2px solid var(--ink)",
                    background: current ? "var(--sunny)" : done ? "var(--coral)" : "var(--paper-2)",
                    color: done ? "#fff" : "var(--ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: current ? "scale(1.15)" : undefined,
                    boxShadow: current ? "0 0 0 3px rgba(212,154,19,0.25)" : undefined,
                  }}
                >
                  {ch}
                </div>
                {i < TOTAL_CHAPTERS - 1 && (
                  <div
                    style={{
                      width: 12,
                      height: 3,
                      background: done ? "var(--coral)" : "var(--paper-2)",
                      borderTop: "1px solid var(--ink)",
                      borderBottom: "1px solid var(--ink)",
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="hud" style={{ marginBottom: 4 }}>PROGRESS</div>
          <div className="f-mono" style={{ fontSize: 18, fontWeight: 800 }}>
            {sceneNum} / {totalScenes}
          </div>
          <button
            onClick={handleRestart}
            style={{
              marginTop: 6,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            ↻ 從頭再玩
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* 班級模式 badge */}
        {classSession && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 border-2 border-violet-300 text-violet-800">
              🎓 班級模式 ・ 房號 {classSession.roomCode}
            </span>
          </div>
        )}

        {/* 老師 Pin 提示 */}
        {isPinned && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl p-4 mb-4 shadow-lg border-4 border-white"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">📌</span>
              <div>
                <div className="font-black text-lg">老師正在引導大家討論</div>
                <div className="text-sm opacity-95">
                  {pinReason || "請等老師讓大家繼續，先想想你想選什麼"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 透視容器：讓子層的翻頁感保留 */}
        <div style={{ perspective: 1400 }} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, rotateY: 30, x: 100, scale: 0.92 }}
            animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -30, x: -100, scale: 0.92 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "center center", transformStyle: "preserve-3d" }}
            className="stage"
          >
            {/* Stage background — 場景 SVG + 大 emoji + 角落紙膠帶 */}
            <div className="stage-bg" style={{ background: "linear-gradient(135deg, var(--tape-sky) 0%, var(--tape-mint) 50%, var(--tape-sunny) 100%)" }}>
              <span className="stage-corner-tape tl"></span>
              <span className="stage-corner-tape tr"></span>
              <SceneBackground location={scene.location} bgEmoji={scene.bg} />
              <span className="stage-emoji" style={{ position: "relative", zIndex: 1 }}>{scene.bg}</span>
              <span className="stage-loc-tag">▸ <RubyText>{scene.location}</RubyText></span>
              <span className="stage-ch-stamp hidden sm:block">SCENE {String(scene.chapter).padStart(2, "0")}</span>
            </div>

            {/* Dialogue area */}
            <div className="scene-dialogue">
              {scene.speaker && (
                <div className="scene-speaker">
                  <div className="avatar">
                    {["小芸", "阿哲", "小傑", "雅雯", "宇航", "凱莉", "小宇", "婷婷"].includes(scene.speaker) ? (
                      <NpcAvatar name={scene.speaker} size={56} />
                    ) : (
                      <span>{scene.speakerEmoji}</span>
                    )}
                  </div>
                  <div className="name-block">
                    <div className="name"><RubyText>{scene.speaker}</RubyText></div>
                    <div className="role">CHARACTER · {scene.speaker === "你的內心" || scene.speaker === "你的肚子" || scene.speaker === "你" ? "INNER · 你的內心" : "NPC · 同學/老師"}</div>
                  </div>
                </div>
              )}

              {/* TTS 控制工具列 — always visible when TTS on (含旁白場景) */}
              {ttsEnabled && (
                <div className="tts-toolbar">
                  {/* 主切換按鈕：智慧 ▶ / ⏸ / ⏵ */}
                  <button
                    onClick={toggleSpeaking}
                    className="tts-btn-main"
                    title={
                      ttsStatus.paused
                        ? "繼續播放"
                        : ttsStatus.speaking
                          ? "暫停 (之後可繼續)"
                          : "從頭唸這段"
                    }
                  >
                    <span className="tts-btn-icon">
                      {ttsStatus.paused ? "▶" : ttsStatus.speaking ? "⏸" : "🔊"}
                    </span>
                    <span className="tts-btn-label">
                      {ttsStatus.paused ? "繼續播放" : ttsStatus.speaking ? "暫停" : "唸給我聽"}
                    </span>
                  </button>

                  {/* 從頭再唸 (即使在暫停中也能重來) */}
                  {(ttsStatus.speaking || ttsStatus.paused) && (
                    <button
                      onClick={speakCurrentScene}
                      className="tts-btn-secondary"
                      title="從頭再唸一次"
                    >
                      <span style={{ fontSize: 16 }}>↻</span>
                      <span className="hidden sm:inline">從頭</span>
                    </button>
                  )}

                  {/* 停止 (整段取消) */}
                  {(ttsStatus.speaking || ttsStatus.paused) && (
                    <button
                      onClick={stopSpeaking}
                      className="tts-btn-secondary"
                      title="停止朗讀（不會繼續）"
                    >
                      <span style={{ fontSize: 14 }}>✕</span>
                      <span className="hidden sm:inline">停止</span>
                    </button>
                  )}

                  {/* 狀態顯示 (mono HUD 風格) */}
                  <div className="tts-status">
                    <span className={`tts-dot ${ttsStatus.paused ? "paused" : ttsStatus.speaking ? "live" : ""}`}></span>
                    <span className="hud" style={{ color: "var(--muted)", letterSpacing: 2 }}>
                      {ttsStatus.paused ? "PAUSED" : ttsStatus.speaking ? "▸ NOW READING" : "READY"}
                    </span>
                  </div>
                </div>
              )}

              <div className="dialogue-text zhuyin-spaced">
                {scene.text.map((p, i) => (
                  <p key={i}>
                    <RubyText>{p}</RubyText>
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Choices */}
        <div className="choices-header">▸ YOUR CHOICE · 你會怎麼做？</div>
        <div>
          {scene.choices.map((c, i) => {
            const isVoted = pendingVote && pendingVote.sceneId === sceneId && pendingVote.choiceIndex === i;
            const key = String.fromCharCode(65 + i); // A, B, C, D
            return (
              <motion.button
                key={i}
                onClick={() => handleChoice(c, i)}
                disabled={!!showFollowUp}
                whileTap={{ scale: 0.98 }}
                className="choice-scene"
                style={
                  isVoted
                    ? { borderColor: "var(--rose)", background: "#fde3ea", boxShadow: "5px 5px 0 var(--rose)" }
                    : undefined
                }
              >
                <div className="emoji-box">
                  {c.emoji && <span>{c.emoji}</span>}
                </div>
                <div className="choice-text">
                  <RubyText>{c.text}</RubyText>
                </div>
                <div className="choice-meta">
                  {isVoted ? (
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "var(--rose)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 900,
                      fontFamily: "var(--font-mono)",
                    }}>
                      ✓ 已投
                    </span>
                  ) : (
                    <>
                      <span className="choice-key">{key}</span>
                      <span className="choice-arr">→</span>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {isPinned && pendingVote && pendingVote.sceneId === sceneId && (
          <p
            style={{
              fontSize: 12,
              color: "var(--rose)",
              marginTop: 12,
              textAlign: "center",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              letterSpacing: 1,
            }}
          >
            💡 你已投票，等老師結束討論後會自動往下走（可改投別的選項）
          </p>
        )}

        {/* Floor info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            marginTop: 20,
            borderTop: "1.5px dashed var(--line-strong)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: 2,
            color: "var(--muted)",
          }}
        >
          <span>▸ 沒有正確答案，跟著直覺走</span>
        </div>
      </div>

      {/* 課前快測 modal (只在開頭顯示一次) */}
      <AnimatePresence>
        {showPretest && <PretestQuiz onDone={() => setShowPretest(false)} />}
      </AnimatePresence>

      {/* Follow-up modal */}
      <AnimatePresence>
        {showFollowUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={dismissFollowUp}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-3 text-center">✨</div>
              <p className="text-base sm:text-xl text-center leading-relaxed text-[var(--color-ink)] zhuyin-spaced">
                <RubyText>{showFollowUp}</RubyText>
              </p>
              <SoundButton
                sound="whoosh"
                onClick={dismissFollowUp}
                className="btn-3d mt-6 w-full py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black text-lg hover:bg-[var(--color-coral)]/90"
              >
                繼續故事 →
              </SoundButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
