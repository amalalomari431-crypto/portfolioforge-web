import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPortfolioBook } from "@/lib/portfolio-book";
import {
  buildBookPages,
  BOOK_TEMPLATES,
  BOOK_PAGE_SIZES,
  type PageOptions,
  type BookTemplate,
  type BookPageSize,
} from "@/lib/book-pages";
import { BookViewer } from "./book-viewer";

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "1" || value === "true";
}

export default async function BookViewerPage({
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

  const templateParam = typeof sp.template === "string" ? sp.template : "";
  const template: BookTemplate = (BOOK_TEMPLATES as readonly string[]).includes(templateParam)
    ? (templateParam as BookTemplate)
    : "minimal";

  const sizeParam = typeof sp.size === "string" ? sp.size : "";
  const pageSize: BookPageSize = (BOOK_PAGE_SIZES as readonly string[]).includes(sizeParam)
    ? (sizeParam as BookPageSize)
    : "a4p";

  const pageOptions: PageOptions = {
    cover: parseBool(typeof sp.cover === "string" ? sp.cover : undefined, true),
    toc: parseBool(typeof sp.toc === "string" ? sp.toc : undefined, true),
    pageNumbers: parseBool(typeof sp.pageNumbers === "string" ? sp.pageNumbers : undefined, true),
    about: parseBool(typeof sp.about === "string" ? sp.about : undefined, true),
    skills: parseBool(typeof sp.skills === "string" ? sp.skills : undefined, true),
    certificates: parseBool(typeof sp.certificates === "string" ? sp.certificates : undefined, true),
  };

  const book = await buildPortfolioBook(portfolioId);
  const pages = buildBookPages(book, pageOptions);

  return (
    <BookViewer
      portfolioId={portfolioId}
      bookTitle={book.title}
      isPublished={book.isPublished}
      slug={book.slug}
      template={template}
      pageSize={pageSize}
      showPageNumbers={pageOptions.pageNumbers}
      pages={pages}
    />
  );
}
