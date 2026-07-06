import { createPortfolio } from "./actions";

export function PortfolioEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <svg width="140" height="120" viewBox="0 0 140 120" fill="none" aria-hidden className="opacity-90">
        <rect
          x="18"
          y="34"
          width="80"
          height="60"
          rx="6"
          className="fill-ground-raised stroke-ground-line"
          strokeWidth="1.5"
          transform="rotate(-6 58 64)"
        />
        <rect
          x="34"
          y="24"
          width="88"
          height="66"
          rx="6"
          className="fill-ground-raised stroke-ember-soft"
          strokeWidth="1.5"
        />
        <circle cx="70" cy="50" r="10" className="fill-ember/15 stroke-ember" strokeWidth="1.5" />
        <path
          d="M50 78 L64 62 L78 74 L96 54"
          className="stroke-ember"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <p className="font-display text-2xl text-ink italic sm:text-3xl">Create your first Portfolio</p>
        <p className="mt-2 max-w-sm text-sm text-ink-dim">
          A portfolio is your own workspace for projects, sections, and a real interactive book — start
          with a blank one.
        </p>
      </div>
      <form action={createPortfolio}>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-ember-soft to-ember px-6 py-3 text-sm font-semibold text-[#1a1208] shadow-[0_10px_40px_-16px_rgba(227,161,92,0.5)] transition-transform hover:scale-[1.02]"
        >
          + Begin your first portfolio
        </button>
      </form>
    </div>
  );
}
