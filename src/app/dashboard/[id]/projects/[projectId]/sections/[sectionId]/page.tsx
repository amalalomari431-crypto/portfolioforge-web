import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import { SectionEditorClient, type InitialSection } from "./section-editor-client";

const NEW_SECTION_ID = "new";

export default async function SectionEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; projectId: string; sectionId: string }>;
  searchParams: Promise<{ title?: string }>;
}) {
  const { id: portfolioId, projectId, sectionId } = await params;
  const { title } = await searchParams;

  const session = await auth();
  const userId = session!.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { portfolio: true },
  });
  if (!project || project.portfolio.userId !== userId || project.portfolioId !== portfolioId) {
    redirect("/dashboard");
  }

  let initial: InitialSection = null;

  if (sectionId !== NEW_SECTION_ID) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { assets: { orderBy: { sortOrder: "asc" } } },
    });
    if (!section || section.projectId !== projectId || section.deletedAt) {
      redirect(`/dashboard/${portfolioId}/projects/${projectId}/sections`);
    }
    initial = {
      id: section.id,
      title: section.title,
      content: section.content,
      layoutType: section.layoutType,
      aiNotes: section.aiNotes,
      assets: section.assets.map((a) => ({
        id: a.id,
        kind: a.kind,
        fileName: a.fileName,
        sizeBytes: a.sizeBytes,
        viewUrl: appwriteFileViewUrl(a.appwriteFileId),
        caption: a.caption,
      })),
    };
  }

  return (
    <SectionEditorClient
      portfolioId={portfolioId}
      projectId={projectId}
      initial={initial}
      initialTitleFromQuery={title}
    />
  );
}
