import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Shared ownership-check helpers for Server Actions. Consolidates what used
// to be four separately-duplicated auth+ownership patterns (portfolio-scoped
// inline checks in dashboard/actions.ts and projects/actions.ts, a
// project-scoped helper, and an asset-scoped inline check) into one shape
// per nesting level — Portfolio -> Project -> Section, plus the
// cross-cutting Asset case. Behavior is unchanged from what each call site
// did before; this is a pure refactor.

export async function requireSession(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return session.user.id;
}

export async function requirePortfolioOwner(portfolioId: string) {
  const userId = await requireSession();
  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { portfolio, userId };
}

export async function requireProjectOwner(projectId: string) {
  const userId = await requireSession();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { portfolio: true },
  });
  if (!project || project.portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { project, userId };
}

export async function requireSectionOwner(sectionId: string) {
  const userId = await requireSession();
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { project: { include: { portfolio: true } } },
  });
  if (!section || section.project.portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { section, userId };
}

export async function requireAssetOwner(assetId: string) {
  const userId = await requireSession();
  const asset = await prisma.projectAsset.findUnique({
    where: { id: assetId },
    include: { project: { include: { portfolio: true } } },
  });
  if (!asset || asset.project.portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { asset, userId };
}

export async function requireSkillOwner(skillId: string) {
  const userId = await requireSession();
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { portfolio: true },
  });
  if (!skill || skill.portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { skill, userId };
}

export async function requireCertificateOwner(certificateId: string) {
  const userId = await requireSession();
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { portfolio: true },
  });
  if (!certificate || certificate.portfolio.userId !== userId) {
    throw new Error("Not found.");
  }
  return { certificate, userId };
}
