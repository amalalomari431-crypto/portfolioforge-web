import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function PortfolioSettingsPage({
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
        <h1 className="font-display text-2xl font-medium text-ink italic">Settings</h1>
        <p className="mt-1 text-sm text-ink-dim">Rename, archive, duplicate, or delete this portfolio.</p>
      </div>
      <SettingsClient
        portfolio={{
          id: portfolio.id,
          title: portfolio.title,
          headline: portfolio.headline,
          bio: portfolio.bio,
          slug: portfolio.slug,
          archivedAt: portfolio.archivedAt ? portfolio.archivedAt.toISOString() : null,
        }}
      />
    </main>
  );
}
