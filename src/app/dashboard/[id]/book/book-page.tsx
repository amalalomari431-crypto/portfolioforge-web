import type { BookPage as BookPageData } from "@/lib/book-pages";

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

function PageNumber({ number }: { number: number | null }) {
  if (number === null) return null;
  return <span className="book-page-number">{String(number).padStart(2, "0")}</span>;
}

export function BookPage({
  page,
  pageNumber,
  showPageNumbers,
}: {
  page: BookPageData;
  pageNumber: number;
  showPageNumbers: boolean;
}) {
  const number = showPageNumbers ? pageNumber : null;
  switch (page.type) {
    case "cover":
      return (
        <div className="book-page">
          {page.heroImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.heroImageUrl} alt="" className="book-cover-hero" />
              <div className="book-cover-scrim" />
              <div className="book-cover-text">
                <p className="book-eyebrow" style={{ color: "#fff", opacity: 0.85 }}>
                  Portfolio
                </p>
                <h1 className="book-heading" style={{ color: "#fff", fontSize: "2.4rem" }}>
                  {page.title}
                </h1>
                {page.userName && <p style={{ color: "#fff", opacity: 0.9 }}>{page.userName}</p>}
              </div>
            </>
          ) : (
            <div className="book-page-inner" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <p className="book-eyebrow">Portfolio</p>
              <h1 className="book-heading" style={{ fontSize: "2.4rem" }}>
                {page.title}
              </h1>
              {page.userName && <p>{page.userName}</p>}
            </div>
          )}
        </div>
      );

    case "toc":
      return (
        <div className="book-page">
          <div className="book-page-inner">
            <h2 className="book-heading" style={{ fontSize: "1.6rem" }}>
              Contents
            </h2>
            <hr className="book-rule" />
            <div style={{ overflowY: "auto" }}>
              {page.entries.map((entry, i) => (
                <div key={i} className="book-toc-entry" data-indent={entry.indent ? "true" : "false"}>
                  <span>{entry.label}</span>
                  <span>{String(entry.pageNumber).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          </div>
          <PageNumber number={number} />
        </div>
      );

    case "about":
      return (
        <div className="book-page">
          <div className="book-page-inner">
            <p className="book-eyebrow">About</p>
            {page.headline && (
              <h2 className="book-heading" style={{ fontSize: "1.4rem" }}>
                {page.headline}
              </h2>
            )}
            <hr className="book-rule" />
            {page.bio && <p className="book-body-text" style={{ whiteSpace: "pre-wrap" }}>{page.bio}</p>}
          </div>
          <PageNumber number={number} />
        </div>
      );

    case "skills":
      return (
        <div className="book-page">
          <div className="book-page-inner">
            <p className="book-eyebrow">Skills</p>
            <h2 className="book-heading" style={{ fontSize: "1.4rem" }}>
              What I bring
            </h2>
            <hr className="book-rule" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", overflowY: "auto" }}>
              {page.skills.map((skill) => (
                <span
                  key={skill.id}
                  style={{
                    border: "1px solid color-mix(in srgb, var(--book-ink) 30%, transparent)",
                    borderRadius: "999px",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.8rem",
                  }}
                >
                  {skill.name}
                  {skill.level ? ` · ${skill.level}` : ""}
                </span>
              ))}
            </div>
          </div>
          <PageNumber number={number} />
        </div>
      );

    case "certificates":
      return (
        <div className="book-page">
          <div className="book-page-inner">
            <p className="book-eyebrow">Certificates</p>
            <h2 className="book-heading" style={{ fontSize: "1.4rem" }}>
              Credentials
            </h2>
            <hr className="book-rule" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
              {page.certificates.map((cert) => (
                <div key={cert.id}>
                  <p style={{ fontWeight: 600 }}>{cert.title}</p>
                  <p style={{ fontSize: "0.8rem", opacity: 0.75 }}>
                    {[cert.issuer, cert.issueDate ? new Date(cert.issueDate).getFullYear() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <PageNumber number={number} />
        </div>
      );

    case "project-cover":
      return (
        <div className="book-page">
          <div className="book-page-inner" style={{ justifyContent: "center" }}>
            <p className="book-eyebrow">Project</p>
            <h2 className="book-heading" style={{ fontSize: "2rem" }}>
              {page.projectTitle}
            </h2>
            <hr className="book-rule" />
            {page.description && <p className="book-body-text">{page.description}</p>}
          </div>
          <PageNumber number={number} />
        </div>
      );

    case "section": {
      const fullBleed =
        page.images.length === 1 && page.otherAssets.length === 0 && isHtmlEmpty(page.content);

      if (fullBleed) {
        return (
          <div className="book-page">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.images[0].url} alt={page.images[0].fileName} className="book-image-full" />
            {!page.continuation && (
              <div className="book-cover-scrim" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 40%)" }} />
            )}
            {!page.continuation && (
              <div className="book-cover-text" style={{ bottom: "5%" }}>
                <p className="book-eyebrow" style={{ color: "#fff", opacity: 0.85 }}>
                  {page.projectTitle}
                </p>
                <h2 className="book-heading" style={{ color: "#fff", fontSize: "1.6rem" }}>
                  {page.sectionTitle}
                </h2>
              </div>
            )}
            {page.images[0].caption && <div className="book-image-caption">{page.images[0].caption}</div>}
            <PageNumber number={number} />
          </div>
        );
      }

      return (
        <div className="book-page">
          <div className="book-page-inner">
            {!page.continuation && (
              <>
                <p className="book-eyebrow">{page.projectTitle}</p>
                <h2 className="book-heading" style={{ fontSize: "1.5rem" }}>
                  {page.sectionTitle}
                </h2>
                <hr className="book-rule" />
              </>
            )}

            {page.content && !isHtmlEmpty(page.content) && (
              <div className="book-body-text" dangerouslySetInnerHTML={{ __html: page.content }} />
            )}

            {page.otherAssets.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {page.otherAssets.map((asset) =>
                  asset.kind === "VIDEO" ? (
                    <div key={asset.id}>
                      <video controls src={asset.url} className="book-video-screen" style={{ width: "100%", borderRadius: "0.4rem" }} />
                      <p className="book-video-print-fallback">Video: {asset.fileName} (view online)</p>
                    </div>
                  ) : (
                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="book-file-card">
                      📄 {asset.fileName}
                    </a>
                  )
                )}
              </div>
            )}

            {page.images.length > 0 && (
              <div
                className="book-image-grid"
                style={{ gridTemplateColumns: page.images.length === 1 ? "1fr" : "repeat(2, 1fr)" }}
              >
                {page.images.map((image) => (
                  <div key={image.id} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.fileName} />
                    {image.caption && <div className="book-image-caption">{image.caption}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <PageNumber number={number} />
        </div>
      );
    }

    default:
      return null;
  }
}
