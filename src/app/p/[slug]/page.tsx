import { notFound } from "next/navigation";
import { buildPublicPortfolioBook } from "@/lib/public-portfolio-book";
import { buildBookPages } from "@/lib/book-pages";
import { PublicBookExperience } from "./public-book-experience";

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const book = await buildPublicPortfolioBook(slug);
  if (!book) notFound();

  // Full page set (cover + TOC included) so Download PDF preserves them —
  // the on-screen experience below renders its own hero/TOC instead and
  // only shows this exact flat list in the print-only stack.
  const pages = buildBookPages(book, {
    cover: true,
    toc: true,
    pageNumbers: true,
    about: true,
    skills: true,
    certificates: true,
  });

  return <PublicBookExperience book={book} pages={pages} />;
}
