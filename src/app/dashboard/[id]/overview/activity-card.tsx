function formatWhen(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function ActivityCard({ events }: { events: { key: string; label: string; at: string }[] }) {
  return (
    <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-6 backdrop-blur-sm">
      <h3 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
        Recent Activity
      </h3>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-ink-dim">Activity will appear here as you build.</p>
      ) : (
        <ol className="mt-4 flex max-h-72 flex-col gap-4 overflow-y-auto border-l border-ground-line pl-4">
          {events.map((event) => (
            <li key={event.key} className="relative">
              <span aria-hidden className="absolute top-1.5 -left-[1.15rem] h-1.5 w-1.5 rounded-full bg-ember" />
              <p className="text-sm text-ink-dim">{event.label}</p>
              <p className="font-meta text-[0.6rem] tracking-[0.04em] text-ink-faint uppercase">
                {formatWhen(event.at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
