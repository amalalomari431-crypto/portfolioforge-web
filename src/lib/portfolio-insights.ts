// All of this is derived from fields that already exist on Portfolio /
// Project / ProjectAsset — no schema changes. Nothing here is AI-generated;
// it's honest, rule-based computation over real data, framed as such.

type ProjectForInsights = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  assets: { id: string; fileName: string; createdAt: Date; kind: string }[];
};

type PortfolioForInsights = {
  headline: string | null;
  bio: string | null;
  createdAt: Date;
  publishedAt: Date | null;
};

// A Section (page) counts as real substance once it has either written
// content or attached media — a page with neither is genuinely empty, not
// just short.
type SectionForInsights = {
  title: string;
  content: string;
  assets: { id: string }[];
};

function isSectionEmpty(section: SectionForInsights) {
  return !section.content.replace(/<[^>]*>/g, "").trim() && section.assets.length === 0;
}

export function computeCompletionPercent(
  portfolio: PortfolioForInsights,
  projects: ProjectForInsights[]
) {
  const checks = [
    !!portfolio.headline?.trim(),
    !!portfolio.bio?.trim(),
    projects.length > 0,
    projects.some((p) => !!p.description?.trim()),
    projects.some((p) => p.assets.length > 0),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function computeInsights(
  portfolio: PortfolioForInsights,
  projects: ProjectForInsights[],
  // Optional — only the Overview page currently has Sections/Skills/
  // Certificates in scope. Kept optional so this stays exactly what it was
  // for any other future caller that only has portfolio+projects.
  extra?: {
    sections: SectionForInsights[];
    skillCount: number;
    certificateCount: number;
  }
) {
  const insights: string[] = [];

  if (extra) {
    if (!portfolio.headline?.trim() && !portfolio.bio?.trim()) {
      insights.push("Complete your About Me — add a headline and bio.");
    }
  } else if (!portfolio.bio?.trim()) {
    insights.push("Add a bio so visitors know who they're looking at.");
  }

  const missingDescription = projects.filter((p) => !p.description?.trim());
  if (missingDescription.length > 0) {
    insights.push(
      `${missingDescription.length} project${missingDescription.length === 1 ? "" : "s"} missing a description.`
    );
  }
  const missingImages = projects.filter((p) => p.assets.length === 0);
  if (missingImages.length > 0) {
    insights.push(
      `${missingImages.length} project${missingImages.length === 1 ? "" : "s"} with no images or files yet.`
    );
  }
  if (projects.length === 0) {
    insights.push("Add your first project to start building real momentum.");
  }

  if (extra) {
    const { sections, skillCount, certificateCount } = extra;

    const hasCover = sections.some((s) => s.title.trim().toLowerCase() === "cover");
    if (sections.length > 0 && !hasCover) {
      insights.push("Add a Cover page so your book opens with a strong first impression.");
    }

    const emptyPages = sections.filter(isSectionEmpty);
    if (emptyPages.length > 0) {
      insights.push(
        `${emptyPages.length} page${emptyPages.length === 1 ? "" : "s"} still empty — add text or images.`
      );
    }

    if (skillCount === 0) {
      insights.push("Add your Skills so visitors know what you're capable of.");
    }
    if (certificateCount === 0) {
      insights.push("Add your Certificates to back up your experience.");
    }

    const titleCounts = new Map<string, number>();
    for (const section of sections) {
      const key = section.title.trim().toLowerCase();
      if (!key) continue;
      titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
    }
    const duplicateTitles = [...titleCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([title]) => title);
    if (duplicateTitles.length > 0) {
      insights.push(`Duplicate page title${duplicateTitles.length === 1 ? "" : "s"}: ${duplicateTitles.join(", ")}.`);
    }
  }

  return insights;
}

export type ActivityEvent = {
  key: string;
  label: string;
  at: Date;
};

// Optional richer page (Section) history — soft-deleted rows included on
// purpose (unlike everywhere else that reads Sections) since a "Deleted
// page" event needs deletedAt, which normal reads always filter out.
type SectionForActivity = {
  title: string;
  projectTitle: string;
  createdAt: Date;
  deletedAt: Date | null;
};

export function computeActivity(
  portfolio: PortfolioForInsights,
  projects: ProjectForInsights[],
  sections?: SectionForActivity[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({ key: "portfolio-created", label: "Portfolio created", at: portfolio.createdAt });
  if (portfolio.publishedAt) {
    events.push({ key: "portfolio-published", label: "Published portfolio", at: portfolio.publishedAt });
  }

  for (const project of projects) {
    events.push({
      key: `project-created-${project.id}`,
      label: `Created project "${project.title}"`,
      at: project.createdAt,
    });
    // Only counts as a separate "edited" event once there's been a
    // meaningful gap since creation — avoids every project's own creation
    // autosave showing up twice.
    if (project.updatedAt.getTime() - project.createdAt.getTime() > 60_000) {
      events.push({
        key: `project-edited-${project.id}`,
        label: `Edited project "${project.title}"`,
        at: project.updatedAt,
      });
    }
    for (const asset of project.assets) {
      const kindLabel = asset.kind === "PDF" ? "PDF" : asset.kind === "VIDEO" ? "video" : "image";
      events.push({
        key: `asset-${asset.id}`,
        label: `Uploaded ${kindLabel} "${asset.fileName}" to "${project.title}"`,
        at: asset.createdAt,
      });
    }
  }

  // "AI generated description" and "Exported PDF" are deliberately never
  // emitted here — there is no AI generation feature yet, and Download PDF
  // is a client-only window.print() with nothing server-side to log. Real
  // events only; no fabricated activity.

  if (sections) {
    for (const section of sections) {
      events.push({
        key: `page-created-${section.projectTitle}-${section.title}-${section.createdAt.getTime()}`,
        label: `Created page "${section.title}" in "${section.projectTitle}"`,
        at: section.createdAt,
      });
      if (section.deletedAt) {
        events.push({
          key: `page-deleted-${section.projectTitle}-${section.title}-${section.deletedAt.getTime()}`,
          label: `Deleted page "${section.title}" from "${section.projectTitle}"`,
          at: section.deletedAt,
        });
      }
    }
  }

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 10);
}

// A per-project readiness score — same honesty rule as everything else in
// this file: rule-based over real fields, never presented as "AI".
export function computeProjectReadiness(project: {
  description: string | null;
  role: string | null;
  tags: string;
  assets: { id: string }[];
  // Optional so existing call sites that don't know about Sections yet
  // keep their exact prior score — only counted when a caller actually
  // passes it (i.e. once Sections are wired into a given screen).
  sectionCount?: number;
}) {
  const checks = [
    !!project.description?.trim(),
    !!project.role?.trim(),
    project.tags.trim().length > 0,
    project.assets.length > 0,
  ];
  if (project.sectionCount !== undefined) {
    checks.push(project.sectionCount > 0);
  }
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export type ProgressStats = {
  totalProjects: number;
  totalPages: number;
  completedPages: number;
  missingPages: number;
  // Renamed from the request's "AI Completion Score" — this is the exact
  // same rule-based computeCompletionPercent already shown as the ring on
  // this card, just labeled honestly (nothing here is AI-generated).
  completionScore: number;
  readyToPublishPercent: number;
};

// The portfolio-wide "Ready to Publish %" is deliberately a different real
// number from completionScore: it's the average of each project's own
// computeProjectReadiness (title/role/tags/assets/sections), not the
// coarser 5-item portfolio-level checklist. Two honest, differently-scoped
// percentages rather than showing the same number twice.
export function computeProgressStats(
  portfolio: PortfolioForInsights,
  projects: (ProjectForInsights & {
    role: string | null;
    tags: string;
    sections: SectionForInsights[];
  })[]
): ProgressStats {
  const allSections = projects.flatMap((p) => p.sections);
  const totalPages = allSections.length;
  const missingPages = allSections.filter(isSectionEmpty).length;
  const completedPages = totalPages - missingPages;

  const readyToPublishPercent =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce(
            (sum, p) =>
              sum +
              computeProjectReadiness({
                description: p.description,
                role: p.role,
                tags: p.tags,
                assets: p.assets,
                sectionCount: p.sections.length,
              }),
            0
          ) / projects.length
        );

  return {
    totalProjects: projects.length,
    totalPages,
    completedPages,
    missingPages,
    completionScore: computeCompletionPercent(portfolio, projects),
    readyToPublishPercent,
  };
}

export type NextAction = {
  label: string;
  description: string;
  href: string;
};

// A single, real, rule-based suggestion — the same honesty rule as the
// rest of this file. Priority order roughly follows the natural build
// order of a portfolio: projects, then a cover, then real pages, then the
// supporting profile sections, then publish.
export function suggestNextAction(params: {
  portfolioId: string;
  isPublished: boolean;
  headline: string | null;
  bio: string | null;
  skillCount: number;
  certificateCount: number;
  projects: { id: string; title: string; sections: SectionForInsights[] }[];
}): NextAction {
  const { portfolioId, isPublished, headline, bio, skillCount, certificateCount, projects } = params;
  const base = `/dashboard/${portfolioId}`;

  if (projects.length === 0) {
    return {
      label: "Add your first project",
      description: "Projects are the heart of your portfolio — start with the work you're proudest of.",
      href: `${base}/projects`,
    };
  }

  const allSections = projects.flatMap((p) => p.sections.map((s) => ({ ...s, projectId: p.id })));
  const hasCover = allSections.some((s) => s.title.trim().toLowerCase() === "cover");
  if (!hasCover) {
    return {
      label: "Add a Cover page",
      description: `Give "${projects[0].title}" a strong opening page.`,
      href: `${base}/projects/${projects[0].id}/sections`,
    };
  }

  const projectWithNoPages = projects.find((p) => p.sections.length === 0);
  if (projectWithNoPages) {
    return {
      label: `Add pages to "${projectWithNoPages.title}"`,
      description: "This project doesn't have any pages yet.",
      href: `${base}/projects/${projectWithNoPages.id}/sections`,
    };
  }

  const emptySection = allSections.find(isSectionEmpty);
  if (emptySection) {
    return {
      label: `Finish "${emptySection.title}"`,
      description: "This page is still empty — add text or images.",
      href: `${base}/projects/${emptySection.projectId}/sections`,
    };
  }

  if (!headline?.trim() && !bio?.trim()) {
    return {
      label: "Complete your About Me",
      description: "Add a headline and bio so visitors know who they're looking at.",
      href: `${base}/about`,
    };
  }
  if (skillCount === 0) {
    return {
      label: "Add your Skills",
      description: "Show visitors what you're capable of.",
      href: `${base}/skills`,
    };
  }
  if (certificateCount === 0) {
    return {
      label: "Add your Certificates",
      description: "Back up your experience with real credentials.",
      href: `${base}/certificates`,
    };
  }

  return {
    label: "Generate your Book",
    description: "Turn this portfolio into a real, interactive book.",
    href: `${base}/generate`,
  };
}

// Real word count over every Section's Tiptap HTML, at a standard 200wpm —
// same honesty rule as the rest of this file: derived from actual content,
// never a fabricated or AI-generated estimate.
export function estimateReadingMinutes(sectionContents: string[]) {
  const text = sectionContents.join(" ").replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

export function timeOfDayGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
