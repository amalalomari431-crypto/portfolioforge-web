"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OverflowMenu } from "@/components/dashboard/overflow-menu";

export type PortfolioCardData = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  archivedAt: string | null;
  updatedAt: string; // ISO
  createdAt: string; // ISO
  projectCount: number;
  pageCount: number;
  readingMinutes: number;
  completionPercent: number;
  coverImageUrl: string | null;
};

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

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "P";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function PortfolioCard({
  portfolio,
  ownerName,
  isPending,
  onTogglePublish,
  onDuplicate,
  onArchiveToggle,
  onDeleteRequest,
  onRenameCommit,
}: {
  portfolio: PortfolioCardData;
  ownerName: string;
  isPending: boolean;
  onTogglePublish: () => void;
  onDuplicate: () => void;
  onArchiveToggle: () => void;
  onDeleteRequest: () => void;
  onRenameCommit: (title: string) => void;
}) {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(portfolio.title);

  const overviewHref = `/dashboard/${portfolio.id}/overview`;
  const statusLabel = portfolio.archivedAt ? "Archived" : portfolio.isPublished ? "Published" : "Draft";

  function commitRename() {
    setIsRenaming(false);
    const next = renameValue.trim();
    if (next && next !== portfolio.title) onRenameCommit(next);
    else setRenameValue(portfolio.title);
  }

  function handleViewLive() {
    if (portfolio.isPublished) {
      window.open(`/p/${portfolio.slug}`, "_blank", "noopener,noreferrer");
    } else {
      router.push(`/dashboard/${portfolio.id}/publish`);
    }
  }

  return (
    <motion.div
      layout
      data-testid="portfolio-card"
      data-portfolio-id={portfolio.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.7)] transition-shadow hover:border-ember-soft hover:shadow-[0_25px_55px_-25px_rgba(227,161,92,0.25)]"
    >
      <Link href={overviewHref} className="block">
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#241d2c] via-[#171319] to-ground">
          {portfolio.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.coverImageUrl}
              alt=""
              aria-hidden
              className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-3xl italic text-ink-faint/40">
                {initials(portfolio.title)}
              </span>
            </div>
          )}
          <span
            className={
              statusLabel === "Published"
                ? "absolute top-2.5 left-2.5 rounded-full border border-ember-soft/60 bg-ground/80 px-2 py-0.5 font-meta text-[0.58rem] tracking-[0.06em] text-ember uppercase backdrop-blur-sm"
                : "absolute top-2.5 left-2.5 rounded-full border border-ground-line bg-ground/80 px-2 py-0.5 font-meta text-[0.58rem] tracking-[0.06em] text-ink-faint uppercase backdrop-blur-sm"
            }
          >
            {statusLabel}
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-2 px-4 pt-3 pb-2.5">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setRenameValue(portfolio.title);
                setIsRenaming(false);
              }
            }}
            className="w-full rounded border border-ember-soft bg-ground-raised/40 px-2 py-1 font-display text-base italic text-ink focus:outline-none"
          />
        ) : (
          <Link href={overviewHref}>
            <h3 className="truncate font-display text-base font-medium text-ink italic">
              {portfolio.title}
            </h3>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-meta text-[0.6rem] tracking-[0.03em] text-ink-faint uppercase">
          <span>
            {portfolio.projectCount} project{portfolio.projectCount === 1 ? "" : "s"}
          </span>
          <span aria-hidden>·</span>
          <span>
            {portfolio.pageCount} page{portfolio.pageCount === 1 ? "" : "s"}
          </span>
          <span aria-hidden>·</span>
          <span>~{portfolio.readingMinutes} min read</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ground-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-soft to-ember transition-all duration-500"
              style={{ width: `${portfolio.completionPercent}%` }}
            />
          </div>
          <span className="font-meta text-[0.6rem] text-ink-faint">{portfolio.completionPercent}%</span>
        </div>

        <p className="font-meta text-[0.6rem] tracking-[0.03em] text-ink-faint uppercase">
          Last edited {formatRelative(portfolio.updatedAt)} · Created {formatShortDate(portfolio.createdAt)}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-ground-line px-4 py-2.5">
        <Link
          href={overviewHref}
          className="font-meta text-[0.68rem] tracking-[0.06em] text-ember uppercase hover:underline"
        >
          Continue →
        </Link>
        <OverflowMenu
          isPending={isPending}
          actions={[
            { label: "Edit", onClick: () => router.push(overviewHref) },
            { label: "Rename", onClick: () => { setRenameValue(portfolio.title); setIsRenaming(true); } },
            { label: "Duplicate", onClick: onDuplicate },
            { label: portfolio.isPublished ? "Unpublish" : "Publish", onClick: onTogglePublish },
            { label: portfolio.archivedAt ? "Unarchive" : "Archive", onClick: onArchiveToggle },
            { label: "Download PDF", onClick: () => router.push(`/dashboard/${portfolio.id}/generate`) },
            { label: "View Live", onClick: handleViewLive },
            { label: "Delete", onClick: onDeleteRequest, danger: true },
          ]}
        />
      </div>

      <div className="border-t border-ground-line px-4 py-2 font-meta text-[0.56rem] tracking-[0.03em] text-ink-faint uppercase">
        {ownerName} · {portfolio.isPublished ? "Public" : "Private"} · Last opened{" "}
        {formatRelative(portfolio.updatedAt)}
      </div>
    </motion.div>
  );
}
