"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAppwriteStorage } from "@/lib/appwrite";
import { requirePortfolioOwner } from "@/lib/authz";

function slugify(base: string) {
  const cleaned = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${cleaned || "portfolio"}-${suffix}`;
}

export async function createPortfolio() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const portfolio = await prisma.portfolio.create({
    data: {
      title: "Untitled Portfolio",
      slug: slugify("untitled-portfolio"),
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${portfolio.id}/overview`);
}

export async function updatePortfolio(
  portfolioId: string,
  data: { title: string; headline: string; bio: string }
) {
  await requirePortfolioOwner(portfolioId);

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      title: data.title.trim() || "Untitled Portfolio",
      headline: data.headline.trim() || null,
      bio: data.bio.trim() || null,
    },
  });

  revalidatePath(`/dashboard/${portfolioId}/overview`);
  revalidatePath(`/dashboard/${portfolioId}/about`);
  revalidatePath(`/dashboard/${portfolioId}/settings`);
  revalidatePath("/dashboard");
}

// A lean, title-only sibling to updatePortfolio — used by the Library
// card's inline "Rename" so the card never needs to load/carry
// headline/bio just to avoid clobbering them.
export async function renamePortfolio(portfolioId: string, title: string) {
  await requirePortfolioOwner(portfolioId);

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: { title: title.trim() || "Untitled Portfolio" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${portfolioId}/overview`);
  revalidatePath(`/dashboard/${portfolioId}/settings`);
}

export async function togglePublish(portfolioId: string) {
  const { portfolio } = await requirePortfolioOwner(portfolioId);

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      isPublished: !portfolio.isPublished,
      publishedAt: !portfolio.isPublished ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/${portfolioId}/overview`);
  revalidatePath(`/dashboard/${portfolioId}/publish`);
  revalidatePath("/dashboard");
  revalidatePath(`/p/${portfolio.slug}`);
}

export async function archivePortfolio(portfolioId: string) {
  await requirePortfolioOwner(portfolioId);
  await prisma.portfolio.update({ where: { id: portfolioId }, data: { archivedAt: new Date() } });
  revalidatePath("/dashboard");
}

export async function unarchivePortfolio(portfolioId: string) {
  await requirePortfolioOwner(portfolioId);
  await prisma.portfolio.update({ where: { id: portfolioId }, data: { archivedAt: null } });
  revalidatePath("/dashboard");
}

// Duplicates the portfolio's own fields and every project's fields.
// Deliberately does NOT duplicate media: the same Appwrite file could only
// safely belong to one Project row without either downloading and
// re-uploading every asset (real cost, real latency for a "duplicate"
// action) or having two rows reference — and be able to independently
// delete — the same underlying file. Scoped out rather than done unsafely.
export async function duplicatePortfolio(portfolioId: string) {
  const { userId } = await requirePortfolioOwner(portfolioId);

  const original = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: { projects: true },
  });
  if (!original) {
    throw new Error("Not found.");
  }

  await prisma.portfolio.create({
    data: {
      title: `${original.title} (Copy)`,
      headline: original.headline,
      bio: original.bio,
      slug: slugify(`${original.title}-copy`),
      // A duplicate always starts as a private draft, regardless of the
      // source's state — never silently publish a copy the user hasn't
      // reviewed yet.
      isPublished: false,
      userId,
      projects: {
        create: original.projects.map((p) => ({
          title: p.title,
          description: p.description,
          role: p.role,
          startDate: p.startDate,
          endDate: p.endDate,
          tags: p.tags,
          externalLink: p.externalLink,
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
}

// Permanent delete — removes Appwrite storage files for every asset across
// every project first, then the database rows (which cascade Project and
// ProjectAsset), matching the same "storage before database record" order
// established for project-level deletes.
export async function deletePortfolioPermanently(portfolioId: string) {
  await requirePortfolioOwner(portfolioId);

  const projects = await prisma.project.findMany({
    where: { portfolioId },
    include: { assets: true },
  });
  const assets = projects.flatMap((p) => p.assets);

  if (assets.length > 0) {
    const storage = getAppwriteStorage();
    await Promise.all(
      assets.map((asset) =>
        storage.deleteFile(asset.appwriteBucketId, asset.appwriteFileId).catch(() => {})
      )
    );
  }

  await prisma.portfolio.delete({ where: { id: portfolioId } });
  revalidatePath("/dashboard");
}
