import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectSettingsClient } from "./project-settings-client";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: portfolioId, projectId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { portfolio: true },
  });
  if (!project || project.portfolio.userId !== userId || project.portfolioId !== portfolioId || project.deletedAt) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 xl:px-14">
      <ProjectSettingsClient
        portfolioId={portfolioId}
        initial={{
          id: project.id,
          title: project.title,
          description: project.description ?? "",
          role: project.role ?? "",
          startDate: project.startDate ? project.startDate.toISOString().slice(0, 10) : "",
          endDate: project.endDate ? project.endDate.toISOString().slice(0, 10) : "",
          tags: project.tags,
          externalLink: project.externalLink ?? "",
          isFeatured: project.isFeatured,
        }}
      />
    </main>
  );
}
