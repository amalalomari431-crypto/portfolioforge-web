import type { BookAsset, BookCertificate, BookSkill, PortfolioBook } from "@/lib/portfolio-book";

export const BOOK_TEMPLATES = [
  "minimal",
  "modern",
  "architecture-studio",
  "competition-board",
  "dark-editorial",
] as const;
export type BookTemplate = (typeof BOOK_TEMPLATES)[number];

export const BOOK_PAGE_SIZES = ["a4p", "a4l", "a3l"] as const;
export type BookPageSize = (typeof BOOK_PAGE_SIZES)[number];

export type PageOptions = {
  cover: boolean;
  toc: boolean;
  pageNumbers: boolean;
  about: boolean;
  skills: boolean;
  certificates: boolean;
};

export type TocEntry = { label: string; pageNumber: number; indent: boolean };

export type BookPage =
  | { type: "cover"; title: string; userName: string; heroImageUrl: string | null }
  | { type: "toc"; entries: TocEntry[] }
  | { type: "about"; headline: string | null; bio: string | null }
  | { type: "skills"; skills: BookSkill[] }
  | { type: "certificates"; certificates: BookCertificate[] }
  | { type: "project-cover"; projectTitle: string; description: string | null }
  | {
      type: "section";
      projectTitle: string;
      sectionTitle: string;
      content: string;
      layoutType: string;
      images: BookAsset[];
      otherAssets: BookAsset[];
      continuation: boolean;
    };

// No true text-reflow pagination (measuring rendered height and splitting
// mid-paragraph) — that's an InDesign-grade layout engine, out of scope
// here. Instead: one page per Section, and if a section carries more than
// IMAGES_PER_PAGE images, the rest spill onto plain image-grid continuation
// pages. Deterministic, honest about what "one or more pages" means.
const IMAGES_PER_PAGE = 4;

function buildSectionPages(
  projectTitle: string,
  section: PortfolioBook["projects"][number]["sections"][number]
): Extract<BookPage, { type: "section" }>[] {
  const images = section.assets.filter((a) => a.kind === "IMAGE");
  const otherAssets = section.assets.filter((a) => a.kind !== "IMAGE");
  const firstChunk = images.slice(0, IMAGES_PER_PAGE);
  const overflow = images.slice(IMAGES_PER_PAGE);

  const pages: Extract<BookPage, { type: "section" }>[] = [
    {
      type: "section",
      projectTitle,
      sectionTitle: section.title,
      content: section.content,
      layoutType: section.layoutType,
      images: firstChunk,
      otherAssets,
      continuation: false,
    },
  ];

  for (let i = 0; i < overflow.length; i += IMAGES_PER_PAGE) {
    pages.push({
      type: "section",
      projectTitle,
      sectionTitle: section.title,
      content: "",
      layoutType: section.layoutType,
      images: overflow.slice(i, i + IMAGES_PER_PAGE),
      otherAssets: [],
      continuation: true,
    });
  }

  return pages;
}

export function buildBookPages(book: PortfolioBook, options: PageOptions): BookPage[] {
  const pages: BookPage[] = [];

  if (options.cover) {
    pages.push({ type: "cover", title: book.title, userName: book.userName, heroImageUrl: book.heroImageUrl });
  }

  // TOC is inserted after it's built, once every other page's final index
  // is known — reserve its slot now so page numbers account for it.
  const tocIndex = options.toc ? pages.length : -1;
  if (options.toc) pages.push({ type: "toc", entries: [] });

  const tocEntries: TocEntry[] = [];

  const hasAbout = Boolean(book.headline?.trim() || book.bio?.trim());
  if (options.about && hasAbout) {
    tocEntries.push({ label: "About", pageNumber: pages.length + 1, indent: false });
    pages.push({ type: "about", headline: book.headline, bio: book.bio });
  }

  if (options.skills && book.skills.length > 0) {
    tocEntries.push({ label: "Skills", pageNumber: pages.length + 1, indent: false });
    pages.push({ type: "skills", skills: book.skills });
  }

  if (options.certificates && book.certificates.length > 0) {
    tocEntries.push({ label: "Certificates", pageNumber: pages.length + 1, indent: false });
    pages.push({ type: "certificates", certificates: book.certificates });
  }

  for (const project of book.projects) {
    tocEntries.push({ label: project.title, pageNumber: pages.length + 1, indent: false });
    pages.push({ type: "project-cover", projectTitle: project.title, description: project.description });

    for (const section of project.sections) {
      const sectionPages = buildSectionPages(project.title, section);
      tocEntries.push({ label: section.title, pageNumber: pages.length + 1, indent: true });
      pages.push(...sectionPages);
    }
  }

  if (options.toc && tocIndex >= 0) {
    pages[tocIndex] = { type: "toc", entries: tocEntries };
  }

  return pages;
}
