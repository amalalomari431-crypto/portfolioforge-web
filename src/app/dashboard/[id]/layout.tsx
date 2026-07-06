import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell, type WorkspaceNavItem } from "@/components/dashboard/workspace-shell";

export default async function PortfolioWorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({ where: { id } });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const navItems: WorkspaceNavItem[] = [
    { label: "Overview", href: `/dashboard/${id}/overview` },
    { label: "AI Assistant", href: `/dashboard/${id}/ai-assistant` },
    { label: "Projects", href: `/dashboard/${id}/projects` },
    { label: "About Me", href: `/dashboard/${id}/about` },
    { label: "Skills", href: `/dashboard/${id}/skills` },
    { label: "Certificates", href: `/dashboard/${id}/certificates` },
    { label: "Settings", href: `/dashboard/${id}/settings` },
    { label: "Generate Portfolio", href: `/dashboard/${id}/generate` },
  ];

  return (
    <WorkspaceShell
      backHref="/dashboard"
      backLabel="← All portfolios"
      title={portfolio.title}

      navItems={navItems}
    >
      {children}
    </WorkspaceShell>
  );
}
