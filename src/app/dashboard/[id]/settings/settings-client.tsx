"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updatePortfolio,
  archivePortfolio,
  unarchivePortfolio,
  duplicatePortfolio,
  deletePortfolioPermanently,
} from "../../actions";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

type Portfolio = {
  id: string;
  title: string;
  headline: string | null;
  bio: string | null;
  slug: string;
  archivedAt: string | null;
};

export function SettingsClient({ portfolio }: { portfolio: Portfolio }) {
  const router = useRouter();
  const [title, setTitle] = useState(portfolio.title);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isSavingTitle, startSavingTitle] = useTransition();
  const [isArchiving, startArchiving] = useTransition();
  const [isDuplicating, startDuplicating] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isArchived = !!portfolio.archivedAt;

  function handleSaveTitle(e: FormEvent) {
    e.preventDefault();
    startSavingTitle(async () => {
      // Headline/bio live on the About Me tab now — pass them through
      // unchanged so this form never clobbers them.
      await updatePortfolio(portfolio.id, {
        title,
        headline: portfolio.headline ?? "",
        bio: portfolio.bio ?? "",
      });
      setSavedAt(Date.now());
    });
  }

  function handleArchiveToggle() {
    startArchiving(() => (isArchived ? unarchivePortfolio(portfolio.id) : archivePortfolio(portfolio.id)));
  }

  function handleDuplicate() {
    startDuplicating(async () => {
      await duplicatePortfolio(portfolio.id);
      router.push("/dashboard");
    });
  }

  function handleDeleteConfirmed() {
    startDeleting(async () => {
      await deletePortfolioPermanently(portfolio.id);
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <form onSubmit={handleSaveTitle} className="flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-ground-line bg-transparent px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <p className="mb-1.5 font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase">URL</p>
          <p className="font-meta text-sm text-ink-dim">/p/{portfolio.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSavingTitle}
            className="rounded-sm bg-gradient-to-r from-ember-soft to-ember px-4 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {isSavingTitle ? "Saving…" : "Save changes"}
          </button>
          {savedAt && !isSavingTitle && <span className="text-sm text-ink-faint">Saved.</span>}
        </div>
      </form>

      <div className="flex flex-col gap-3 border-t border-ground-line pt-8">
        <h2 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
          Lifecycle
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className="rounded-lg border border-ground-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-ember-soft hover:text-ember disabled:opacity-60"
          >
            {isArchiving ? "Working…" : isArchived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="rounded-lg border border-ground-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-ember-soft hover:text-ember disabled:opacity-60"
          >
            {isDuplicating ? "Duplicating…" : "Duplicate"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-ground-line pt-8">
        <h2 className="font-meta text-[0.68rem] tracking-[0.1em] text-red-400 uppercase">
          Danger zone
        </h2>
        <p className="text-sm text-ink-dim">
          Permanently deletes this portfolio, every project in it, and all uploaded files. This can&apos;t be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="self-start rounded-lg border border-red-500/40 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          Delete permanently
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete "${portfolio.title}"?`}
        body="This permanently removes the portfolio, every project in it, and all uploaded files. This can't be undone."
        confirmLabel="Delete permanently"
        danger
        isPending={isDeleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
