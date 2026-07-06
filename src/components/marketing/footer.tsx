import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ground-line px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="font-display text-sm italic text-ink-dim">
          Portfolio<span className="text-ember">Forge</span>
        </Link>
        <p className="font-meta text-[0.65rem] tracking-[0.08em] text-ink-faint uppercase">
          © {new Date().getFullYear()} PortfolioForge — forged, not templated
        </p>
      </div>
    </footer>
  );
}
