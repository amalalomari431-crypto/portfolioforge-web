"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAppwriteStorage } from "@/lib/appwrite";
import { parseTags } from "@/lib/validators";
import { requirePortfolioOwner, requireProjectOwner, requireAssetOwner } from "@/lib/authz";

// A Project is a workspace (Sections / Media Library / Settings / AI
// Assistant) now, not a single lazily-created editor page — so it's
// created immediately, the same way createPortfolio() creates a portfolio
// immediately, rather than waiting for a first valid autosave.
export async function createProject(portfolioId: string) {
  await requirePortfolioOwner(portfolioId);

  const existingCount = await prisma.project.count({ where: { portfolioId, deletedAt: null } });
  const project = await prisma.project.create({
    data: { title: "Untitled Project", portfolioId, sortOrder: existingCount },
  });

  revalidatePath(`/dashboard/${portfolioId}/projects`);
  redirect(`/dashboard/${portfolioId}/projects/${project.id}/sections`);
}

export type ProjectDraft = {
  title: string;
  description: string;
  role: string;
  startDate: string; // ISO date, "" for unset
  endDate: string;
  tagsRaw: string; // comma-separated, as typed
  externalLink: string;
  isFeatured: boolean;
};

// The one autosave entry point: create-or-update depending on whether an id
// is already known, mirroring ProjectSaveController._flush() in Flutter —
// the row is created by the first successful autosave, never by a separate
// "new project" step, and there is no explicit Save button anywhere.
export async function saveProject(
  portfolioId: string,
  projectId: string | null,
  draft: ProjectDraft
) {
  await requirePortfolioOwner(portfolioId);

  const data = {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    role: draft.role.trim() || null,
    startDate: draft.startDate ? new Date(draft.startDate) : null,
    endDate: draft.endDate ? new Date(draft.endDate) : null,
    tags: parseTags(draft.tagsRaw).join(","),
    externalLink: draft.externalLink.trim() || null,
    isFeatured: draft.isFeatured,
  };

  let id = projectId;
  if (id) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.portfolioId !== portfolioId) {
      throw new Error("Not found.");
    }
    await prisma.project.update({ where: { id }, data });
  } else {
    const existingCount = await prisma.project.count({
      where: { portfolioId, deletedAt: null },
    });
    const created = await prisma.project.create({
      data: { ...data, portfolioId, sortOrder: existingCount },
    });
    id = created.id;
  }

  revalidatePath(`/dashboard/${portfolioId}/overview`);
  revalidatePath(`/dashboard/${portfolioId}/projects`);
  revalidatePath(`/dashboard/${portfolioId}/projects/${id}/settings`);

  return { id };
}

// Soft delete — matches Flutter's deletedAt convention, which is what makes
// the Undo snackbar possible.
export async function softDeleteProject(projectId: string) {
  const { project } = await requireProjectOwner(projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dashboard/${project.portfolioId}/overview`);
  revalidatePath(`/dashboard/${project.portfolioId}/projects`);
}

export async function restoreProject(projectId: string) {
  const { project } = await requireProjectOwner(projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: null },
  });

  revalidatePath(`/dashboard/${project.portfolioId}/overview`);
  revalidatePath(`/dashboard/${project.portfolioId}/projects`);
}

export async function reorderProjects(portfolioId: string, orderedIds: string[]) {
  await requirePortfolioOwner(portfolioId);

  // Only rewrite rows whose sortOrder actually changed, matching
  // ProjectRepository.saveOrder()'s behavior in Flutter.
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.project.updateMany({
        where: { id, portfolioId, sortOrder: { not: index } },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath(`/dashboard/${portfolioId}/projects`);
}

export async function deleteAsset(assetId: string) {
  const { asset } = await requireAssetOwner(assetId);

  const storage = getAppwriteStorage();
  await storage.deleteFile(asset.appwriteBucketId, asset.appwriteFileId).catch(() => {});

  await prisma.projectAsset.delete({ where: { id: assetId } });

  revalidatePath(`/dashboard/${asset.project.portfolioId}/projects/${asset.projectId}/media`);
  revalidatePath(`/dashboard/${asset.project.portfolioId}/projects/${asset.projectId}/sections`);
}
