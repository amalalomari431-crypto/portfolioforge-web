"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { softDeleteProject, restoreProject, reorderProjects, createProject } from "./actions";

type ProjectRow = {
  id: string;
  title: string;
  isFeatured: boolean;
  updatedAt: string; // ISO
  sectionCount: number;
  thumbnailUrl: string | null;
  readiness: number;
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

export function ProjectListClient({
  portfolioId,
  initialProjects,
}: {
  portfolioId: string;
  initialProjects: ProjectRow[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const reorderEnabled = query.trim() === "";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);

  async function handleDelete(project: ProjectRow) {
    if (!confirm(`"${project.title}" will be removed from your portfolio. You can undo right after.`)) {
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    await softDeleteProject(project.id);

    setTimeout(() => {
      if (confirm(`"${project.title}" deleted. Undo?`)) {
        restoreProject(project.id).then(() => {
          setProjects((prev) => [...prev, project]);
        });
      }
    }, 50);
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const fromIndex = projects.findIndex((p) => p.id === dragId);
    const toIndex = projects.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...projects];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setProjects(next);
    setDragId(null);
    void reorderProjects(portfolioId, next.map((p) => p.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects"
          className="flex-1 rounded-lg border border-ground-line bg-ground-raised/30 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
        />
        <form action={createProject.bind(null, portfolioId)}>
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
          >
            + New Project
          </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ground-line bg-ground-raised/20 px-6 py-16 text-center">
          <p className="font-display text-xl text-ink italic">Add your first project</p>
          <p className="max-w-sm text-sm text-ink-dim">
            Projects are the heart of your portfolio — start with the work you&apos;re proudest of.
          </p>
          <form action={createProject.bind(null, portfolioId)} className="mt-2 w-full max-w-sm">
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-ember-soft to-ember px-4 py-2.5 text-center text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
            >
              Add your first project
            </button>
          </form>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-ink-faint">No projects match your search</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <div
              key={project.id}
              draggable={reorderEnabled}
              onDragStart={() => setDragId(project.id)}
              onDragOver={(e) => reorderEnabled && e.preventDefault()}
              onDrop={() => reorderEnabled && handleDrop(project.id)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 transition-colors hover:border-ember-soft"
            >
              {reorderEnabled && (
                <span className="absolute top-3 right-3 z-10 cursor-grab font-meta text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                  ⠿
                </span>
              )}
              <Link href={`/dashboard/${portfolioId}/projects/${project.id}`} className="flex flex-1 flex-col">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#241d2c] via-[#171319] to-ground">
                  {project.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.thumbnailUrl} alt="" aria-hidden className="h-full w-full object-cover" />
                  )}
                  {project.isFeatured && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-amber-400 backdrop-blur-sm">★ Featured</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="truncate font-editorial font-semibold text-ink">{project.title}</span>
                  <div className="flex items-center gap-2 font-meta text-[0.62rem] tracking-[0.04em] text-ink-faint uppercase">
                    <span>{project.sectionCount} section{project.sectionCount === 1 ? "" : "s"}</span>
                    <span aria-hidden>·</span>
                    <span>{formatRelative(project.updatedAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-ground-line">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ember-soft to-ember transition-all duration-500"
                        style={{ width: `${project.readiness}%` }}
                      />
                    </div>
                    <span className="font-meta text-[0.6rem] text-ink-faint">{project.readiness}%</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-end border-t border-ground-line px-5 py-3">
                <button onClick={() => handleDelete(project)} className="text-sm text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
