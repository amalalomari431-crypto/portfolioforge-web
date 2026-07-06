function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function QuickStatsCard({
  stats,
}: {
  stats: {
    projects: number;
    pages: number;
    images: number;
    pdfs: number;
    updatedAt: string;
  };
}) {
  const rows = [
    { label: "Projects", value: stats.projects },
    { label: "Pages", value: stats.pages },
    { label: "Images", value: stats.images },
    { label: "PDFs", value: stats.pdfs },
  ];

  return (
    <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-6 backdrop-blur-sm">
      <h3 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Quick Stats</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="font-display text-2xl font-medium text-ink italic">{r.value}</p>
            <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">{r.label}</p>
          </div>
        ))}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-display text-2xl font-medium text-ink-faint/50 italic">0</p>
            <span
              title="AI generation isn't built yet"
              className="rounded-full border border-ground-line px-1.5 py-0.5 font-meta text-[0.5rem] tracking-[0.04em] text-ink-faint uppercase"
            >
              Soon
            </span>
          </div>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">AI Generations</p>
        </div>
        <div>
          <p className="font-display text-base font-medium text-ink italic">{formatRelative(stats.updatedAt)}</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Last edited</p>
        </div>
      </div>
    </div>
  );
}
