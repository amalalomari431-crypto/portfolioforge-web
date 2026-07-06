"use client";

import { useTransition } from "react";
import { togglePublish } from "../../actions";

export function PublishClient({
  portfolioId,
  isPublished,
  slug,
  publishedAt,
}: {
  portfolioId: string;
  isPublished: boolean;
  slug: string;
  publishedAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-6">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${isPublished ? "bg-ember shadow-[0_0_8px_rgba(227,161,92,0.8)]" : "bg-ink-faint"}`}
          />
          <span className="font-meta text-[0.68rem] tracking-[0.06em] text-ink-dim uppercase">
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-dim">
          {isPublished
            ? "This portfolio is live — anyone with the link can view it."
            : "This portfolio is private. Publish it to make it visible to visitors."}
        </p>
        {isPublished && publishedAt && (
          <p className="mt-1 font-meta text-[0.62rem] tracking-[0.04em] text-ink-faint uppercase">
            Published {new Date(publishedAt).toLocaleDateString()}
          </p>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => togglePublish(portfolioId))}
            className="rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isPending ? "Working…" : isPublished ? "Unpublish" : "Publish"}
          </button>
          {isPublished && (
            <a
              href={`/p/${slug}`}
              target="_blank"
              className="font-meta text-[0.7rem] tracking-[0.06em] text-ember uppercase hover:underline"
            >
              View live →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
