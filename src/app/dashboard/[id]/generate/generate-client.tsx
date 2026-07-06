"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOOK_TEMPLATES, BOOK_PAGE_SIZES, type BookTemplate, type BookPageSize, type PageOptions } from "@/lib/book-pages";
import { ProjectOrderCard } from "./project-order-card";

const TEMPLATE_META: Record<BookTemplate, { label: string; blurb: string; bg: string; accent: string }> = {
  minimal: { label: "Minimal", blurb: "Clean serif, generous white space.", bg: "#ffffff", accent: "#1c1c1c" },
  modern: { label: "Modern", blurb: "Bold sans, structured grid.", bg: "#f4f4f6", accent: "#2d5bff" },
  "architecture-studio": {
    label: "Architecture Studio",
    blurb: "Technical, drafting-table precision.",
    bg: "#ffffff",
    accent: "#b23b2e",
  },
  "competition-board": {
    label: "Competition Board",
    blurb: "High-contrast poster presentation.",
    bg: "#0b0b0b",
    accent: "#ffcf3f",
  },
  "dark-editorial": {
    label: "Dark Editorial",
    blurb: "PortfolioForge's own dark, ember-lit voice.",
    bg: "#0f0d10",
    accent: "#e3a15c",
  },
};

const PAGE_SIZE_LABELS: Record<BookPageSize, string> = {
  a4p: "A4 Portrait",
  a4l: "A4 Landscape",
  a3l: "A3 Landscape",
};

type IncludeItem = { key: keyof PageOptions; label: string; count: number | null };

export function GenerateClient({
  portfolioId,
  initialTemplate,
  initialPageSize,
  initialPageOptions,
  gatingCounts,
  orderProjects,
}: {
  portfolioId: string;
  initialTemplate: BookTemplate;
  initialPageSize: BookPageSize;
  initialPageOptions: PageOptions;
  gatingCounts: { about: number; skills: number; certificates: number };
  orderProjects: { id: string; title: string; thumbnailUrl: string | null }[];
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageOptions, setPageOptions] = useState(initialPageOptions);

  function buildParams(t: BookTemplate, s: BookPageSize, o: PageOptions) {
    const params = new URLSearchParams();
    params.set("template", t);
    params.set("size", s);
    (Object.keys(o) as (keyof PageOptions)[]).forEach((key) => params.set(key, o[key] ? "1" : "0"));
    return params;
  }

  function handleTemplate(next: BookTemplate) {
    setTemplate(next);
    router.replace(`/dashboard/${portfolioId}/generate?${buildParams(next, pageSize, pageOptions)}`, { scroll: false });
  }

  function handlePageSize(next: BookPageSize) {
    setPageSize(next);
    router.replace(`/dashboard/${portfolioId}/generate?${buildParams(template, next, pageOptions)}`, { scroll: false });
  }

  function toggleOption(key: keyof PageOptions) {
    const next = { ...pageOptions, [key]: !pageOptions[key] };
    setPageOptions(next);
    router.replace(`/dashboard/${portfolioId}/generate?${buildParams(template, pageSize, next)}`, { scroll: false });
  }

  function handleGenerate() {
    router.push(`/dashboard/${portfolioId}/book?${buildParams(template, pageSize, pageOptions)}`);
  }

  const items: IncludeItem[] = [
    { key: "cover", label: "Cover", count: null },
    { key: "toc", label: "Table of Contents", count: null },
    { key: "pageNumbers", label: "Page Numbers", count: null },
    { key: "about", label: "About Me", count: gatingCounts.about },
    { key: "skills", label: "Skills", count: gatingCounts.skills },
    { key: "certificates", label: "Certificates", count: gatingCounts.certificates },
  ];

  const canGenerate = orderProjects.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6">
        <p className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Portfolio Template</p>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {BOOK_TEMPLATES.map((key) => {
            const meta = TEMPLATE_META[key];
            const selected = template === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplate(key)}
                className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                  selected ? "border-ember bg-ember/5" : "border-ground-line hover:border-ember-soft"
                }`}
              >
                <span className="block h-16 rounded-md border" style={{ background: meta.bg, borderColor: meta.accent }}>
                  <span className="ml-2 mt-2 block h-2 w-8 rounded-full" style={{ background: meta.accent }} />
                </span>
                <span className="text-sm font-medium text-ink">{meta.label}</span>
                <span className="text-xs text-ink-faint">{meta.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6">
        <p className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Page Size</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {BOOK_PAGE_SIZES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePageSize(key)}
              className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                pageSize === key
                  ? "border-ember bg-ember/5 text-ink"
                  : "border-ground-line text-ink-dim hover:border-ember-soft"
              }`}
            >
              {PAGE_SIZE_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6">
        <p className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Page Options</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const disabled = item.count === 0;
            return (
              <label
                key={item.key}
                className={
                  disabled
                    ? "flex cursor-not-allowed items-center justify-between rounded-lg border border-ground-line px-4 py-3 opacity-50"
                    : "flex cursor-pointer items-center justify-between rounded-lg border border-ground-line px-4 py-3 transition-colors hover:border-ember-soft"
                }
              >
                <span className="text-sm text-ink">
                  {item.label}
                  {item.count !== null && <span className="ml-2 font-meta text-xs text-ink-faint">({item.count})</span>}
                </span>
                <input
                  type="checkbox"
                  checked={!disabled && pageOptions[item.key]}
                  disabled={disabled}
                  onChange={() => toggleOption(item.key)}
                  className="h-4 w-4 accent-ember"
                />
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-ground-line bg-gradient-to-b from-ground-raised/50 to-ground-raised/10 p-6">
        <p className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Project Order</p>
        <p className="mb-4 text-xs text-ink-faint">
          Drag to reorder — each project keeps its own section order. This is the same order shown on the Projects tab.
        </p>
        <ProjectOrderCard portfolioId={portfolioId} initialProjects={orderProjects} />
      </section>

      <section>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          title={canGenerate ? undefined : "Add at least one project before generating a book"}
          className="rounded-lg bg-gradient-to-r from-ember-soft to-ember px-8 py-3.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          Generate Portfolio
        </button>
      </section>
    </div>
  );
}
