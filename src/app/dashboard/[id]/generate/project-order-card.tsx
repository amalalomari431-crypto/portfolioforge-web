"use client";

import { useState } from "react";
import { reorderProjects } from "../projects/actions";

type OrderRow = { id: string; title: string; thumbnailUrl: string | null };

// A trimmed copy of ProjectListClient's drag pattern — reordering only, no
// search/create/delete. Calls the same reorderProjects action already used
// by the Projects page, so there is no separate "book order" concept: this
// list and the Projects list always show the same Project.sortOrder.
export function ProjectOrderCard({
  portfolioId,
  initialProjects,
}: {
  portfolioId: string;
  initialProjects: OrderRow[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [dragId, setDragId] = useState<string | null>(null);

  if (projects.length === 0) {
    return <p className="text-sm text-ink-faint">Add a project first to set its order in the book.</p>;
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
    <div className="flex flex-col gap-2">
      {projects.map((project) => (
        <div
          key={project.id}
          data-project-id={project.id}
          draggable
          onDragStart={() => setDragId(project.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(project.id)}
          className="flex cursor-grab items-center gap-3 rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 active:cursor-grabbing"
        >
          <span aria-hidden className="text-ink-faint">
            ⠿
          </span>
          {project.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnailUrl} alt="" className="h-10 w-10 flex-none rounded-md object-cover" />
          ) : (
            <div className="h-10 w-10 flex-none rounded-md bg-ground-line" />
          )}
          <span className="text-sm text-ink">{project.title}</span>
        </div>
      ))}
    </div>
  );
}
