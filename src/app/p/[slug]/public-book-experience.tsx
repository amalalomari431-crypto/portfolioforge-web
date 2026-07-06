"use client";

import { useState, useCallback } from "react";
import type { PortfolioBook } from "@/lib/portfolio-book";
import type { BookPage, TocEntry } from "@/lib/book-pages";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  book: PortfolioBook;
  pages: BookPage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function skillLevelDots(level: string | null): number {
  if (!level) return 3;
  const map: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
    MASTER: 5,
  };
  return map[level.toUpperCase()] ?? 3;
}

// ---------------------------------------------------------------------------
// Individual page renderers
// ---------------------------------------------------------------------------
function CoverPageView({ page }: { page: Extract<BookPage, { type: "cover" }> }) {
  return (
    <div className="book-page cover-page">
      {page.heroImageUrl && (
        <div className="cover-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.heroImageUrl} alt="Cover" className="cover-hero-img" />
          <div className="cover-hero-overlay" />
        </div>
      )}
      <div className="cover-content">
        <p className="cover-by">Portfolio by</p>
        <h1 className="cover-name">{page.userName}</h1>
        <h2 className="cover-title">{page.title}</h2>
      </div>
    </div>
  );
}

function TocPageView({ page }: { page: Extract<BookPage, { type: "toc" }> }) {
  return (
    <div className="book-page toc-page">
      <h2 className="page-section-label">Table of Contents</h2>
      <ol className="toc-list">
        {page.entries.map((entry: TocEntry, i: number) => (
          <li key={i} className={`toc-entry${entry.indent ? " toc-entry--indent" : ""}`}>
            <span className="toc-label">{entry.label}</span>
            <span className="toc-dots" aria-hidden="true" />
            <span className="toc-page-num">{entry.pageNumber}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AboutPageView({ page }: { page: Extract<BookPage, { type: "about" }> }) {
  return (
    <div className="book-page about-page">
      <h2 className="page-section-label">About</h2>
      {page.headline && <p className="about-headline">{page.headline}</p>}
      {page.bio && <p className="about-bio">{page.bio}</p>}
    </div>
  );
}

function SkillsPageView({ page }: { page: Extract<BookPage, { type: "skills" }> }) {
  return (
    <div className="book-page skills-page">
      <h2 className="page-section-label">Skills</h2>
      <ul className="skills-grid">
        {page.skills.map((skill) => (
          <li key={skill.id} className="skill-item">
            <span className="skill-name">{skill.name}</span>
            <span className="skill-dots" aria-label={skill.level ?? "skill level"}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`skill-dot${i < skillLevelDots(skill.level) ? " skill-dot--filled" : ""}`}
                />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertificatesPageView({ page }: { page: Extract<BookPage, { type: "certificates" }> }) {
  return (
    <div className="book-page certificates-page">
      <h2 className="page-section-label">Certificates</h2>
      <ul className="cert-list">
        {page.certificates.map((cert) => (
          <li key={cert.id} className="cert-item">
            <p className="cert-title">{cert.title}</p>
            {cert.issuer && <p className="cert-issuer">{cert.issuer}</p>}
            {cert.issueDate && (
              <p className="cert-date">
                {new Date(cert.issueDate).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link">
                View credential ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCoverPageView({ page }: { page: Extract<BookPage, { type: "project-cover" }> }) {
  return (
    <div className="book-page project-cover-page">
      <div className="project-cover-inner">
        <p className="project-cover-eyebrow">Project</p>
        <h2 className="project-cover-title">{page.projectTitle}</h2>
        {page.description && <p className="project-cover-desc">{page.description}</p>}
      </div>
    </div>
  );
}

function SectionPageView({ page }: { page: Extract<BookPage, { type: "section" }> }) {
  const images = page.images;
  return (
    <div className="book-page section-page">
      <div className="section-header">
        <span className="section-eyebrow">{page.projectTitle}</span>
        <h3 className="section-title">
          {page.continuation ? `${page.sectionTitle} (continued)` : page.sectionTitle}
        </h3>
      </div>

      {page.content && !page.continuation && (
        <p className="section-content">{page.content}</p>
      )}

      {images.length > 0 && (
        <div className={`section-images section-images--${Math.min(images.length, 4)}`}>
          {images.map((asset) => (
            <figure key={asset.id} className="section-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={asset.caption ?? asset.fileName} className="section-img" />
              {asset.caption && <figcaption className="section-caption">{asset.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {page.otherAssets.length > 0 && !page.continuation && (
        <ul className="section-other-assets">
          {page.otherAssets.map((asset) => (
            <li key={asset.id}>
              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="asset-link">
                📎 {asset.fileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BookPageView({ page, index }: { page: BookPage; index: number }) {
  switch (page.type) {
    case "cover":
      return <CoverPageView page={page} />;
    case "toc":
      return <TocPageView page={page} />;
    case "about":
      return <AboutPageView page={page} />;
    case "skills":
      return <SkillsPageView page={page} />;
    case "certificates":
      return <CertificatesPageView page={page} />;
    case "project-cover":
      return <ProjectCoverPageView page={page} />;
    case "section":
      return <SectionPageView page={page} />;
    default:
      return (
        <div className="book-page">
          <p style={{ color: "#999" }}>Unknown page type at position {index + 1}</p>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function PublicBookExperience({ book, pages }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  const handleDownloadPdf = useCallback(() => {
    window.print();
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const goTo = (n: number) => setCurrentPage(Math.max(0, Math.min(n, pages.length - 1)));

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Print-only stack: every page rendered for window.print()            */}
      {/* ------------------------------------------------------------------ */}
      <div className="print-stack" aria-hidden="true">
        {pages.map((page, i) => (
          <div key={i} className="print-page">
            <BookPageView page={page} index={i} />
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Screen experience                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className={`book-shell${isFullscreen ? " book-shell--fullscreen" : ""}`}>
        {/* Top toolbar */}
        <header className="book-toolbar">
          <div className="book-toolbar-left">
            <span className="book-toolbar-title">{book.title}</span>
            <span className="book-toolbar-author">by {book.userName}</span>
          </div>
          <div className="book-toolbar-right">
            <button
              id="book-btn-copy-link"
              className="book-btn"
              onClick={handleCopyLink}
              title="Copy link"
              aria-label="Copy link"
            >
              🔗
            </button>
            <button
              id="book-btn-download-pdf"
              className="book-btn"
              onClick={handleDownloadPdf}
              title="Download PDF"
              aria-label="Download PDF"
            >
              ⬇ PDF
            </button>
            <button
              id="book-btn-fullscreen"
              className="book-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
        </header>

        {/* Page viewer */}
        <main className="book-viewer">
          <button
            id="book-btn-prev"
            className="book-nav book-nav--prev"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            ‹
          </button>

          <div className="book-page-wrap">
            {pages[currentPage] && (
              <BookPageView page={pages[currentPage]} index={currentPage} />
            )}
          </div>

          <button
            id="book-btn-next"
            className="book-nav book-nav--next"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === pages.length - 1}
            aria-label="Next page"
          >
            ›
          </button>
        </main>

        {/* Bottom pagination */}
        <footer className="book-footer">
          <span className="book-page-counter">
            {pages.length > 0 ? `${currentPage + 1} / ${pages.length}` : "—"}
          </span>
          <div className="book-dot-nav" role="tablist" aria-label="Page navigation">
            {pages.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentPage}
                aria-label={`Go to page ${i + 1}`}
                className={`book-dot${i === currentPage ? " book-dot--active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </footer>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Scoped styles (no Tailwind dep; no external CSS file required)      */}
      {/* ------------------------------------------------------------------ */}
      <style>{`
        /* ---- Print stack ---- */
        .print-stack { display: none; }
        @media print {
          .book-shell { display: none !important; }
          .print-stack {
            display: block;
          }
          .print-page {
            page-break-after: always;
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
            padding: 0;
            margin: 0 auto;
          }
          .print-page:last-child { page-break-after: avoid; }
        }

        /* ---- Shell ---- */
        .book-shell {
          display: flex;
          flex-direction: column;
          min-height: 100svh;
          background: #1a1a2e;
          color: #e0e0e0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .book-shell--fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        /* ---- Toolbar ---- */
        .book-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          gap: 12px;
          flex-shrink: 0;
        }
        .book-toolbar-left { display: flex; flex-direction: column; gap: 2px; }
        .book-toolbar-title { font-weight: 700; font-size: 1rem; color: #fff; }
        .book-toolbar-author { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .book-toolbar-right { display: flex; gap: 8px; align-items: center; }
        .book-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #e0e0e0;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .book-btn:hover { background: rgba(255,255,255,0.16); }

        /* ---- Viewer ---- */
        .book-viewer {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 24px 16px;
          overflow: hidden;
        }
        .book-page-wrap {
          flex: 1;
          max-width: 820px;
          display: flex;
          justify-content: center;
        }
        .book-nav {
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          font-size: 3rem;
          cursor: pointer;
          padding: 0 8px;
          transition: color 0.15s;
          line-height: 1;
          flex-shrink: 0;
        }
        .book-nav:hover:not(:disabled) { color: #fff; }
        .book-nav:disabled { opacity: 0.15; cursor: default; }

        /* ---- Footer ---- */
        .book-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .book-page-counter { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        .book-dot-nav { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; max-width: 600px; }
        .book-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s, transform 0.15s;
        }
        .book-dot--active { background: #6c63ff; transform: scale(1.3); }
        .book-dot:hover:not(.book-dot--active) { background: rgba(255,255,255,0.4); }

        /* ---- Shared book page ---- */
        .book-page {
          background: #ffffff;
          color: #1a1a1a;
          width: 100%;
          max-width: 760px;
          min-height: 520px;
          border-radius: 8px;
          padding: 48px 56px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .page-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6c63ff;
          margin: 0 0 24px;
        }

        /* ---- Cover ---- */
        .cover-page {
          background: #16213e;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0;
        }
        .cover-hero {
          position: absolute;
          inset: 0;
        }
        .cover-hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .cover-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(22,33,62,0.3) 0%, rgba(22,33,62,0.9) 60%, #16213e 100%);
        }
        .cover-content {
          position: relative;
          z-index: 1;
          padding: 48px 56px;
        }
        .cover-by { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 0 0 4px; }
        .cover-name { font-size: 2rem; font-weight: 800; margin: 0 0 8px; color: #fff; }
        .cover-title { font-size: 1.1rem; font-weight: 400; color: rgba(255,255,255,0.7); margin: 0; }

        /* ---- TOC ---- */
        .toc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .toc-entry { display: flex; align-items: baseline; gap: 4px; font-size: 0.9rem; }
        .toc-entry--indent { padding-left: 20px; font-size: 0.82rem; color: #555; }
        .toc-label { flex-shrink: 0; }
        .toc-dots {
          flex: 1;
          border-bottom: 1px dotted #ccc;
          margin: 0 6px;
          position: relative;
          top: -3px;
        }
        .toc-page-num { flex-shrink: 0; color: #6c63ff; font-weight: 600; }

        /* ---- About ---- */
        .about-headline { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; }
        .about-bio { font-size: 0.95rem; line-height: 1.7; color: #444; margin: 0; }

        /* ---- Skills ---- */
        .skills-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .skill-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; background: #f7f7fc; border-radius: 6px; }
        .skill-name { font-size: 0.88rem; font-weight: 500; }
        .skill-dots { display: flex; gap: 4px; }
        .skill-dot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; }
        .skill-dot--filled { background: #6c63ff; }

        /* ---- Certificates ---- */
        .cert-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
        .cert-item { padding: 14px 16px; border-left: 3px solid #6c63ff; background: #f7f7fc; border-radius: 0 6px 6px 0; }
        .cert-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 4px; }
        .cert-issuer { font-size: 0.82rem; color: #555; margin: 0 0 2px; }
        .cert-date { font-size: 0.78rem; color: #888; margin: 0 0 6px; }
        .cert-link { font-size: 0.78rem; color: #6c63ff; text-decoration: none; }
        .cert-link:hover { text-decoration: underline; }

        /* ---- Project cover ---- */
        .project-cover-page {
          background: #6c63ff;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .project-cover-inner { text-align: center; }
        .project-cover-eyebrow { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin: 0 0 12px; }
        .project-cover-title { font-size: 2rem; font-weight: 800; margin: 0 0 16px; }
        .project-cover-desc { font-size: 0.95rem; color: rgba(255,255,255,0.8); margin: 0; max-width: 480px; }

        /* ---- Section ---- */
        .section-header { margin-bottom: 16px; }
        .section-eyebrow { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6c63ff; display: block; margin-bottom: 4px; }
        .section-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
        .section-content { font-size: 0.88rem; line-height: 1.65; color: #444; margin: 0 0 20px; }
        .section-images { display: grid; gap: 10px; margin-bottom: 16px; }
        .section-images--1 { grid-template-columns: 1fr; }
        .section-images--2 { grid-template-columns: 1fr 1fr; }
        .section-images--3 { grid-template-columns: 1fr 1fr 1fr; }
        .section-images--4 { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
        .section-figure { margin: 0; }
        .section-img { width: 100%; height: 160px; object-fit: cover; border-radius: 4px; display: block; }
        .section-caption { font-size: 0.72rem; color: #888; margin: 4px 0 0; text-align: center; }
        .section-other-assets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .asset-link { font-size: 0.82rem; color: #6c63ff; text-decoration: none; }
        .asset-link:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}
