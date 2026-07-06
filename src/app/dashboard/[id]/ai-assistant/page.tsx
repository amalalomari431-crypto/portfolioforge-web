import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletionPercent } from "@/lib/portfolio-insights";
import { AiAssistantClient } from "./ai-assistant-client";

export default async function AiAssistantPage({
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
      projects: {
        where: { deletedAt: null },
        include: { assets: { select: { id: true, fileName: true, createdAt: true, kind: true } } },
      },
    },
  });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const completionPercent = computeCompletionPercent(portfolio, portfolio.projects);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <AiAssistantClient portfolioId={id} initialCompletionPercent={completionPercent} />
    </main>
  );
}
