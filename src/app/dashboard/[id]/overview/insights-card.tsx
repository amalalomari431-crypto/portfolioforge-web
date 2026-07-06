export function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
          Insights
        </h3>
        <span
          title="Deeper AI-powered analysis is coming with the AI Assistant"
          className="rounded-full border border-ground-line px-2 py-0.5 font-meta text-[0.58rem] tracking-[0.06em] text-ink-faint uppercase"
        >
          AI soon
        </span>
      </div>

      {insights.length === 0 ? (
        <p className="mt-4 text-sm text-ink-dim">
          Nothing outstanding — this portfolio is in good shape.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {insights.map((insight) => (
            <li key={insight} className="flex items-start gap-2.5 text-sm text-ink-dim">
              <span aria-hidden className="mt-0.5 text-ember">
                ✓
              </span>
              {insight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
