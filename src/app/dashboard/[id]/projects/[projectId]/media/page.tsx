import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import { MediaManagerClient } from "./media-manager-client";

export default async function MediaManagerPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: portfolioId, projectId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { portfolio: true, assets: { orderBy: { sortOrder: "asc" } } },
  });

  if (!project || project.portfolio.userId !== userId || project.portfolioId !== portfolioId) {
    notFound();
  }

  const assets = project.assets.map((a) => ({
    id: a.id,
    kind: a.kind,
    fileName: a.fileName,
    sizeBytes: a.sizeBytes,
    viewUrl: appwriteFileViewUrl(a.appwriteFileId),
  }));

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-6 py-10 sm:px-10 xl:px-16">
      <h1 className="font-display text-3xl font-medium text-ink italic">Media Library</h1>
      <div className="max-w-6xl">
        <MediaManagerClient projectId={project.id} initialAssets={assets} />
      </div>
    </main>
  );
}
