"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookTemplate } from "@/lib/book-pages";

const TEMPLATE_LABELS: Record<BookTemplate, string> = {
  minimal: "Minimal",
  modern: "Modern",
  "architecture-studio": "Architecture Studio",
  "competition-board": "Competition Board",
  "dark-editorial": "Dark Editorial",
};

const buttonClass =
  "rounded-lg border border-ground-line px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-ember hover:text-ink";

export function BookToolbar({
  backHref,
  template,
  onTemplateChange,
  slug,
  isPublished,
  publishHref,
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  backHref: string;
  template: BookTemplate;
  onTemplateChange: (next: BookTemplate) => void;
  slug: string;
  isPublished: boolean;
  publishHref: string;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    if (!isPublished) {
      router.push(publishHref);
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setShareState("copied");
    setTimeout(() => setShareState("idle"), 1500);
  }

  function handleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="print:hidden flex flex-none flex-wrap items-center justify-between gap-3 border-b border-ground-line bg-ground/95 px-6 py-3 backdrop-blur">
      <a
        href={backHref}
        className="font-meta text-[0.68rem] tracking-[0.06em] text-ink-faint uppercase hover:text-ember"
      >
        ← Back to Generate
      </a>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onPrev} aria-label="Previous page" className={buttonClass}>
          ‹
        </button>
        <span className="font-meta text-xs text-ink-faint tabular-nums">
          {Math.min(currentPage + 1, totalPages)} / {totalPages}
        </span>
        <button type="button" onClick={onNext} aria-label="Next page" className={buttonClass}>
          ›
        </button>
        <select
          value={template}
          onChange={(e) => onTemplateChange(e.target.value as BookTemplate)}
          className="rounded-lg border border-ground-line bg-ground-raised px-3 py-1.5 text-xs text-ink"
          aria-label="Change template"
        >
          {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => router.refresh()} className={buttonClass}>
          Regenerate
        </button>
        <button type="button" onClick={handleShare} className={buttonClass}>
          {shareState === "copied" ? "Link copied" : isPublished ? "Share" : "Publish to share"}
        </button>
        <button type="button" onClick={() => window.print()} className={buttonClass}>
          Print
        </button>
        <button type="button" onClick={() => window.print()} className={buttonClass}>
          Download PDF
        </button>
        <button type="button" onClick={handleFullscreen} className={buttonClass}>
          Fullscreen
        </button>
      </div>
    </div>
  );
}
