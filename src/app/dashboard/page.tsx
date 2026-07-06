import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import {
  computeCompletionPercent,
  estimateReadingMinutes,
  timeOfDayGreeting,
} from "@/lib/portfolio-insights";
import { PortfolioLibrary } from "./portfolio-library";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      projects: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          assets: { orderBy: { sortOrder: "asc" } },
          sections: { where: { deletedAt: null }, select: { content: true } },
        },
      },
    },
  });

  return (
    <PortfolioLibrary
      greeting={timeOfDayGreeting()}
      userName={session?.user?.name || session?.user?.email || ""}
      ownerName={session?.user?.name || session?.user?.email || ""}
      initialPortfolios={portfolios.map((portfolio) => {
        const { projects } = portfolio;
        const coverAsset = projects.flatMap((p) => p.assets).find((a) => a.kind === "IMAGE");
        const sections = projects.flatMap((p) => p.sections);
        return {
          id: portfolio.id,
          title: portfolio.title,
          slug: portfolio.slug,
          isPublished: portfolio.isPublished,
          archivedAt: portfolio.archivedAt ? portfolio.archivedAt.toISOString() : null,
          updatedAt: portfolio.updatedAt.toISOString(),
          createdAt: portfolio.createdAt.toISOString(),
          projectCount: projects.length,
          pageCount: sections.length,
          readingMinutes: estimateReadingMinutes(sections.map((s) => s.content)),
          completionPercent: computeCompletionPercent(portfolio, projects),
          coverImageUrl: coverAsset ? appwriteFileViewUrl(coverAsset.appwriteFileId) : null,
        };
      })}
    />
  );
}
