import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4 animate-wiggle">🤔</div>
        <h1 className="text-3xl font-black mb-3">迷路了？</h1>
        <p className="text-[var(--color-ink)]/70 mb-6">
          這個頁面好像不在校園地圖上耶。要不要回到校門口重新開始？
        </p>
        <Link
          href="/"
          className="btn-3d inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-coral)] text-white font-black"
        >
          <span>🏫</span>
          <span>回主頁</span>
        </Link>
      </div>
    </div>
  );
}
