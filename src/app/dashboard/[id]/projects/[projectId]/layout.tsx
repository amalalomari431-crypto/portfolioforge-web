import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell, type WorkspaceNavItem } from "@/components/dashboard/workspace-shell";

export default async function ProjectWorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ id: string; projectId: string }>;
  children: React.ReactNode;
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

  const navItems: WorkspaceNavItem[] = [
    { label: "Sections", href: `/dashboard/${portfolioId}/projects/${projectId}/sections` },
    { label: "Media Library", href: `/dashboard/${portfolioId}/projects/${projectId}/media` },
    { label: "Project Settings", href: `/dashboard/${portfolioId}/projects/${projectId}/settings` },
    // One unified, portfolio-wide AI Assistant (not a second, project-scoped
    // one) — it already has this project's data via the same snapshot, and
    // its recommendation cards apply directly to individual projects.
    { label: "AI Assistant", href: `/dashboard/${portfolioId}/ai-assistant` },
  ];

  return (
    <WorkspaceShell
      backHref={`/dashboard/${portfolioId}/projects`}
      backLabel="← All projects"
      title={project.title}
      navItems={navItems}
    >
      {children}
    </WorkspaceShell>
  );
}
