"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeToButton from "@/components/HomeToButton";
import SoundLink from "@/components/SoundLink";
import { playSound } from "@/lib/sound";
import { MBTI_GROUPS } from "@/lib/mbti";
import appConfig from "../../../app.config";

interface Slide {
  bg: string; // gradient class
  emoji?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  body?: React.ReactNode;
  footer?: string;
}

const SLIDES: Slide[] = [
  // 1. 開場
  {
    bg: "from-amber-300 via-orange-400 to-rose-400",
    emoji: "🎮",
    badge: "今天的課程",
    title: appConfig.siteName,
    subtitle: "玩一場校園 RPG，認識自己的人格類型",
    footer: `by ${appConfig.teacherName} ・ ${appConfig.schoolFullName}`,
  },
  // 2. 學習目標
  {
    bg: "from-sky-300 via-blue-400 to-indigo-500",
    emoji: "🎯",
    badge: "Step 1",
    title: "今天的學習目標",
    body: (
      <ul className="space-y-4 text-left max-w-2xl mx-auto">
        <li className="flex gap-3"><span className="text-3xl">✨</span><span><strong>認識自己</strong>：知道我是怎麼想事情、怎麼跟人相處</span></li>
        <li className="flex gap-3"><span className="text-3xl">🤝</span><span><strong>尊重多元</strong>：別人跟我不一樣，那是「不同」不是「不好」</span></li>
        <li className="flex gap-3"><span className="text-3xl">💡</span><span><strong>練習反思</strong>：玩完想想「我最像哪部分？我想改善什麼？」</span></li>
      </ul>
    ),
  },
  // 3. MBTI 是什麼
  {
    bg: "from-violet-400 via-purple-500 to-fuchsia-500",
    emoji: "❔",
    badge: "Step 2",
    title: "MBTI 是什麼？",
    body: (
      <div className="space-y-6 text-left max-w-2xl mx-auto">
        <p className="text-2xl leading-relaxed">
          MBTI 是一個<strong className="text-yellow-300">「看你怎麼想事情」</strong>的工具，
          把人分成 <strong className="text-yellow-300">16 種</strong>不同風格。
        </p>
        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/30">
          <p className="text-lg leading-relaxed">
            ⚠️ <strong>很重要</strong>：MBTI <strong>不是</strong>分類「好」或「壞」，
            <br />
            而是看「你比較喜歡哪種方式」。
            <br />
            每一種都很棒，也都會變化！
          </p>
        </div>
      </div>
    ),
  },
  // 4. 四個維度
  {
    bg: "from-emerald-400 via-teal-500 to-cyan-600",
    emoji: "🧬",
    badge: "Step 3",
    title: "MBTI 的 4 個維度",
    body: (
      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        {[
          { l: "外向 E", r: "I 內向", desc: "喜歡跟人互動 vs 喜歡獨處充電" },
          { l: "實感 S", r: "N 直覺", desc: "看眼前細節 vs 想像可能性" },
          { l: "思考 T", r: "F 情感", desc: "用邏輯判斷 vs 看人的感受" },
          { l: "判斷 J", r: "P 感知", desc: "事先計畫 vs 隨機應變" },
        ].map((d, i) => (
          <div key={i} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/30">
            <div className="text-xl font-black mb-1">
              <span className="text-yellow-200">{d.l}</span>
              <span className="opacity-50 mx-2">↔</span>
              <span className="text-yellow-200">{d.r}</span>
            </div>
            <div className="text-base opacity-90">{d.desc}</div>
          </div>
        ))}
      </div>
    ),
    footer: "4 個維度組合 → 16 型人格",
  },
  // 5. 16 型彩色 grid
  {
    bg: "from-rose-400 via-pink-500 to-fuchsia-500",
    emoji: "🌈",
    badge: "Step 4",
    title: "16 種人格類型",
    body: (
      <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto">
        {MBTI_GROUPS.flatMap((g) =>
          g.types.map((t) => (
            <div
              key={t}
              className="bg-white/20 backdrop-blur rounded-xl p-3 text-center border border-white/30"
            >
              <div className="text-2xl font-black">{t}</div>
            </div>
          )),
        )}
      </div>
    ),
    footer: "每一種都有自己的超能力，沒有好壞之分",
  },
  // 6. 開始遊戲
  {
    bg: "from-yellow-300 via-orange-400 to-red-500",
    emoji: "🚀",
    badge: "Step 5",
    title: "現在開始玩！",
    body: (
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-2xl">
          掃 QR / 在電腦輸入網址：
        </p>
        <div className="bg-white text-[var(--color-ink)] rounded-3xl p-6 font-black text-3xl font-mono break-all">
          cagoooo.github.io/MBTI
        </div>
        <p className="text-lg opacity-90 leading-relaxed">
          👉 老師若要全班同步玩 + Pin 場景討論：
          <br />
          進「<strong className="text-yellow-200">🎓 建立班級房間</strong>」拿 6 位數房號
        </p>
      </div>
    ),
  },
  // 7. 玩遊戲時的態度
  {
    bg: "from-teal-400 via-emerald-500 to-green-600",
    emoji: "💎",
    badge: "Step 6",
    title: "玩的時候請記得...",
    body: (
      <ul className="space-y-5 text-left max-w-2xl mx-auto text-xl">
        <li className="flex gap-4"><span className="text-3xl shrink-0">✅</span><span><strong>誠實選</strong>，不要故意選「看起來酷的」</span></li>
        <li className="flex gap-4"><span className="text-3xl shrink-0">🚫</span><span><strong>沒有對錯</strong>，每個選擇都會有合適的結果</span></li>
        <li className="flex gap-4"><span className="text-3xl shrink-0">⏱️</span><span><strong>不用想太久</strong>，跟著「第一直覺」走就對了</span></li>
        <li className="flex gap-4"><span className="text-3xl shrink-0">🔁</span><span><strong>可以重玩</strong>，看看不同選擇會走到哪</span></li>
      </ul>
    ),
  },
  // 8. 看完結果後
  {
    bg: "from-fuchsia-500 via-purple-600 to-indigo-700",
    emoji: "📖",
    badge: "Step 7",
    title: "看完結果可以做什麼？",
    body: (
      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        {[
          { icon: "📋", t: "讀詳細介紹", d: "看「我的超能力」「練習成長的地方」" },
          { icon: "🤝", t: "去配對", d: "用「麻吉配對」看跟誰最合拍" },
          { icon: "🖨️", t: "列印學習單", d: "帶回家給家長看，寫反思" },
          { icon: "🔄", t: "再玩一次", d: "下次試試別的選擇，看結果會不會不一樣" },
        ].map((d, i) => (
          <div key={i} className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/30 text-left">
            <div className="text-4xl mb-2">{d.icon}</div>
            <div className="text-xl font-black mb-1">{d.t}</div>
            <div className="text-base opacity-90">{d.d}</div>
          </div>
        ))}
      </div>
    ),
  },
  // 9. 給家長
  {
    bg: "from-rose-300 via-pink-400 to-rose-500",
    emoji: "💌",
    badge: "Step 8 (給家長)",
    title: "請家長記得...",
    body: (
      <div className="space-y-4 max-w-2xl mx-auto text-xl leading-relaxed text-left">
        <p>✨ MBTI <strong>不是人生定型</strong>，會隨著年齡和經驗變化</p>
        <p>💖 看到孩子的型 → 問他「你最像哪一段？」勝過「你怎麼是這型？」</p>
        <p>🌱 把它當作一個<strong>「認識自己的起點」</strong>，不是分類他</p>
        <p>📝 跟孩子聊「你想練習什麼？」帶出成長型思維</p>
      </div>
    ),
  },
  // 10. 結束
  {
    bg: "from-amber-400 via-orange-500 to-red-500",
    emoji: "🎉",
    badge: "結束",
    title: "謝謝大家！",
    subtitle: "你最棒的地方，就是「你是你」",
    body: (
      <div className="mt-8 text-xl opacity-95">
        <p>玩得開心嗎？分享給朋友也來玩看看吧 ✨</p>
        <p className="mt-4 font-mono text-2xl">{appConfig.productionUrl.replace(/^https?:\/\//, "")}</p>
      </div>
    ),
    footer: `Made with ❤️ by ${appConfig.teacherName} @ ${appConfig.schoolFullName}`,
  },
];

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => {
      if (c < SLIDES.length - 1) {
        playSound("pageTurn");
        return c + 1;
      }
      return c;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => {
      if (c > 0) {
        playSound("pageTurn");
        return c - 1;
      }
      return c;
    });
  }, []);

  // 鍵盤導覽
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrent(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrent(SLIDES.length - 1);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  }

  // 監聽 fullscreen 變動
  useEffect(() => {
    function onFs() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const slide = SLIDES[current];
  const progress = ((current + 1) / SLIDES.length) * 100;

  return (
    <div
      className={`fixed inset-0 bg-black text-white overflow-hidden ${
        fullscreen ? "" : "z-30"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg} flex flex-col items-center justify-center p-8 text-center`}
        >
          {slide.badge && (
            <p className="text-base sm:text-lg uppercase tracking-[0.3em] opacity-80 mb-2 drop-shadow">
              {slide.badge}
            </p>
          )}
          {slide.emoji && (
            <div className="text-7xl sm:text-8xl mb-4 drop-shadow-2xl">{slide.emoji}</div>
          )}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-xl mb-3 max-w-5xl">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-xl sm:text-2xl md:text-3xl font-bold opacity-95 mb-6 drop-shadow max-w-3xl">
              {slide.subtitle}
            </p>
          )}
          {slide.body && (
            <div className="mt-4 w-full max-w-5xl text-base sm:text-lg md:text-xl">{slide.body}</div>
          )}
          {slide.footer && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm opacity-70">
              {slide.footer}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 頂部工具列 (滑入式) */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-3 bg-gradient-to-b from-black/40 to-transparent print:hidden opacity-30 hover:opacity-100 transition">
        <div className="flex items-center gap-2">
          <HomeToButton label="離開投影" />
        </div>
        <div className="text-xs font-mono opacity-90">
          {current + 1} / {SLIDES.length}
          <span className="ml-3 opacity-60">← → 翻頁 ・ F 全螢幕 ・ Home/End 跳到頭/尾</span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-sm font-bold"
        >
          {fullscreen ? "⛶ 退出全螢幕" : "⛶ 全螢幕 (F)"}
        </button>
      </div>

      {/* 底部進度條 + 控制按鈕 */}
      <div className="absolute bottom-0 left-0 right-0 z-50 print:hidden">
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center p-3 bg-gradient-to-t from-black/40 to-transparent opacity-30 hover:opacity-100 transition">
          <button
            onClick={prev}
            disabled={current === 0}
            className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 上一張
          </button>
          {/* 進度點點 */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  playSound("tap");
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`第 ${i + 1} 張`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一張 →
          </button>
        </div>
      </div>

      {/* 最後一張顯示「結束 → 回首頁」浮動按鈕 */}
      {current === SLIDES.length - 1 && (
        <SoundLink
          href="/"
          sound="click"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 btn-3d px-6 py-3 rounded-2xl bg-white text-orange-700 font-black text-lg shadow-xl hover:bg-yellow-100"
        >
          🏠 回首頁 開始玩
        </SoundLink>
      )}
    </div>
  );
}
