import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  headline,
  sub,
  children,
}: {
  eyebrow: string;
  headline: ReactNode;
  sub: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(227,161,92,0.1), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex flex-1 items-center px-6 py-16 sm:px-10">
        <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
          <div className="hidden flex-col justify-center lg:flex">
            <Link href="/" className="mb-10 font-display text-sm italic text-ink-dim">
              Portfolio<span className="text-ember">Forge</span>
            </Link>
            <div className="mb-5 flex items-center gap-3 font-meta text-[0.68rem] tracking-[0.16em] text-ember uppercase">
              <span aria-hidden className="h-px w-6 bg-ember-soft" />
              {eyebrow}
            </div>
            <h1 className="max-w-md text-balance font-display text-4xl leading-[1.05] font-medium italic text-ink xl:text-5xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-sm leading-relaxed text-ink-dim">{sub}</p>
          </div>

          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:border-l lg:border-ground-line lg:pl-14">
            <Link href="/" className="mb-8 block font-display text-sm italic text-ink-dim lg:hidden">
              Portfolio<span className="text-ember">Forge</span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
