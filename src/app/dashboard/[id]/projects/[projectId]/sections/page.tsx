import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SectionListClient } from "./section-list-client";

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: portfolioId, projectId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      portfolio: true,
      sections: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project || project.portfolio.userId !== userId || project.portfolioId !== portfolioId || project.deletedAt) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 xl:px-14">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">Sections</h1>
        <p className="mt-1 text-sm text-ink-dim">The pages that make up this project, in order.</p>
      </div>
      <SectionListClient
        portfolioId={portfolioId}
        projectId={projectId}
        initialSections={project.sections.map((s) => ({
          id: s.id,
          title: s.title,
          layoutType: s.layoutType,
          updatedAt: s.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
