import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AboutMeForm } from "./about-me-form";

export default async function AboutMePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({ where: { id } });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">About Me</h1>
        <p className="mt-1 text-sm text-ink-dim">
          The headline and bio visitors see on your published portfolio.
        </p>
      </div>
      <AboutMeForm portfolio={portfolio} />
    </main>
  );
}
