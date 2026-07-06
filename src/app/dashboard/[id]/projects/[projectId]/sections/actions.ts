"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProjectOwner, requireSectionOwner, requireAssetOwner } from "@/lib/authz";

export type SectionDraft = {
  title: string;
  content: string; // Tiptap HTML
  layoutType: string;
  aiNotes: string;
};

// Mirrors saveProject()'s lazy create-or-update autosave shape exactly:
// the row is created by the first successful autosave, no separate "new
// section" step, no explicit Save button.
export async function saveSection(
  projectId: string,
  sectionId: string | null,
  draft: SectionDraft
) {
  const { project } = await requireProjectOwner(projectId);

  const data = {
    title: draft.title.trim(),
    content: draft.content,
    layoutType: draft.layoutType.trim() || "standard",
    aiNotes: draft.aiNotes.trim(),
  };

  let id = sectionId;
  if (id) {
    const existing = await prisma.section.findUnique({ where: { id } });
    if (!existing || existing.projectId !== projectId) {
      throw new Error("Not found.");
    }
    await prisma.section.update({ where: { id }, data });
  } else {
    const existingCount = await prisma.section.count({ where: { projectId, deletedAt: null } });
    const created = await prisma.section.create({
      data: { ...data, projectId, sortOrder: existingCount },
    });
    id = created.id;
  }

  revalidatePath(`/dashboard/${project.portfolioId}/projects/${projectId}/sections`);
  revalidatePath(`/dashboard/${project.portfolioId}/projects/${projectId}/sections/${id}`);
  revalidatePath(`/dashboard/${project.portfolioId}/projects`);

  return { id };
}

export async function softDeleteSection(sectionId: string) {
  const { section } = await requireSectionOwner(sectionId);

  await prisma.section.update({ where: { id: sectionId }, data: { deletedAt: new Date() } });

  revalidatePath(`/dashboard/${section.project.portfolioId}/projects/${section.projectId}/sections`);
}

export async function restoreSection(sectionId: string) {
  const { section } = await requireSectionOwner(sectionId);

  await prisma.section.update({ where: { id: sectionId }, data: { deletedAt: null } });

  revalidatePath(`/dashboard/${section.project.portfolioId}/projects/${section.projectId}/sections`);
}

export async function reorderSections(projectId: string, orderedIds: string[]) {
  await requireProjectOwner(projectId);

  // Only rewrite rows whose sortOrder actually changed, matching
  // reorderProjects()'s behavior.
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.section.updateMany({
        where: { id, projectId, sortOrder: { not: index } },
        data: { sortOrder: index },
      })
    )
  );
}

export async function renameSection(sectionId: string, title: string) {
  const { section } = await requireSectionOwner(sectionId);
  const trimmed = title.trim() || "Untitled section";

  await prisma.section.update({ where: { id: sectionId }, data: { title: trimmed } });

  revalidatePath(`/dashboard/${section.project.portfolioId}/projects/${section.projectId}/sections`);
}

// Duplicates a section's own fields — deliberately does NOT duplicate its
// attached media, for the same reason duplicatePortfolio() doesn't: the
// same Appwrite file can't safely belong to two rows without either
// re-uploading every asset or letting two rows independently delete one
// underlying file.
export async function duplicateSection(sectionId: string) {
  const { section } = await requireSectionOwner(sectionId);

  const existingCount = await prisma.section.count({
    where: { projectId: section.projectId, deletedAt: null },
  });

  await prisma.section.create({
    data: {
      title: `${section.title} (Copy)`,
      content: section.content,
      layoutType: section.layoutType,
      aiNotes: section.aiNotes,
      projectId: section.projectId,
      sortOrder: existingCount,
    },
  });

  revalidatePath(`/dashboard/${section.project.portfolioId}/projects/${section.projectId}/sections`);
}

export async function updateAssetCaption(assetId: string, caption: string) {
  const { asset } = await requireAssetOwner(assetId);

  await prisma.projectAsset.update({
    where: { id: assetId },
    data: { caption: caption.trim() || null },
  });

  if (asset.sectionId) {
    revalidatePath(
      `/dashboard/${asset.project.portfolioId}/projects/${asset.projectId}/sections/${asset.sectionId}`
    );
  }
}
