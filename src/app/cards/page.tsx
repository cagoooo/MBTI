"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import BgmController from "@/components/BgmController";
import { playSound } from "@/lib/sound";
import {
  NPC_CARDS,
  getCardUnlocked,
  setCardFaceUnlocked,
  getOverallStats,
  isAllCardsComplete,
  type NpcCard,
  type CardFace,
} from "@/lib/npc-cards";

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<NpcCard | null>(null);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, Record<CardFace, boolean>>>({});
  const [mounted, setMounted] = useState(false);

  // mount 時讀解鎖狀態 + 第一次造訪自動解鎖所有「basic」面向
  useEffect(() => {
    setMounted(true);
    refresh();
    // visibilitychange — 從其他 tab 玩完 SEL/guess 回來自動更新解鎖狀態
    function onVisibility() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function refresh() {
    for (const card of NPC_CARDS) {
      setCardFaceUnlocked(card.id, "basic");
    }
    autoUnlockFromHistory();
    const refreshed: Record<string, Record<CardFace, boolean>> = {};
    for (const card of NPC_CARDS) {
      refreshed[card.id] = getCardUnlocked(card.id);
    }
    setUnlockedMap(refreshed);
  }

  function autoUnlockFromHistory() {
    if (typeof window === "undefined") return;
    // 完成 MBTI 主故事 → 解鎖 dream
    if (sessionStorage.getItem("mbti-result")) {
      for (const card of NPC_CARDS) setCardFaceUnlocked(card.id, "dream");
    }
    // 完成 SEL → 解鎖 trouble
    if (sessionStorage.getItem("mbti-sel-result")) {
      for (const card of NPC_CARDS) setCardFaceUnlocked(card.id, "trouble");
    }
    // 完成猜朋友 → 解鎖 friendship
    if (sessionStorage.getItem("mbti-guess-result")) {
      for (const card of NPC_CARDS) setCardFaceUnlocked(card.id, "friendship");
    }
  }

  const stats = mounted ? getOverallStats() : null;
  const allDone = mounted && isAllCardsComplete();

  return (
    <div className="container-paper has-floating-ui" style={{ paddingTop: 0 }}>
      <SiteNav active="/cards" />
      <BgmController track="home" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <span
            className="inline-block tape"
            style={{ background: "var(--tape-sunny)", transform: "rotate(-2deg)" }}
          >
            🎴 STATION · 06 · 角色小卡
          </span>
        </div>

        <h1
          className="f-serif text-center"
          style={{
            fontWeight: 900,
            fontSize: "clamp(36px, 8vw, 60px)",
            lineHeight: 1.1,
            margin: "16px 0 8px",
          }}
        >
          認識<span style={{ color: "var(--coral)" }}>12 個</span>校園奇遇 NPC
        </h1>

        <p
          className="f-hand text-center"
          style={{
            fontSize: "clamp(18px, 4vw, 24px)",
            color: "var(--coral)",
            transform: "rotate(-1deg)",
            marginBottom: 16,
          }}
        >
          每張卡有 4 個面向 — 越認識他們，越認識「不一樣」✨
        </p>

        {/* 進度條 */}
        {stats && (
          <div
            style={{
              background: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "5px 5px 0 var(--ink)",
              padding: "16px 18px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div className="hud hud-coral">◆ COLLECTION · 收藏進度</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
                <b>{stats.totalFacesUnlocked}</b> / {stats.totalCards * 4} 面
              </div>
            </div>
            <div
              style={{
                height: 12,
                background: "var(--paper-2)",
                border: "1.5px solid var(--ink)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(stats.totalFacesUnlocked / (stats.totalCards * 4)) * 100}%`,
                  background: "linear-gradient(90deg, var(--coral), var(--sunny))",
                  transition: "width 0.5s",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                marginTop: 12,
                fontSize: 12,
              }}
            >
              <FaceProgress label="🌟 基本面" count={stats.allFacesByType.basic} total={stats.totalCards} />
              <FaceProgress label="💭 夢想" count={stats.allFacesByType.dream} total={stats.totalCards} hint="完成 MBTI 解鎖" />
              <FaceProgress label="🫂 困擾" count={stats.allFacesByType.trouble} total={stats.totalCards} hint="完成 SEL 解鎖" />
              <FaceProgress label="🎁 友情" count={stats.allFacesByType.friendship} total={stats.totalCards} hint="完成猜朋友解鎖" />
            </div>
          </div>
        )}

        {/* 全解鎖獎勵 */}
        {allDone && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              background: "linear-gradient(135deg, var(--tape-sunny), var(--tape-coral))",
              border: "2.5px solid var(--ink)",
              boxShadow: "8px 8px 0 var(--ink)",
              padding: 24,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 8 }}>🌟</div>
            <h2 className="f-serif" style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
              全班拼圖完成!
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8 }}>
              你看完了 12 個同學的 48 個面向 — 你看見了「每個人都不一樣」。<br />
              這就是「多元」的真意 — 不是口號,是對「真實的他」感興趣 💖
            </p>
          </motion.div>
        )}

        {/* 卡片 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {NPC_CARDS.map((card) => {
            const unlocked = unlockedMap[card.id];
            const facesUnlocked = unlocked
              ? Object.values(unlocked).filter(Boolean).length
              : 0;
            return (
              <button
                key={card.id}
                onClick={() => {
                  playSound("pop");
                  setSelectedCard(card);
                }}
                className={`bg-gradient-to-br ${card.color}`}
                style={{
                  border: "2.5px solid var(--ink)",
                  boxShadow: "4px 4px 0 var(--ink)",
                  padding: "16px 12px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  position: "relative",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>{card.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{card.name}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: 1,
                    opacity: 0.7,
                  }}
                >
                  {card.type}
                </div>
                {/* 解鎖星星 */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "var(--ink)",
                    color: "#fff",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 900,
                    border: "2px solid #fff",
                  }}
                >
                  {facesUnlocked}/4
                </div>
              </button>
            );
          })}
        </div>

        {/* 沒解鎖提示 */}
        {mounted && stats && stats.totalFacesUnlocked < stats.totalCards * 4 && (
          <div
            style={{
              background: "var(--paper-warm)",
              borderLeft: "4px solid var(--coral)",
              padding: 14,
              fontSize: 13,
              color: "var(--ink-soft)",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            💡 <b>解鎖更多面向:</b> 完成 <a href="./game/" style={{ color: "var(--coral)", fontWeight: 700 }}>MBTI 主故事</a> 解鎖夢想 / 完成 <a href="./sel/" style={{ color: "var(--coral)", fontWeight: 700 }}>SEL 特別篇</a> 解鎖困擾 / 完成 <a href="./guess/" style={{ color: "var(--coral)", fontWeight: 700 }}>猜朋友</a> 解鎖友情面
          </div>
        )}
      </div>

      {/* 卡片 modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardModal
            card={selectedCard}
            unlocked={unlockedMap[selectedCard.id] || { basic: false, dream: false, trouble: false, friendship: false }}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FaceProgress({ label, count, total, hint }: { label: string; count: number; total: number; hint?: string }) {
  return (
    <div
      style={{
        background: "var(--paper-warm)",
        padding: 8,
        textAlign: "center",
        border: "1px solid var(--line)",
      }}
      title={hint}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>
        {count}/{total}
      </div>
    </div>
  );
}

function CardModal({
  card,
  unlocked,
  onClose,
}: {
  card: NpcCard;
  unlocked: Record<CardFace, boolean>;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 90,
        }}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 24 }}
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(94vw, 480px)",
          maxHeight: "90dvh",
          overflowY: "auto",
          background: "#fff",
          border: "2.5px solid var(--ink)",
          boxShadow: "8px 8px 0 var(--ink)",
          zIndex: 100,
        }}
      >
        {/* 卡頭 */}
        <div
          className={`bg-gradient-to-br ${card.color}`}
          style={{
            padding: "24px 20px",
            position: "relative",
            borderBottom: "2.5px solid var(--ink)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="關閉"
            className="tap-target"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.6)",
              border: "2px solid var(--ink)",
              fontSize: 22,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 64 }}>{card.emoji}</div>
            <div>
              <div className="f-serif" style={{ fontWeight: 900, fontSize: 32 }}>
                {card.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  letterSpacing: 2,
                  opacity: 0.7,
                }}
              >
                {card.type}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 20px 24px", lineHeight: 1.8 }}>
          {/* 🌟 基本面 (永遠解鎖) */}
          <CardFaceBlock
            face="basic"
            unlocked={unlocked.basic}
            icon="🌟"
            label="基本面"
            content={
              <>
                <div style={{ marginBottom: 8 }}>
                  <b>興趣:</b> {card.interests.join(" · ")}
                </div>
                <div style={{ marginBottom: 0 }}>
                  <b>家庭:</b> {card.family}
                </div>
              </>
            }
          />

          <CardFaceBlock
            face="dream"
            unlocked={unlocked.dream}
            icon="💭"
            label="夢想"
            lockHint="完成 MBTI 主故事即可解鎖"
            content={<p>{card.dream}</p>}
          />

          <CardFaceBlock
            face="trouble"
            unlocked={unlocked.trouble}
            icon="🫂"
            label="他在處理的事"
            lockHint="完成 SEL 特別篇即可解鎖"
            content={<p>{card.trouble}</p>}
          />

          <CardFaceBlock
            face="friendship"
            unlocked={unlocked.friendship}
            icon="🎁"
            label="他喜歡的友情"
            lockHint="完成猜朋友即可解鎖"
            content={<p>{card.friendship}</p>}
          />

          {/* 全解鎖才看得到 hint */}
          {unlocked.basic && unlocked.dream && unlocked.trouble && unlocked.friendship && (
            <div
              style={{
                background: "var(--paper-warm)",
                border: "1.5px dashed var(--line-strong)",
                padding: 14,
                marginTop: 16,
                fontSize: 13,
                color: "var(--ink-soft)",
              }}
            >
              <span className="hud hud-coral" style={{ display: "block", marginBottom: 6 }}>
                ◆ HINT
              </span>
              {card.hint}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function CardFaceBlock({
  face,
  unlocked,
  icon,
  label,
  lockHint,
  content,
}: {
  face: CardFace;
  unlocked: boolean;
  icon: string;
  label: string;
  lockHint?: string;
  content: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: unlocked ? "#fff" : "var(--paper-2)",
        border: "2px solid var(--ink)",
        padding: 14,
        marginBottom: 12,
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span>{label}</span>
        {!unlocked && (
          <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>🔒 未解鎖</span>
        )}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
        {unlocked ? content : <p style={{ fontSize: 12, fontStyle: "italic" }}>{lockHint}</p>}
      </div>
    </div>
  );
}
