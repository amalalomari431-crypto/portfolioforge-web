"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SaveStatusIndicator, type SaveStatus } from "@/components/save-status-indicator";
import { saveSection, softDeleteSection, restoreSection, updateAssetCaption, type SectionDraft } from "../actions";
import { MediaManagerClient } from "../../media/media-manager-client";
import {
  validateRequiredText,
  validateOptionalText,
  MAX_SECTION_TITLE_LENGTH,
  MAX_SECTION_CONTENT_LENGTH,
  MAX_SECTION_AI_NOTES_LENGTH,
} from "@/lib/validators";

const AUTOSAVE_DEBOUNCE_MS = 800;

const LAYOUT_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "full-bleed", label: "Full-bleed image" },
  { value: "gallery", label: "Gallery grid" },
  { value: "text-only", label: "Text only" },
];

export type InitialSection = {
  id: string;
  title: string;
  content: string;
  layoutType: string;
  aiNotes: string;
  assets: { id: string; kind: "IMAGE" | "PDF" | "VIDEO"; fileName: string; sizeBytes: number; viewUrl: string; caption: string | null }[];
} | null;

export function SectionEditorClient({
  portfolioId,
  projectId,
  initial,
  initialTitleFromQuery,
}: {
  portfolioId: string;
  projectId: string;
  initial: InitialSection;
  initialTitleFromQuery?: string;
}) {
  const router = useRouter();
  const isNew = initial === null;

  const [rowId, setRowId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? initialTitleFromQuery ?? "");
  const [layoutType, setLayoutType] = useState(initial?.layoutType ?? "standard");
  const [aiNotes, setAiNotes] = useState(initial?.aiNotes ?? "");

  const [titleError, setTitleError] = useState<string | null>(null);
  const [aiNotesError, setAiNotesError] = useState<string | null>(null);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<SectionDraft | null>(null);
  const flushingRef = useRef(false);
  const rowIdRef = useRef(rowId);
  rowIdRef.current = rowId;

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    const draft = pendingRef.current;
    if (!draft) return;
    pendingRef.current = null;
    flushingRef.current = true;
    setStatus("saving");
    const wasNew = rowIdRef.current === null;
    try {
      const { id } = await saveSection(projectId, rowIdRef.current, draft);
      rowIdRef.current = id;
      setRowId(id);
      setStatus("saved");
      // Same Next.js re-fetch-resets-state issue as the Project Editor —
      // once the section exists, move the URL off the "new" sentinel so
      // subsequent Server Action revalidations fetch the real row.
      if (wasNew) {
        router.replace(`/dashboard/${portfolioId}/projects/${projectId}/sections/${id}`, { scroll: false });
      }
    } catch {
      setStatus("error");
    } finally {
      flushingRef.current = false;
      if (pendingRef.current) {
        void flush();
      }
    }
  }, [portfolioId, projectId, router]);

  function queue(draft: SectionDraft) {
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

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial?.content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "section-tiptap-content min-h-[16rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onFieldChange({ content: editor.getHTML() });
    },
  });

  function onFieldChange(next: {
    title?: string;
    content?: string;
    layoutType?: string;
    aiNotes?: string;
  }) {
    const nextTitle = next.title ?? title;
    const nextContent = next.content ?? editor?.getHTML() ?? "";
    const nextLayoutType = next.layoutType ?? layoutType;
    const nextAiNotes = next.aiNotes ?? aiNotes;

    const tErr = validateRequiredText(nextTitle, MAX_SECTION_TITLE_LENGTH);
    const cErr = validateOptionalText(nextContent, MAX_SECTION_CONTENT_LENGTH);
    const aErr = validateOptionalText(nextAiNotes, MAX_SECTION_AI_NOTES_LENGTH);

    setTitleError(tErr);
    setAiNotesError(aErr);

    if (tErr || cErr || aErr) return; // matches Project Editor: nothing queued while invalid

    queue({
      title: nextTitle,
      content: nextContent,
      layoutType: nextLayoutType,
      aiNotes: nextAiNotes,
    });
  }

  async function handleDelete() {
    if (!rowId) {
      router.push(`/dashboard/${portfolioId}/projects/${projectId}/sections`);
      return;
    }
    if (!confirm(`"${title}" will be removed. You can undo right after.`)) return;
    setIsDeleting(true);
    await softDeleteSection(rowId);
    setIsDeleting(false);

    const idToRestore = rowId;
    const titleAtDelete = title;
    router.push(`/dashboard/${portfolioId}/projects/${projectId}/sections`);
    setTimeout(() => {
      if (confirm(`"${titleAtDelete}" deleted. Undo?`)) {
        void restoreSection(idToRestore);
      }
    }, 50);
  }

  function handleCaptionChange(assetId: string, caption: string) {
    void updateAssetCaption(assetId, caption);
  }

  const assets = initial?.assets ?? [];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10 xl:px-14">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/${portfolioId}/projects/${projectId}/sections`}
          className="font-meta text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase hover:text-ember"
        >
          ← Back to sections
        </Link>
        <SaveStatusIndicator status={status} />
      </div>

      <div>
        <p className="font-meta text-[0.68rem] tracking-[0.1em] text-ember uppercase">
          {isNew && !rowId ? "New section" : "Editing"}
        </p>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onFieldChange({ title: e.target.value });
          }}
          placeholder="Untitled section"
          className="mt-2 w-full bg-transparent font-display text-4xl font-medium text-ink italic placeholder:text-ink-faint focus:outline-none sm:text-5xl"
        />
        {titleError && (
          <p className="mt-2 text-xs text-amber-500">
            {titleError === "required" ? "Give this section a title" : `Keep this under ${MAX_SECTION_TITLE_LENGTH} characters`}
          </p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_16rem]">
        <div className="rounded-2xl border border-ember-soft/40 bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6 sm:p-8">
          <p className="mb-3 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Content</p>
          {editor && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1 border-b border-ground-line pb-3">
                <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
                <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
                <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
                <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
                <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
                <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
                <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;</ToolbarButton>
              </div>
              <EditorContent editor={editor} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-5">
            <label htmlFor="layoutType" className="mb-2 block font-meta text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
              Layout type
            </label>
            <select
              id="layoutType"
              value={layoutType}
              onChange={(e) => {
                setLayoutType(e.target.value);
                onFieldChange({ layoutType: e.target.value });
              }}
              className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-5">
            <label htmlFor="aiNotes" className="mb-2 block font-meta text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
              AI notes
            </label>
            <p className="mb-2 text-xs text-ink-faint">
              Your own notes for this page — reminders, prompts, or context you&apos;ll want later.
            </p>
            <textarea
              id="aiNotes"
              value={aiNotes}
              onChange={(e) => {
                setAiNotes(e.target.value);
                onFieldChange({ aiNotes: e.target.value });
              }}
              rows={4}
              className="w-full resize-y rounded-lg border border-ground-line bg-ground-raised/20 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
            />
            {aiNotesError && <p className="mt-1.5 text-xs text-amber-500">Keep this under {MAX_SECTION_AI_NOTES_LENGTH} characters</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6">
        <p className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
          Images, PDFs &amp; video for this section
        </p>
        {!rowId ? (
          <div className="rounded-xl border border-dashed border-ground-line px-6 py-10 text-center text-sm text-ink-faint">
            Give this section a title first — media can be added right after.
          </div>
        ) : (
          <MediaManagerClient
            projectId={projectId}
            initialAssets={assets}
            sectionId={rowId}
            onCaptionChange={handleCaptionChange}
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="self-start text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
      >
        {isDeleting ? "Deleting…" : "Delete section"}
      </button>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // A plain click blurs the ProseMirror contenteditable before this
      // handler runs, so editor.chain().focus() would be re-focusing an
      // editor that already lost its selection. Preventing the default
      // mousedown behavior keeps focus (and the selection) in the editor
      // the whole time, which is what lets toggleBold() etc. apply to the
      // text the user actually had selected.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-ember/15 px-2.5 py-1.5 font-meta text-xs font-semibold text-ember"
          : "rounded-md px-2.5 py-1.5 font-meta text-xs text-ink-dim transition-colors hover:bg-ground-line/60 hover:text-ink"
      }
    >
      {children}
    </button>
  );
}
