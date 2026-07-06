"use client";

import { useState, FormEvent, useTransition } from "react";
import { updatePortfolio } from "../../actions";

type Portfolio = {
  id: string;
  title: string;
  headline: string | null;
  bio: string | null;
  slug: string;
  isPublished: boolean;
};

export function AboutMeForm({ portfolio }: { portfolio: Portfolio }) {
  const [headline, setHeadline] = useState(portfolio.headline ?? "");
  const [bio, setBio] = useState(portfolio.bio ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      // Title lives on the Settings tab now — pass the portfolio's current
      // title through unchanged so this form never clobbers it.
      await updatePortfolio(portfolio.id, { title: portfolio.title, headline, bio });
      setSavedAt(Date.now());
    });
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-2xl flex-col gap-4">
      <div>
        <label htmlFor="headline" className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase">
          Headline
        </label>
        <input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Product Designer"
          className="w-full rounded-sm border border-ground-line bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="bio" className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className="w-full rounded-sm border border-ground-line bg-transparent px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-gradient-to-r from-ember-soft to-ember px-4 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {savedAt && !isPending && <span className="text-sm text-ink-faint">Saved.</span>}
      </div>
    </form>
  );
}
