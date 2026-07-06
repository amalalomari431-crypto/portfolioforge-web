"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatusIndicator, type SaveStatus } from "@/components/save-status-indicator";
import { saveProject, softDeleteProject, restoreProject, type ProjectDraft } from "../../actions";
import {
  validateRequiredText,
  validateOptionalText,
  validateWebsite,
  MAX_PROJECT_TITLE_LENGTH,
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_ROLE_LENGTH,
} from "@/lib/validators";

const AUTOSAVE_DEBOUNCE_MS = 800;

export type InitialProjectSettings = {
  id: string;
  title: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string;
  tags: string;
  externalLink: string;
  isFeatured: boolean;
};

export function ProjectSettingsClient({
  portfolioId,
  initial,
}: {
  portfolioId: string;
  initial: InitialProjectSettings;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [role, setRole] = useState(initial.role);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [tagsRaw, setTagsRaw] = useState(initial.tags);
  const [externalLink, setExternalLink] = useState(initial.externalLink);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<ProjectDraft | null>(null);
  const flushingRef = useRef(false);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    const draft = pendingRef.current;
    if (!draft) return;
    pendingRef.current = null;
    flushingRef.current = true;
    setStatus("saving");
    try {
      await saveProject(portfolioId, initial.id, draft);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      flushingRef.current = false;
      if (pendingRef.current) {
        void flush();
      }
    }
  }, [portfolioId, initial.id]);

  function queue(draft: ProjectDraft) {
    pendingRef.current = draft;
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void flush();
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function onFieldChange(next: {
    title?: string;
    description?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    tagsRaw?: string;
    externalLink?: string;
    isFeatured?: boolean;
  }) {
    const nextTitle = next.title ?? title;
    const nextDescription = next.description ?? description;
    const nextRole = next.role ?? role;
    const nextStartDate = next.startDate ?? startDate;
    const nextEndDate = next.endDate ?? endDate;
    const nextTagsRaw = next.tagsRaw ?? tagsRaw;
    const nextExternalLink = next.externalLink ?? externalLink;
    const nextIsFeatured = next.isFeatured ?? isFeatured;

    const tErr = validateRequiredText(nextTitle, MAX_PROJECT_TITLE_LENGTH);
    const dErr = validateOptionalText(nextDescription, MAX_PROJECT_DESCRIPTION_LENGTH);
    const rErr = validateOptionalText(nextRole, MAX_PROJECT_ROLE_LENGTH);
    const lErr = validateWebsite(nextExternalLink);

    setTitleError(tErr);
    setDescriptionError(dErr);
    setRoleError(rErr);
    setLinkError(lErr);

    if (tErr || dErr || rErr || lErr) return;

    queue({
      title: nextTitle,
      description: nextDescription,
      role: nextRole,
      startDate: nextStartDate,
      endDate: nextEndDate,
      tagsRaw: nextTagsRaw,
      externalLink: nextExternalLink,
      isFeatured: nextIsFeatured,
    });
  }

  async function handleDelete() {
    if (!confirm(`"${title}" will be removed from your portfolio. You can undo right after.`)) {
      return;
    }
    setIsDeleting(true);
    await softDeleteProject(initial.id);
    setIsDeleting(false);

    router.push(`/dashboard/${portfolioId}/projects`);
    setTimeout(() => {
      if (confirm(`"${title}" deleted. Undo?`)) {
        void restoreProject(initial.id);
      }
    }, 50);
  }

  const tagList = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink italic">Project Settings</h1>
        <SaveStatusIndicator status={status} />
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <label htmlFor="title" className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onFieldChange({ title: e.target.value });
            }}
            className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3.5 py-2.5 text-ink focus:border-ember focus:outline-none"
          />
          {titleError && (
            <p className="mt-1.5 text-xs text-amber-500">
              {titleError === "required" ? "Give this project a title" : `Keep this under ${MAX_PROJECT_TITLE_LENGTH} characters`}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
            Summary
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              onFieldChange({ description: e.target.value });
            }}
            placeholder="A one- or two-line summary shown on the project card — the full case study lives in Sections."
            rows={3}
            className="w-full resize-y rounded-lg border border-ground-line bg-ground-raised/20 px-3.5 py-2.5 text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
          />
          {descriptionError && (
            <p className="mt-1.5 text-xs text-amber-500">Keep this under {MAX_PROJECT_DESCRIPTION_LENGTH} characters</p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="role" className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
              Role
            </label>
            <input
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                onFieldChange({ role: e.target.value });
              }}
              className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3.5 py-2.5 text-ink focus:border-ember focus:outline-none"
            />
            {roleError && <p className="mt-1.5 text-xs text-amber-500">Keep this under {MAX_PROJECT_ROLE_LENGTH} characters</p>}
          </div>

          <div>
            <label htmlFor="link" className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
              External link
            </label>
            <input
              id="link"
              type="url"
              value={externalLink}
              onChange={(e) => {
                setExternalLink(e.target.value);
                onFieldChange({ externalLink: e.target.value });
              }}
              className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3.5 py-2.5 text-ink focus:border-ember focus:outline-none"
            />
            {linkError && <p className="mt-1.5 text-xs text-amber-500">Enter a full URL starting with https://</p>}
          </div>

          <div>
            <label className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
              Timeline
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  onFieldChange({ startDate: e.target.value });
                }}
                className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3 py-2.5 text-sm text-ink focus:border-ember focus:outline-none"
              />
              <span aria-hidden className="text-ink-faint">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  onFieldChange({ endDate: e.target.value });
                }}
                className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3 py-2.5 text-sm text-ink focus:border-ember focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="mb-2 block font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
              Tags
            </label>
            <input
              id="tags"
              value={tagsRaw}
              onChange={(e) => {
                setTagsRaw(e.target.value);
                onFieldChange({ tagsRaw: e.target.value });
              }}
              className="w-full rounded-lg border border-ground-line bg-ground-raised/20 px-3.5 py-2.5 text-ink focus:border-ember focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-faint">Separate with commas — e.g. blender, rendering</p>
            {tagList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span key={tag} className="rounded-full border border-ground-line px-2.5 py-0.5 text-xs text-ink-dim">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-ground-line bg-ground-raised/20 px-5 py-4">
          <span>
            <span className="block text-sm font-medium text-ink">Featured</span>
            <span className="block text-xs text-ink-faint">Highlight this project across your portfolio</span>
          </span>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => {
              setIsFeatured(e.target.checked);
              onFieldChange({ isFeatured: e.target.checked });
            }}
            className="h-5 w-5 accent-ember"
          />
        </label>

        <div className="border-t border-ground-line pt-6">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Delete project"}
          </button>
        </div>
      </div>
    </div>
  );
}
