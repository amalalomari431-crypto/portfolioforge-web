"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import "./book.css";
import type { BookPage as BookPageData, BookTemplate, BookPageSize } from "@/lib/book-pages";
import { BookPage } from "./book-page";
import { BookToolbar } from "./book-toolbar";

const PAGE_DIMENSIONS: Record<BookPageSize, string> = {
  a4p: "210mm 297mm",
  a4l: "297mm 210mm",
  a3l: "420mm 297mm",
};

// On-screen pixel size per page — aspect ratio only, print geometry is
// handled separately via the injected @page rule above.
const FLIP_PAGE_PX: Record<BookPageSize, { width: number; height: number }> = {
  a4p: { width: 460, height: 650 },
  a4l: { width: 650, height: 460 },
  a3l: { width: 650, height: 460 },
};

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (n: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    getOrientation: () => "portrait" | "landscape";
  };
};

// showCover (on <HTMLFlipBook> below) makes the engine *treat* the first
// and last pages as hard covers for spread/orientation math, but it only
// ever paints the --hard CSS class onto a page once it has animated
// through a flip — never onto the initially-static cover. data-density is
// the library's own documented escape hatch: HTMLPageCollection reads it
// at construction time and applies the class immediately.
const FlipPage = forwardRef<HTMLDivElement, { children: React.ReactNode; hard?: boolean }>(
  function FlipPage({ children, hard }, ref) {
    return (
      <div ref={ref} className="book-flip-page" data-density={hard ? "hard" : undefined}>
        {children}
      </div>
    );
  }
);

const BackCover = forwardRef<HTMLDivElement, { title: string }>(function BackCover({ title }, ref) {
  return (
    <div ref={ref} className="book-flip-page book-back-cover" data-density="hard">
      <p className="book-eyebrow">{title}</p>
      <p className="book-back-cover-mark">Made with PortfolioForge</p>
    </div>
  );
});

export function BookViewer({
  portfolioId,
  bookTitle,
  isPublished,
  slug,
  template: initialTemplate,
  pageSize,
  showPageNumbers,
  pages,
}: {
  portfolioId: string;
  bookTitle: string;
  isPublished: boolean;
  slug: string;
  template: BookTemplate;
  pageSize: BookPageSize;
  showPageNumbers: boolean;
  pages: BookPageData[];
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef<FlipBookHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelCooldownRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const totalPages = pages.length + 1; // + the synthetic back cover

  // The dashboard layout renders a persistent top nav above every page, so
  // a flat 100vh here would overshoot by the nav's height and leave the
  // document just tall enough to scroll — measuring our own top offset
  // (instead of guessing the nav's height) gives an exact "rest of the
  // viewport" figure regardless of what's rendered above this route.
  useLayoutEffect(() => {
    function recalc() {
      if (!rootRef.current) return;
      setViewportHeight(window.innerHeight - rootRef.current.getBoundingClientRect().top);
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // @page does not accept CSS custom properties, so the exact print
  // geometry for the selected page size is injected as a literal value at
  // runtime rather than expressed in the static stylesheet.
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "book-print-page-size";
    el.textContent = `@page { size: ${PAGE_DIMENSIONS[pageSize]}; margin: 0; }`;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [pageSize]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") flipBookRef.current?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") flipBookRef.current?.pageFlip().flipPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // "The viewport should stay fixed" — belt-and-suspenders alongside the
  // wheel handler's preventDefault: some browsers still let a wheel gesture
  // bleed a few pixels of scroll/overscroll-bounce through to the document
  // before JS ever sees it. Locking html/body directly while this view is
  // mounted, and restoring on unmount, closes that gap.
  useEffect(() => {
    const { documentElement, body } = document;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    documentElement.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  // Wheel/trackpad gestures flip pages instead of scrolling the viewport —
  // the viewport itself never moves. A cooldown turns one swipe gesture
  // (which fires many wheel events) into exactly one page flip. React's
  // onWheel prop attaches a passive listener (preventDefault is a silent
  // no-op there), so this is wired as a real native listener instead.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (wheelCooldownRef.current) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 12) return;
      wheelCooldownRef.current = true;
      if (delta > 0) flipBookRef.current?.pageFlip().flipNext();
      else flipBookRef.current?.pageFlip().flipPrev();
      setTimeout(() => {
        wheelCooldownRef.current = false;
      }, 700);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function handleTemplateChange(next: BookTemplate) {
    setTemplate(next);
    const params = new URLSearchParams(window.location.search);
    params.set("template", next);
    router.replace(`/dashboard/${portfolioId}/book?${params.toString()}`, { scroll: false });
  }

  const { width, height } = FLIP_PAGE_PX[pageSize];

  return (
    <div
      ref={rootRef}
      className="book-root flex flex-col overflow-hidden bg-ground"
      data-book-template={template}
      data-page-size={pageSize}
      style={{ height: viewportHeight !== null ? `${viewportHeight}px` : "100vh" }}
    >
      <BookToolbar
        backHref={`/dashboard/${portfolioId}/generate`}
        template={template}
        onTemplateChange={handleTemplateChange}
        slug={slug}
        isPublished={isPublished}
        publishHref={`/dashboard/${portfolioId}/publish`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => flipBookRef.current?.pageFlip().flipPrev()}
        onNext={() => flipBookRef.current?.pageFlip().flipNext()}
      />

      {/* The real reading experience: a fixed viewport, the book itself
          turns pages. */}
      <div className="book-flip-stage print:hidden" ref={stageRef}>
        <HTMLFlipBook
          ref={flipBookRef}
          className="book-flip"
          style={{}}
          width={width}
          height={height}
          size="stretch"
          minWidth={Math.round(width * 0.55)}
          maxWidth={Math.round(width * 1.3)}
          minHeight={Math.round(height * 0.55)}
          maxHeight={Math.round(height * 1.3)}
          drawShadow
          flippingTime={700}
          usePortrait
          startZIndex={0}
          autoSize
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          startPage={0}
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
        >
          {pages.map((page, i) => (
            <FlipPage key={i} hard={i === 0}>
              <BookPage page={page} pageNumber={i + 1} showPageNumbers={showPageNumbers} />
            </FlipPage>
          ))}
          <BackCover title={bookTitle} />
        </HTMLFlipBook>
      </div>

      {/* Print-only: a real flip DOM only ever shows 1–2 pages at a time,
          so Download PDF / Print reuse the exact same page content in a
          plain stacked layout instead. */}
      <div className="hidden print:block">
        <div className="book-stage">
          {pages.map((page, i) => (
            <div key={i} className="book-print-page-frame">
              <BookPage page={page} pageNumber={i + 1} showPageNumbers={showPageNumbers} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
