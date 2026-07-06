"use client";

import Link from "next/link";
import { createPortfolio } from "./actions";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function LibraryHeader({
  greeting,
  userName,
  query,
  onQueryChange,
  mostRecentPortfolioId,
  hasPortfolios,
}: {
  greeting: string;
  userName: string;
  query: string;
  onQueryChange: (value: string) => void;
  mostRecentPortfolioId: string | null;
  hasPortfolios: boolean;
}) {
  return (
    <header className="library-texture relative overflow-hidden border-b border-ground-line px-6 py-12 sm:px-10 sm:py-16 xl:px-16">
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full border border-ember-soft/50 bg-gradient-to-br from-ember-soft/30 to-transparent font-display text-lg italic text-ember">
              {initials(userName)}
            </span>
            <div>
              <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ember uppercase">{greeting}</p>
              <h1 className="mt-1 font-display text-3xl font-medium text-ink italic sm:text-4xl">
                {userName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPortfolios && mostRecentPortfolioId && (
              <Link
                href={`/dashboard/${mostRecentPortfolioId}/overview`}
                className="rounded-lg border border-ground-line px-4 py-2.5 text-sm text-ink-dim transition-colors hover:border-ember-soft hover:text-ink"
              >
                Recent activity
              </Link>
            )}
            <button
              type="button"
              disabled
              title="Importing an existing portfolio file is coming soon"
              className="cursor-not-allowed rounded-lg border border-ground-line px-4 py-2.5 text-sm text-ink-faint"
            >
              Import Portfolio
              <span className="ml-1.5 font-meta text-[0.55rem] tracking-[0.06em] uppercase">Soon</span>
            </button>
            <form action={createPortfolio}>
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] shadow-[0_10px_40px_-16px_rgba(227,161,92,0.5)] transition-transform hover:scale-[1.02]"
              >
                + New Portfolio
              </button>
            </form>
          </div>
        </div>

        {hasPortfolios && (
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search your portfolios"
            className="w-full max-w-md rounded-lg border border-ground-line bg-ground-raised/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
          />
        )}
      </div>
    </header>
  );
}
