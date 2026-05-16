import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_TYPES, type MBTIType } from "@/lib/types";
import { getMBTIInfo } from "@/lib/mbti";
import HomeToButton from "@/components/HomeToButton";

export function generateStaticParams() {
  return ALL_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase();
  if (!ALL_TYPES.includes(upper as MBTIType)) return { title: "MBTI 校園奇遇記" };
  const info = getMBTIInfo(upper as MBTIType);
  return {
    title: `${upper} ${info.nickname} 完整介紹 ｜ MBTI 校園奇遇記`,
    description: info.oneLiner,
  };
}

export default async function TypeDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const upper = type.toUpperCase() as MBTIType;
  if (!ALL_TYPES.includes(upper)) notFound();

  const info = getMBTIInfo(upper);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <HomeToButton />
          <Link
            href="/types"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border-2 border-[var(--color-ink)]/15 text-sm font-bold hover:border-[var(--color-coral)]/40"
          >
            ← 回 16 型總覽
          </Link>
        </div>

        {/* Hero */}
        <section className={`bg-gradient-to-br ${info.gradient} rounded-[2rem] p-8 sm:p-12 text-center shadow-xl border-4 border-white/60 relative overflow-hidden`}>
          <div className="absolute top-4 right-4 text-7xl opacity-20">{info.emoji}</div>
          <div className="text-7xl mb-3">{info.emoji}</div>
          <h1 className="text-6xl sm:text-7xl font-black text-white drop-shadow-lg mb-2">{info.type}</h1>
          <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow mb-3">{info.nickname}</h2>
          <p className="text-lg text-white/95 max-w-xl mx-auto leading-relaxed font-medium drop-shadow">{info.oneLiner}</p>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><span>🏫</span> 在校園裡的角色</h3>
          <p className="text-lg italic text-[var(--color-ink)]/80 mb-4">「{info.campusRole}」</p>
          <div className="space-y-3 text-[var(--color-ink)]/90 leading-relaxed">
            {info.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <section className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-emerald-900"><span>💪</span> 超能力</h3>
            <ul className="space-y-2 text-emerald-900/90">
              {info.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>{s}</span></li>
              ))}
            </ul>
          </section>
          <section className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200">
            <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-amber-900"><span>🌱</span> 可以練習的地方</h3>
            <ul className="space-y-2 text-amber-900/90">
              {info.watchOut.map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">→</span><span>{s}</span></li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><span>🚀</span> 適合的未來方向</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {info.futureJobs.map((j) => (
              <span key={j} className="px-3 py-1.5 rounded-full bg-[var(--color-cream)] border border-[var(--color-ink)]/10 text-sm font-bold">{j}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><span>⭐</span> 同類名人</h3>
          <div className="flex flex-wrap gap-2">
            {info.famous.map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-200 text-sm font-bold">{f}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-4 flex items-center gap-2"><span>🤝</span> 相處夥伴</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-rose-600 mb-2">💖 最合拍</p>
              <div className="flex flex-wrap gap-2">
                {info.bestMatches.map((m) => (
                  <Link key={m} href={`/types/${m}`} className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-200 text-sm font-black text-rose-800 transition">
                    {m} {getMBTIInfo(m).emoji}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-sky-600 mb-2">🌱 多點耐心</p>
              <div className="flex flex-wrap gap-2">
                {info.growthPartners.map((m) => (
                  <Link key={m} href={`/types/${m}`} className="px-3 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 border border-sky-200 text-sm font-black text-sky-800 transition">
                    {m} {getMBTIInfo(m).emoji}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-violet-200">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-violet-900"><span>💌</span> 給老師、家長的話</h3>
          <p className="text-violet-900/90 leading-relaxed">{info.tipForGrowth}</p>
        </section>

        <section className="mt-8 mb-4 text-center">
          <Link href="/game" className="btn-3d inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white text-lg font-black">
            <span>🎮</span><span>玩故事測測看是不是這型</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
