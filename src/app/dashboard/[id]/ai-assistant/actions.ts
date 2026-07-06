"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortfolioOwner } from "@/lib/authz";
import { parseTags } from "@/lib/validators";
import { callAiOrchestrator } from "@/lib/ai-orchestrator";
import type {
  AiOutcome,
  CareerAdvice,
  ChatReply,
  PortfolioAnalysis,
  Recommendation,
  RecruiterFeedback,
} from "@/lib/ai-types";

// Mirrors `buildSnapshotNarrative`'s expected input shape in
// appwrite/functions/ai_orchestrator/index.js. This app has no separate
// Profile entity — Portfolio.headline/bio stand in for it — and no
// location/website/profession/goal fields exist here, so those are sent
// null; the function's narrative builder already renders missing fields
// as "(none)" rather than requiring them.
async function buildSnapshot(portfolioId: string) {
  const portfolio = await prisma.portfolio.findUniqueOrThrow({
    where: { id: portfolioId },
    include: {
      user: true,
      projects: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { sortOrder: "asc" } },
      certificates: { orderBy: { sortOrder: "asc" } },
    },
  });

  return {
    profile: {
      fullName: portfolio.user.name || portfolio.user.email,
      headline: portfolio.headline,
      location: null,
      website: null,
      professionCategory: null,
      primaryGoal: null,
    },
    portfolio: { bio: portfolio.bio },
    projects: portfolio.projects.map((p) => ({
      id: p.id,
      title: p.title,
      role: p.role,
      tags: parseTags(p.tags),
      externalLink: p.externalLink,
      isFeatured: p.isFeatured,
      description: p.description,
    })),
    // No skill "category" field exists in this schema — proficiency level
    // stands in for it so the AI still gets a real, non-fabricated signal.
    skills: portfolio.skills.map((s) => ({ name: s.name, category: s.level || "General" })),
    certificates: portfolio.certificates.map((c) => ({
      name: c.title,
      issuer: c.issuer,
      dateIssued: c.issueDate ? c.issueDate.toISOString() : null,
    })),
  };
}

export async function runAiQuickAction(
  portfolioId: string,
  feature: "analyzePortfolio",
  targetRole?: string
): Promise<AiOutcome<PortfolioAnalysis>>;
export async function runAiQuickAction(
  portfolioId: string,
  feature: "recommend",
  targetRole?: string
): Promise<AiOutcome<{ recommendations: Recommendation[] }>>;
export async function runAiQuickAction(
  portfolioId: string,
  feature: "recruiterSimulation",
  targetRole?: string
): Promise<AiOutcome<RecruiterFeedback>>;
export async function runAiQuickAction(
  portfolioId: string,
  feature: "careerAdvice",
  targetRole?: string
): Promise<AiOutcome<CareerAdvice>>;
export async function runAiQuickAction(
  portfolioId: string,
  feature: "analyzePortfolio" | "recommend" | "recruiterSimulation" | "careerAdvice",
  targetRole?: string
): Promise<AiOutcome<PortfolioAnalysis | { recommendations: Recommendation[] } | RecruiterFeedback | CareerAdvice>> {
  const { userId } = await requirePortfolioOwner(portfolioId);
  const snapshot = await buildSnapshot(portfolioId);
  const input =
    feature === "analyzePortfolio" || feature === "recommend"
      ? { snapshot }
      : { snapshot, targetRole: targetRole?.trim() || undefined };
  return callAiOrchestrator(userId, feature, input);
}

export async function sendAiChatMessage(
  portfolioId: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<AiOutcome<ChatReply>> {
  const { userId } = await requirePortfolioOwner(portfolioId);
  const snapshot = await buildSnapshot(portfolioId);
  return callAiOrchestrator(userId, "chat", { message, history, snapshot });
}

// One-click apply, matching the Flutter AI Assistant's dispatch exactly,
// adapted to this app's Prisma schema. `certification` and `link` with no
// targetId never write anything — same honesty call the Flutter side made:
// there's no safe field to invent a credential or a portfolio-level
// website into (this schema has neither).
export async function applyAiRecommendation(
  portfolioId: string,
  recommendation: Recommendation
): Promise<{ ok: boolean }> {
  await requirePortfolioOwner(portfolioId);

  switch (recommendation.type) {
    case "bio":
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { bio: recommendation.suggestedValue },
      });
      break;

    case "professionalTitle":
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { headline: recommendation.suggestedValue },
      });
      break;

    case "projectDescription":
    case "achievement": {
      if (!recommendation.targetId) return { ok: false };
      const project = await prisma.project.findUnique({ where: { id: recommendation.targetId } });
      if (!project || project.portfolioId !== portfolioId) return { ok: false };
      await prisma.project.update({
        where: { id: recommendation.targetId },
        data: { description: recommendation.suggestedValue },
      });
      break;
    }

    case "link": {
      if (!recommendation.targetId) return { ok: false };
      const project = await prisma.project.findUnique({ where: { id: recommendation.targetId } });
      if (!project || project.portfolioId !== portfolioId) return { ok: false };
      await prisma.project.update({
        where: { id: recommendation.targetId },
        data: { externalLink: recommendation.suggestedValue },
      });
      break;
    }

    case "skill": {
      const existingCount = await prisma.skill.count({ where: { portfolioId } });
      await prisma.skill.create({
        data: { portfolioId, name: recommendation.suggestedValue, sortOrder: existingCount },
      });
      break;
    }

    case "certification":
      return { ok: false };
  }

  revalidatePath(`/dashboard/${portfolioId}`);
  return { ok: true };
}
