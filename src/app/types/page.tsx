import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import { MBTI_GROUPS, getMBTIInfo } from "@/lib/mbti";
import HomeToButton from "@/components/HomeToButton";

export const metadata = {
  title: "16 型 MBTI 介紹 ｜ MBTI 校園奇遇記",
  description: "完整的 16 型 MBTI 人格介紹，每種類型的特質、優勢、適合職業與相處之道。",
};

export default function TypesIndexPage() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <HomeToButton />
        </div>

        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            <span className="shimmer-text">16 型 MBTI</span> 全圖鑑
          </h1>
          <p className="text-lg text-[var(--color-ink)]/70 max-w-2xl mx-auto">
            每種人格都是世界的一塊獨特拼圖。點下卡片看完整介紹。
          </p>
        </header>

        <div className="space-y-8">
          {MBTI_GROUPS.map((group) => (
            <section key={group.name}>
              <div className={`bg-gradient-to-r ${group.color} rounded-2xl p-4 sm:p-5 mb-4`}>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <span className="text-3xl">{group.emoji}</span>
                  <span>{group.name}</span>
                </h2>
                <p className="text-sm text-[var(--color-ink)]/80 mt-1">{group.desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {group.types.map((t) => {
                  const info = getMBTIInfo(t);
                  return (
                    <SoundLink
                      key={t}
                      href={`/types/${t}`}
                      sound="pop"
                      className={`group bg-gradient-to-br ${info.gradient} p-5 rounded-3xl border-4 border-white shadow-md hover:scale-105 transition`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{info.emoji}</span>
                        <span className="text-2xl font-black text-white drop-shadow">{info.type}</span>
                      </div>
                      <p className="text-white font-bold drop-shadow">{info.nickname}</p>
                      <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow">{info.oneLiner}</p>
                      <p className="text-white/80 text-xs mt-3 group-hover:translate-x-1 transition-transform">
                        看完整介紹 →
                      </p>
                    </SoundLink>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 text-center bg-white rounded-3xl p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3">不知道自己是哪一型？</h3>
          <p className="text-[var(--color-ink)]/70 mb-5">
            玩一場 10 分鐘的校園冒險，故事的選擇會告訴你答案 ✨
          </p>
          <SoundLink
            href="/game"
            sound="click"
            className="btn-3d inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--color-coral)] text-white text-xl font-black"
          >
            <span>🚀</span>
            <span>開始冒險</span>
          </SoundLink>
        </section>
      </div>
    </div>
  );
}
