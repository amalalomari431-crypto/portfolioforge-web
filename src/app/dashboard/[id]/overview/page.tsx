import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  computeCompletionPercent,
  computeInsights,
  computeActivity,
  computeProgressStats,
  suggestNextAction,
  timeOfDayGreeting,
} from "@/lib/portfolio-insights";
import { MotionCard } from "@/components/dashboard/motion-card";
import { DashboardHero } from "./dashboard-hero";
import { ProgressCard } from "./progress-card";
import { InsightsCard } from "./insights-card";
import { ActivityCard } from "./activity-card";
import { QuickStatsCard } from "./quick-stats-card";
import { NextActionCard } from "./next-action-card";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      skills: true,
      certificates: true,
      projects: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          assets: { orderBy: { sortOrder: "asc" } },
          sections: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
            include: { assets: { select: { id: true } } },
          },
        },
      },
    },
  });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  // A second, wider read of Sections just for the activity feed — this is
  // the one place that needs soft-deleted rows too (for "Deleted page"
  // events), unlike every other read of Sections in the app.
  const allSectionsIncludingDeleted = await prisma.section.findMany({
    where: { project: { portfolioId: id } },
    select: { title: true, createdAt: true, deletedAt: true, project: { select: { title: true } } },
  });

  const { projects } = portfolio;
  const completionPercent = computeCompletionPercent(portfolio, projects);
  const progressStats = computeProgressStats(portfolio, projects);
  const insights = computeInsights(portfolio, projects, {
    sections: projects.flatMap((p) => p.sections),
    skillCount: portfolio.skills.length,
    certificateCount: portfolio.certificates.length,
  });
  const activity = computeActivity(
    portfolio,
    projects,
    allSectionsIncludingDeleted.map((s) => ({
      title: s.title,
      projectTitle: s.project.title,
      createdAt: s.createdAt,
      deletedAt: s.deletedAt,
    }))
  ).map((e) => ({ ...e, at: e.at.toISOString() }));

  const allAssets = projects.flatMap((p) => p.assets);
  const quickStats = {
    projects: projects.length,
    pages: projects.reduce((sum, p) => sum + p.sections.length, 0),
    images: allAssets.filter((a) => a.kind === "IMAGE").length,
    pdfs: allAssets.filter((a) => a.kind === "PDF").length,
    updatedAt: portfolio.updatedAt.toISOString(),
  };

  const nextAction = suggestNextAction({
    portfolioId: id,
    isPublished: portfolio.isPublished,
    headline: portfolio.headline,
    bio: portfolio.bio,
    skillCount: portfolio.skills.length,
    certificateCount: portfolio.certificates.length,
    projects: projects.map((p) => ({ id: p.id, title: p.title, sections: p.sections })),
  });

  return (
    <main className="flex flex-1 flex-col gap-10 px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <DashboardHero
        greeting={timeOfDayGreeting()}
        name={session?.user?.name || session?.user?.email || ""}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <MotionCard>
          <ProgressCard percent={completionPercent} isPublished={portfolio.isPublished} stats={progressStats} />
        </MotionCard>
        <MotionCard>
          <InsightsCard insights={insights} />
        </MotionCard>
        <MotionCard>
          <ActivityCard events={activity} />
        </MotionCard>
        <MotionCard>
          <QuickStatsCard stats={quickStats} />
        </MotionCard>
        <MotionCard>
          <NextActionCard action={nextAction} />
        </MotionCard>
      </div>
    </main>
  );
}
