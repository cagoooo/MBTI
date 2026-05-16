import Link from "next/link";

export default function HomeToButton({ label = "回主頁" }: { label?: string }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border-2 border-[var(--color-ink)]/15 text-sm font-bold text-[var(--color-ink)] hover:bg-white hover:border-[var(--color-coral)]/40 transition"
    >
      <span aria-hidden>←</span>
      <span>{label}</span>
    </Link>
  );
}
