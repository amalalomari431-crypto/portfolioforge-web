import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import type { PortfolioBook } from "@/lib/portfolio-book";

// Public analog of buildPortfolioBook (lib/portfolio-book.ts) — same shape,
// but keyed by slug with an isPublished check instead of an owner check,
// since anyone with the link may view it while signed out. The owner-gated
// original is left untouched; this is additive only.
export async function buildPublicPortfolioBook(slug: string): Promise<PortfolioBook | null> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      user: true,
      skills: { orderBy: { sortOrder: "asc" } },
      certificates: { orderBy: { sortOrder: "asc" } },
      projects: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          sections: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
            include: { assets: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!portfolio || !portfolio.isPublished) return null;

  const projects = portfolio.projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    sections: project.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      layoutType: section.layoutType,
      assets: section.assets.map((asset) => ({
        id: asset.id,
        kind: asset.kind,
        url: appwriteFileViewUrl(asset.appwriteFileId),
        fileName: asset.fileName,
        caption: asset.caption,
      })),
    })),
  }));

  return {
    portfolioId: portfolio.id,
    title: portfolio.title,
    headline: portfolio.headline,
    bio: portfolio.bio,
    userName: portfolio.user.name ?? "",
    isPublished: portfolio.isPublished,
    slug: portfolio.slug,
    heroImageUrl: null,
    skills: portfolio.skills.map((s) => ({ id: s.id, name: s.name, level: s.level })),
    certificates: portfolio.certificates.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate ? c.issueDate.toISOString() : null,
      credentialUrl: c.credentialUrl,
    })),
    projects,
  };
}
