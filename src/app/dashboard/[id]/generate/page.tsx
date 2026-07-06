import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appwriteFileViewUrl } from "@/lib/appwrite";
import { BOOK_TEMPLATES, BOOK_PAGE_SIZES, type PageOptions } from "@/lib/book-pages";
import { GenerateClient } from "./generate-client";

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "1" || value === "true";
}

export default async function GeneratePortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: portfolioId } = await params;
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const [projects, skillCount, certificateCount] = await Promise.all([
    prisma.project.findMany({
      where: { portfolioId, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { assets: { where: { kind: "IMAGE" }, orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.skill.count({ where: { portfolioId } }),
    prisma.certificate.count({ where: { portfolioId } }),
  ]);

  const hasAbout = !!(portfolio.headline?.trim() || portfolio.bio?.trim());

  const templateParam = typeof sp.template === "string" ? sp.template : "";
  const template = (BOOK_TEMPLATES as readonly string[]).includes(templateParam) ? templateParam : "minimal";

  const sizeParam = typeof sp.size === "string" ? sp.size : "";
  const pageSize = (BOOK_PAGE_SIZES as readonly string[]).includes(sizeParam) ? sizeParam : "a4p";

  const pageOptions: PageOptions = {
    cover: parseBool(typeof sp.cover === "string" ? sp.cover : undefined, true),
    toc: parseBool(typeof sp.toc === "string" ? sp.toc : undefined, true),
    pageNumbers: parseBool(typeof sp.pageNumbers === "string" ? sp.pageNumbers : undefined, true),
    about: parseBool(typeof sp.about === "string" ? sp.about : undefined, true),
    skills: parseBool(typeof sp.skills === "string" ? sp.skills : undefined, true),
    certificates: parseBool(typeof sp.certificates === "string" ? sp.certificates : undefined, true),
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">Generate Portfolio</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          Choose a template, page size, and what to include — then generate a real, print-ready book built
          entirely from your projects and sections.
        </p>
      </div>
      <GenerateClient
        portfolioId={portfolioId}
        initialTemplate={template as (typeof BOOK_TEMPLATES)[number]}
        initialPageSize={pageSize as (typeof BOOK_PAGE_SIZES)[number]}
        initialPageOptions={pageOptions}
        gatingCounts={{ about: hasAbout ? 1 : 0, skills: skillCount, certificates: certificateCount }}
        orderProjects={projects.map((p) => ({
          id: p.id,
          title: p.title,
          thumbnailUrl: p.assets[0] ? appwriteFileViewUrl(p.assets[0].appwriteFileId) : null,
        }))}
      />
    </main>
  );
}
