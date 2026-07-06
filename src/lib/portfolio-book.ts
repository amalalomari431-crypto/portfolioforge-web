import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import { requirePortfolioOwner } from "@/lib/authz";

export type BookAssetKind = "IMAGE" | "PDF" | "VIDEO";

export type BookAsset = {
  id: string;
  kind: BookAssetKind;
  url: string;
  fileName: string;
  caption: string | null;
};

export type BookSection = {
  id: string;
  title: string;
  content: string;
  layoutType: string;
  assets: BookAsset[];
};

export type BookProject = {
  id: string;
  title: string;
  description: string | null;
  sections: BookSection[];
};

export type BookSkill = { id: string; name: string; level: string | null };

export type BookCertificate = {
  id: string;
  title: string;
  issuer: string | null;
  issueDate: string | null;
  credentialUrl: string | null;
};

export type PortfolioBook = {
  portfolioId: string;
  title: string;
  headline: string | null;
  bio: string | null;
  userName: string;
  isPublished: boolean;
  slug: string;
  heroImageUrl: string | null;
  skills: BookSkill[];
  certificates: BookCertificate[];
  projects: BookProject[];
};

// Collects everything the book needs to render, straight from the live
// tables that already back every other workspace page — nothing here is
// persisted or AI-generated. Only section-attached media appears: an
// unattached (project-level) asset has no page to render onto, so it stays
// a Media Library-only concept, same as it is everywhere else in the app.
export async function buildPortfolioBook(portfolioId: string): Promise<PortfolioBook> {
  await requirePortfolioOwner(portfolioId);

  const portfolio = await prisma.portfolio.findUniqueOrThrow({
    where: { id: portfolioId },
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

  const projects: BookProject[] = portfolio.projects.map((project) => ({
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

  const heroImage = projects
    .flatMap((p) => p.sections.flatMap((s) => s.assets))
    .find((a) => a.kind === "IMAGE");

  return {
    portfolioId: portfolio.id,
    title: portfolio.title,
    headline: portfolio.headline,
    bio: portfolio.bio,
    userName: portfolio.user.name ?? "",
    isPublished: portfolio.isPublished,
    slug: portfolio.slug,
    heroImageUrl: heroImage ? heroImage.url : null,
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
