export function ProgressCard({
  percent,
  isPublished,
  stats,
}: {
  percent: number;
  isPublished: boolean;
  stats: {
    totalProjects: number;
    completedPages: number;
    missingPages: number;
    readyToPublishPercent: number;
  };
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-6 shadow-[0_20px_50px_-30px_rgba(227,161,92,0.25)] backdrop-blur-sm">
      <h3 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
        Portfolio Progress
      </h3>

      <div className="mt-5 flex items-center gap-5">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-ground-line)" strokeWidth="7" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-ember-soft)" />
              <stop offset="100%" stopColor="var(--color-ember)" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <p className="font-display text-3xl font-medium text-ink italic">{percent}%</p>
          <p className="mt-1 font-meta text-[0.65rem] tracking-[0.06em] text-ink-faint uppercase">
            Completion Score
          </p>
        </div>
      </div>


      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ground-line pt-4">
        <div>
          <p className="font-display text-lg font-medium text-ink italic">{stats.totalProjects}</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Total Projects</p>
        </div>
        <div>
          <p className="font-display text-lg font-medium text-ink italic">{stats.completedPages}</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Completed Pages</p>
        </div>
        <div>
          <p className="font-display text-lg font-medium text-ink italic">{stats.missingPages}</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Missing Pages</p>
        </div>
        <div>
          <p className="font-display text-lg font-medium text-ink italic">{stats.readyToPublishPercent}%</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Ready to Publish</p>
        </div>
      </div>
    </div>
  );
}
