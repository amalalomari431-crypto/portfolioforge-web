"use client";

import { useState } from "react";
import Link from "next/link";
import {
  softDeleteSection,
  restoreSection,
  reorderSections,
  duplicateSection,
  renameSection,
} from "./actions";
import { OverflowMenu } from "@/components/dashboard/overflow-menu";
import { SUGGESTED_SECTION_TITLES } from "@/lib/validators";

type SectionRow = {
  id: string;
  title: string;
  layoutType: string;
  updatedAt: string; // ISO
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

export function SectionListClient({
  portfolioId,
  projectId,
  initialSections,
}: {
  portfolioId: string;
  projectId: string;
  initialSections: SectionRow[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [dragId, setDragId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const base = `/dashboard/${portfolioId}/projects/${projectId}/sections`;

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const fromIndex = sections.findIndex((s) => s.id === dragId);
    const toIndex = sections.findIndex((s) => s.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...sections];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSections(next);
    setDragId(null);
    void reorderSections(projectId, next.map((s) => s.id));
  }

  async function handleDelete(section: SectionRow) {
    if (!confirm(`"${section.title}" will be removed. You can undo right after.`)) return;
    setSections((prev) => prev.filter((s) => s.id !== section.id));
    await softDeleteSection(section.id);

    setTimeout(() => {
      if (confirm(`"${section.title}" deleted. Undo?`)) {
        restoreSection(section.id).then(() => {
          setSections((prev) => [...prev, section]);
        });
      }
    }, 50);
  }

  async function handleDuplicate(section: SectionRow) {
    await duplicateSection(section.id);
    window.location.reload();
  }

  function startRename(section: SectionRow) {
    setRenamingId(section.id);
    setRenameValue(section.title);
  }

  async function commitRename(sectionId: string) {
    const title = renameValue.trim() || "Untitled section";
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)));
    setRenamingId(null);
    await renameSection(sectionId, title);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${base}/new`}
          className="whitespace-nowrap rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
        >
          + Add Section
        </Link>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SECTION_TITLES.map((title) => (
            <Link
              key={title}
              href={`${base}/new?title=${encodeURIComponent(title)}`}
              className="rounded-full border border-ground-line px-3 py-1 text-xs text-ink-dim transition-colors hover:border-ember-soft hover:text-ember"
            >
              {title}
            </Link>
          ))}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ground-line bg-ground-raised/20 px-6 py-16 text-center">
          <p className="font-display text-xl text-ink italic">Build this project page by page</p>
          <p className="max-w-sm text-sm text-ink-dim">
            Start with a Cover, then add Concept, Site Analysis, Plans — whatever tells this
            project&apos;s story.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable={renamingId !== section.id}
              onDragStart={() => setDragId(section.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(section.id)}
              className="group flex items-center gap-4 rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/40 to-transparent px-4 py-3.5 transition-colors hover:border-ember-soft"
            >
              <span aria-hidden className="w-6 text-center font-meta text-xs text-ink-faint">
                {index + 1}
              </span>
              <span className="cursor-grab font-meta text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                ⠿
              </span>

              <div className="min-w-0 flex-1">
                {renamingId === section.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(section.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(section.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="w-full rounded border border-ember-soft bg-ground-raised/40 px-2 py-1 text-sm text-ink focus:outline-none"
                  />
                ) : (
                  <Link href={`${base}/${section.id}`} className="block">
                    <span className="truncate font-editorial font-medium text-ink">{section.title}</span>
                    <span className="ml-2 font-meta text-[0.6rem] tracking-[0.04em] text-ink-faint uppercase">
                      {section.layoutType} · {formatRelative(section.updatedAt)}
                    </span>
                  </Link>
                )}
              </div>

              <OverflowMenu
                actions={[
                  { label: "Rename", onClick: () => startRename(section) },
                  { label: "Duplicate", onClick: () => handleDuplicate(section) },
                  { label: "Delete", onClick: () => handleDelete(section), danger: true },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
