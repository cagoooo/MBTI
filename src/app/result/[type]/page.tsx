import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import StrengthBars from "@/components/StrengthBars";
import HomeToButton from "@/components/HomeToButton";
import ShareButtons from "@/components/ShareButtons";
import PrintSheet from "@/components/PrintSheet";
import PrintButton from "@/components/PrintButton";
import ResultBadgeMount from "@/components/ResultBadgeMount";
import ResultRevealMount from "@/components/ResultRevealMount";
import SoundLink from "@/components/SoundLink";
import BgmController from "@/components/BgmController";
import RubyText from "@/components/RubyText";
import PretestCompare from "@/components/PretestCompare";
import GeminiAnalysis from "@/components/GeminiAnalysis";
import TypeCelebration from "@/components/TypeCelebration";

export function generateStaticParams() {
  return ALL_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase();
  if (!ALL_TYPES.includes(upper as MBTIType)) {
    return { title: "MBTI 校園奇遇記" };
  }
  const info = getMBTIInfo(upper as MBTIType);
  return {
    title: `${upper} ${info.nickname} ｜ MBTI 校園奇遇記`,
    description: info.oneLiner,
  };
}

export default async function ResultPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase() as MBTIType;
  if (!ALL_TYPES.includes(upper)) notFound();

  const info = getMBTIInfo(upper);

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10 has-floating-ui">
      <BgmController track="result" />
      {/* 列印專用：隱藏在螢幕，print 時才顯示 */}
      <PrintSheet info={info} />

      <div className="max-w-4xl mx-auto screen-only">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <HomeToButton />
          <PrintButton />
        </div>

        {/* 賀卡 hero */}
        <section
          className={`bg-gradient-to-br ${info.gradient} rounded-[2rem] p-8 sm:p-12 text-center shadow-xl border-4 border-white/60 relative overflow-hidden min-h-[420px]`}
        >
          {/* 16 型專屬慶祝動畫 (3 秒一次性) */}
          <TypeCelebration type={upper} />
          <div className="absolute top-4 right-4 text-7xl opacity-15 animate-wiggle">{info.emoji}</div>
          <div className="absolute bottom-4 left-4 text-6xl opacity-15 animate-float-slow">✨</div>

          <p className="text-sm sm:text-base font-bold uppercase tracking-[0.3em] text-white/90 mb-2 drop-shadow">
            🎉 你的 MBTI 是
          </p>
          <div className="text-8xl mb-2 animate-pop-in">{info.emoji}</div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg mb-2 no-zhuyin-spacing">
            {info.type}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow mb-4">
            <RubyText>{info.nickname}</RubyText>
          </h2>
          <p className="text-base sm:text-xl text-white/95 max-w-xl mx-auto leading-relaxed font-medium drop-shadow zhuyin-spaced">
            <RubyText>{info.oneLiner}</RubyText>
          </p>
        </section>

        {/* 在校園裡的你 */}
        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10 shadow-sm">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
            <span>🏫</span> <RubyText>在校園裡的你</RubyText>
          </h3>
          <p className="text-lg italic text-[var(--color-ink)]/80 mb-4">
            「<RubyText>{info.campusRole}</RubyText>」
          </p>
          <div className="space-y-3 text-[var(--color-ink)]/90 leading-relaxed">
            {info.description.map((p, i) => (
              <p key={i}><RubyText>{p}</RubyText></p>
            ))}
          </div>
        </section>

        {/* 課前/課後對照 (有做課前快測才會顯示) */}
        <PretestCompare actual={upper} />

        {/* AI 個人化分析 (設了 Gemini API key 才會顯示) */}
        <GeminiAnalysis type={upper} nickname={info.nickname} />

        {/* 強度條 */}
        <section className="mt-6">
          <StrengthBars />
        </section>

        {/* 兩欄：優勢 + 要小心 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <section className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-emerald-900">
              <span>💪</span> 你的超能力
            </h3>
            <ul className="space-y-2 text-emerald-900/90">
              {info.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-amber-900">
              <span>🌱</span> 練習成長的地方
            </h3>
            <ul className="space-y-2 text-amber-900/90">
              {info.watchOut.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 未來職涯 */}
        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
            <span>🚀</span> 未來適合走這些路
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {info.futureJobs.map((j) => (
              <span
                key={j}
                className="px-3 py-1.5 rounded-full bg-[var(--color-cream)] border border-[var(--color-ink)]/10 text-sm font-bold"
              >
                {j}
              </span>
            ))}
          </div>
          <p className="text-sm text-[var(--color-ink)]/60">
            💡 這些只是常見方向，你的興趣和努力才是真正的決定者。
          </p>
        </section>

        {/* 名人 */}
        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
            <span>⭐</span> 你的同類名人
          </h3>
          <div className="flex flex-wrap gap-2">
            {info.famous.map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-200 text-sm font-bold"
              >
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* 配對 */}
        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
            <span>🤝</span> 你的相處夥伴
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-rose-600 mb-2">💖 最合拍的朋友</p>
              <div className="flex flex-wrap gap-2">
                {info.bestMatches.map((m) => (
                  <Link
                    key={m}
                    href={`/types/${m}`}
                    className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-200 text-sm font-black text-rose-800 transition"
                  >
                    {m} {getMBTIInfo(m).emoji}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-sky-600 mb-2">🌱 跟誰相處要多點耐心</p>
              <div className="flex flex-wrap gap-2">
                {info.growthPartners.map((m) => (
                  <Link
                    key={m}
                    href={`/types/${m}`}
                    className="px-3 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 border border-sky-200 text-sm font-black text-sky-800 transition"
                  >
                    {m} {getMBTIInfo(m).emoji}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 徽章牆 */}
        <section className="mt-6">
          <ResultBadgeMount type={upper} />
        </section>

        {/* 分享卡片 */}
        <section className="mt-6">
          <ShareButtons type={upper} nickname={info.nickname} oneLiner={info.oneLiner} emoji={info.emoji} />
        </section>

        {/* 進入時播煙火音效 */}
        <ResultRevealMount />

        {/* 老師的話 */}
        <section className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-violet-200">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-violet-900">
            <span>💌</span> 給老師、家長的話
          </h3>
          <p className="text-violet-900/90 leading-relaxed">{info.tipForGrowth}</p>
        </section>

        {/* CTA */}
        <section className="mt-8 mb-4 flex flex-col sm:flex-row gap-3 justify-center">
          <SoundLink
            href="/game"
            sound="click"
            className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white text-lg font-black hover:bg-[var(--color-coral)]/90"
          >
            <span>↻</span>
            <span>再玩一次（試試不同選擇）</span>
          </SoundLink>
          <SoundLink
            href="/types"
            sound="tap"
            className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-lg font-black hover:border-[var(--color-coral)]/40"
          >
            <span>🔍</span>
            <span>看其他 15 型</span>
          </SoundLink>
        </section>

        <p className="text-center text-sm text-[var(--color-ink)]/50 mt-4">
          ⚠️ MBTI 為性格傾向參考，僅供自我探索，並非心理診斷工具。
        </p>
      </div>
    </div>
  );
}
