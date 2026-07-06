"use client";

import { useMemo, useState, useTransition } from "react";
import {
  togglePublish,
  archivePortfolio,
  unarchivePortfolio,
  duplicatePortfolio,
  deletePortfolioPermanently,
  renamePortfolio,
} from "./actions";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LibraryHeader } from "./library-header";
import { PortfolioCard, type PortfolioCardData } from "./portfolio-card";
import { PortfolioEmptyState } from "./portfolio-empty-state";

export function PortfolioLibrary({
  greeting,
  userName,
  ownerName,
  initialPortfolios,
}: {
  greeting: string;
  userName: string;
  ownerName: string;
  initialPortfolios: PortfolioCardData[];
}) {
  const [portfolios, setPortfolios] = useState(initialPortfolios);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioCardData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = portfolios.filter((p) => !p.archivedAt);
  const archived = portfolios.filter((p) => p.archivedAt);
  const mostRecentId = portfolios[0]?.id ?? null;

  const visibleActive = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active;
    return active.filter((p) => p.title.toLowerCase().includes(q));
  }, [active, query]);

  function withPending(id: string, fn: () => Promise<void>) {
    setPendingId(id);
    startTransition(async () => {
      await fn();
      setPendingId(null);
    });
  }

  function handleTogglePublish(p: PortfolioCardData) {
    setPortfolios((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isPublished: !x.isPublished } : x))
    );
    withPending(p.id, () => togglePublish(p.id));
  }

  function handleDuplicate(p: PortfolioCardData) {
    withPending(p.id, async () => {
      await duplicatePortfolio(p.id);
      // The duplicate is a new row this component doesn't know the id of
      // yet — a full refresh is the simplest correct way to pick it up.
      window.location.reload();
    });
  }

  function handleArchiveToggle(p: PortfolioCardData) {
    const archiving = !p.archivedAt;
    setPortfolios((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, archivedAt: archiving ? new Date().toISOString() : null } : x
      )
    );
    withPending(p.id, () => (archiving ? archivePortfolio(p.id) : unarchivePortfolio(p.id)));
  }

  function handleRenameCommit(p: PortfolioCardData, title: string) {
    setPortfolios((prev) => prev.map((x) => (x.id === p.id ? { ...x, title } : x)));
    withPending(p.id, () => renamePortfolio(p.id, title));
  }

  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setPortfolios((prev) => prev.filter((x) => x.id !== target.id));
    withPending(target.id, () => deletePortfolioPermanently(target.id));
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <LibraryHeader
          greeting={greeting}
          userName={userName}
          query={query}
          onQueryChange={setQuery}
          mostRecentPortfolioId={null}
          hasPortfolios={false}
        />
        <PortfolioEmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <LibraryHeader
        greeting={greeting}
        userName={userName}
        query={query}
        onQueryChange={setQuery}
        mostRecentPortfolioId={mostRecentId}
        hasPortfolios
      />

      <div className="flex flex-1 flex-col gap-10 px-6 py-10 sm:px-10 xl:px-16">
        {visibleActive.length === 0 ? (
          <p className="text-ink-faint">No portfolios match &ldquo;{query}&rdquo;.</p>
        ) : (
          <div data-testid="portfolio-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {visibleActive.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                ownerName={ownerName}
                isPending={isPending && pendingId === p.id}
                onTogglePublish={() => handleTogglePublish(p)}
                onDuplicate={() => handleDuplicate(p)}
                onArchiveToggle={() => handleArchiveToggle(p)}
                onDeleteRequest={() => setDeleteTarget(p)}
                onRenameCommit={(title) => handleRenameCommit(p, title)}
              />
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <section className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="self-start font-meta text-[0.68rem] tracking-[0.06em] text-ink-faint uppercase hover:text-ember"
            >
              {showArchived ? "Hide" : "Show"} archived ({archived.length}) {showArchived ? "▲" : "▼"}
            </button>
            {showArchived && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {archived.map((p) => (
                  <PortfolioCard
                    key={p.id}
                    portfolio={p}
                    ownerName={ownerName}
                    isPending={isPending && pendingId === p.id}
                    onTogglePublish={() => handleTogglePublish(p)}
                    onDuplicate={() => handleDuplicate(p)}
                    onArchiveToggle={() => handleArchiveToggle(p)}
                    onDeleteRequest={() => setDeleteTarget(p)}
                    onRenameCommit={(title) => handleRenameCommit(p, title)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        body="This permanently removes the portfolio, every project in it, and all uploaded files. This can't be undone."
        confirmLabel="Delete permanently"
        danger
        isPending={isPending && pendingId === deleteTarget?.id}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
