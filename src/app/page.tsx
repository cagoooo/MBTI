import Link from "next/link";
import SoundLink from "@/components/SoundLink";
import { MBTI_GROUPS } from "@/lib/mbti";
import CampusIntro from "@/components/CampusIntro";
import BgmController from "@/components/BgmController";

export default function HomePage() {
  return (
    <div className="flex flex-col has-floating-ui">
      <BgmController track="home" />
      {/* Hero */}
      <section className="relative px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 text-7xl animate-float-slow opacity-30">🏫</div>
          <div className="absolute top-32 right-12 text-6xl animate-wiggle opacity-30">📚</div>
          <div className="absolute bottom-10 left-1/4 text-7xl animate-float-slow opacity-30">🎨</div>
          <div className="absolute bottom-20 right-1/4 text-7xl animate-wiggle opacity-30">⚽</div>
          <div className="absolute top-1/2 left-1/2 text-8xl opacity-10">🎭</div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <p className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border-2 border-[var(--color-coral)]/30 text-xs sm:text-sm font-bold text-[var(--color-coral)] uppercase tracking-wider animate-pop-in">
            ✨ 不是無聊問卷，是一場校園冒險 ✨
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-tight">
            <span className="shimmer-text">MBTI</span>
            <br />
            <span className="text-[var(--color-ink)]">校園奇遇記</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-ink)]/80 max-w-2xl mx-auto leading-relaxed">
            背起書包走進校園，從開學第一天到校慶大結局
            <br className="hidden sm:block" />
            每個選擇都會改變你的故事走向，最後揭曉你的{" "}
            <span className="font-bold text-[var(--color-coral)]">16 型人格</span> ✨
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SoundLink
              href="/game"
              sound="click"
              className="btn-3d inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--color-coral)] text-white text-xl font-black hover:bg-[var(--color-coral)]/90"
            >
              <span className="text-2xl">🚀</span>
              <span>開始冒險</span>
            </SoundLink>
            <SoundLink
              href="/types"
              sound="tap"
              className="btn-3d inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-xl font-black text-[var(--color-ink)] hover:border-[var(--color-coral)]/40"
            >
              <span className="text-2xl">🔍</span>
              <span>16 型介紹</span>
            </SoundLink>
            <SoundLink
              href="/match"
              sound="tap"
              className="btn-3d inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-[var(--color-ink)]/15 text-xl font-black text-[var(--color-ink)] hover:border-[var(--color-coral)]/40"
            >
              <span className="text-2xl">🤝</span>
              <span>麻吉配對</span>
            </SoundLink>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-ink)]/60">
            <span className="flex items-center gap-1.5">
              <span>⏱️</span> 約 10 分鐘
            </span>
            <span className="flex items-center gap-1.5">
              <span>🎭</span> 30+ 場景
            </span>
            <span className="flex items-center gap-1.5">
              <span>🌳</span> 4 條支線
            </span>
            <span className="flex items-center gap-1.5">
              <span>🎯</span> 16 種結局
            </span>
          </div>
        </div>
      </section>

      {/* Campus intro animation */}
      <CampusIntro />

      {/* How it works */}
      <section className="px-6 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-10">
            🎮 怎麼玩？
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: "📖", title: "1. 讀故事", desc: "進入校園情境，跟著主角體驗開學週" },
              { emoji: "✋", title: "2. 做選擇", desc: "每個情境有 3~4 個選項，跟著直覺走" },
              { emoji: "✨", title: "3. 看結果", desc: "最後揭曉你的 MBTI 與校園角色" },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white rounded-3xl p-6 border-2 border-[var(--color-ink)]/10 hover:border-[var(--color-coral)]/30 transition shadow-sm"
              >
                <div className="text-5xl mb-3">{step.emoji}</div>
                <h3 className="text-xl font-black mb-2">{step.title}</h3>
                <p className="text-[var(--color-ink)]/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 branches preview */}
      <section className="px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            🌳 四條支線，故事不一樣
          </h2>
          <p className="text-center text-[var(--color-ink)]/70 mb-10 text-lg">
            開學第二週，你會在「社團博覽會」做一個重要選擇
            <br />
            你選哪條路，就會看到不同的校園生活
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "🏃", name: "校隊組", color: "from-amber-200 to-orange-300", desc: "汗水與勝負" },
              { emoji: "🎨", name: "藝術組", color: "from-rose-200 to-pink-300", desc: "創作與表達" },
              { emoji: "📚", name: "學術組", color: "from-sky-200 to-blue-300", desc: "好奇與發現" },
              { emoji: "🤝", name: "友誼組", color: "from-emerald-200 to-teal-300", desc: "陪伴與成長" },
            ].map((b) => (
              <div
                key={b.name}
                className={`bg-gradient-to-br ${b.color} rounded-3xl p-6 text-center border-2 border-white/60 shadow-sm hover:scale-105 transition`}
              >
                <div className="text-5xl mb-2">{b.emoji}</div>
                <div className="text-lg font-black">{b.name}</div>
                <div className="text-sm text-[var(--color-ink)]/70 mt-1">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16 types preview */}
      <section className="px-6 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            🧬 16 種人格，你是哪一種？
          </h2>
          <p className="text-center text-[var(--color-ink)]/70 mb-10 text-lg">
            每種人格在校園裡都有自己的舞台
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MBTI_GROUPS.map((g) => (
              <div
                key={g.name}
                className={`bg-gradient-to-br ${g.color} rounded-3xl p-5 text-center text-[var(--color-ink)] border-2 border-white/60 shadow-sm`}
              >
                <div className="text-4xl mb-2">{g.emoji}</div>
                <div className="font-black text-lg">{g.name}</div>
                <div className="text-sm opacity-80 mt-1">{g.desc}</div>
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {g.types.map((t) => (
                    <Link
                      key={t}
                      href={`/types/${t}`}
                      className="px-2 py-0.5 rounded-md bg-white/70 hover:bg-white text-xs font-bold transition"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <SoundLink
              href="/types"
              sound="tap"
              className="inline-flex items-center gap-2 text-[var(--color-coral)] font-bold hover:underline"
            >
              看完整 16 型介紹 →
            </SoundLink>
          </div>
        </div>
      </section>

      {/* For teachers / context */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-ink)]/10">
          <h3 className="text-2xl font-black mb-3">💡 給老師、家長</h3>
          <p className="text-[var(--color-ink)]/80 leading-relaxed">
            本網站把 MBTI 心理測驗包裝成校園 RPG，讓國小學生在故事情境裡做選擇，
            不需要回答抽象問卷就能認識自己的人格傾向。
            適合作為班級活動、輔導課、自我認識主題的引導素材。
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 flex-wrap">
            <SoundLink
              href="/teacher/new"
              sound="coin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-black hover:from-violet-600 hover:to-purple-600 transition shadow-md"
            >
              <span className="text-xl">🎓</span>
              <span>建立班級房間（全班同步玩）</span>
              <span>→</span>
            </SoundLink>
            <SoundLink
              href="/class-stats"
              sound="coin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-violet-300 text-violet-700 font-black hover:bg-violet-50 transition"
            >
              <span className="text-xl">📊</span>
              <span>班級 MBTI 統計</span>
            </SoundLink>
            <SoundLink
              href="/join"
              sound="tap"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-amber-300 text-amber-700 font-black hover:bg-amber-50 transition"
            >
              <span className="text-xl">🚪</span>
              <span>學生加入房間</span>
            </SoundLink>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 flex-wrap">
            <SoundLink
              href="/slides"
              sound="whoosh"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-sky-300 text-sky-700 font-black hover:bg-sky-50 transition"
            >
              <span className="text-xl">🎬</span>
              <span>10 張教學投影片（備課直接投影）</span>
            </SoundLink>
            <SoundLink
              href="/worksheet"
              sound="coin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-emerald-300 text-emerald-700 font-black hover:bg-emerald-50 transition"
            >
              <span className="text-xl">📋</span>
              <span>A4 反思學習單（列印給學生）</span>
            </SoundLink>
          </div>
          <p className="text-[var(--color-ink)]/60 text-sm mt-3">
            ⚠️ MBTI 為性格傾向參考，並非心理診斷工具。請以開放、好奇的態度引導孩子探索。
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 text-center">
        <SoundLink
          href="/game"
          sound="click"
          className="btn-3d inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-[var(--color-coral)] text-white text-2xl font-black hover:bg-[var(--color-coral)]/90"
        >
          <span className="text-3xl">🎒</span>
          <span>準備好了，開始！</span>
        </SoundLink>
      </section>
    </div>
  );
}
