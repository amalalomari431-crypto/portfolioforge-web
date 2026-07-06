import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import { computeProjectReadiness } from "@/lib/portfolio-insights";
import { ProjectListClient } from "./project-list-client";

export default async function ProjectListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: portfolioId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const projects = await prisma.project.findMany({
    where: { portfolioId, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      assets: { orderBy: { sortOrder: "asc" } },
      _count: { select: { sections: { where: { deletedAt: null } } } },
    },
  });

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-6 py-10 sm:px-10 xl:px-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink italic">Projects</h1>
      </div>
      <ProjectListClient
        portfolioId={portfolioId}
        initialProjects={projects.map((p) => {
          const cover = p.assets.find((a) => a.kind === "IMAGE");
          return {
            id: p.id,
            title: p.title,
            isFeatured: p.isFeatured,
            updatedAt: p.updatedAt.toISOString(),
            sectionCount: p._count.sections,
            thumbnailUrl: cover ? appwriteFileViewUrl(cover.appwriteFileId) : null,
            readiness: computeProjectReadiness({
              description: p.description,
              role: p.role,
              tags: p.tags,
              assets: p.assets,
              sectionCount: p._count.sections,
            }),
          };
        })}
      />
    </main>
  );
}
