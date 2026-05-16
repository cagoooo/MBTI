interface Props {
  chapter: number;
  total: number;
}

export default function ProgressDots({ chapter, total }: Props) {
  return (
    <div className="flex items-center gap-2 justify-center mb-4 select-none">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isActive = idx === chapter;
        const isPast = idx < chapter;
        return (
          <div
            key={i}
            className={[
              "h-2 rounded-full transition-all duration-300",
              isActive ? "w-10 bg-[var(--color-coral)]" : isPast ? "w-6 bg-[var(--color-coral)]/60" : "w-3 bg-[var(--color-ink)]/15",
            ].join(" ")}
          />
        );
      })}
      <span className="ml-2 text-xs font-bold text-[var(--color-ink)]/60 uppercase tracking-wider">
        Chapter {chapter}/{total}
      </span>
    </div>
  );
}
