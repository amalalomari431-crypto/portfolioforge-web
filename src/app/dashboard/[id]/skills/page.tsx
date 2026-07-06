import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SkillsClient } from "./skills-client";

export default async function SkillsPage({
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

  const skills = await prisma.skill.findMany({
    where: { portfolioId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">Skills</h1>
        <p className="mt-1 text-sm text-ink-dim">Tools, techniques, and technologies you want visitors to know about.</p>
      </div>
      <SkillsClient
        portfolioId={portfolioId}
        initialSkills={skills.map((s) => ({ id: s.id, name: s.name, level: s.level }))}
      />
    </main>
  );
}
