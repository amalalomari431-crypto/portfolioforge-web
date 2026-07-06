export function DashboardHero({ greeting, name }: { greeting: string; name: string }) {
  return (
    <header className="relative overflow-hidden border-b border-ground-line px-6 py-14 sm:px-8 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(227,161,92,0.12), transparent 55%)",
        }}
      />
      <div className="relative z-10">
        <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ember uppercase">
          {greeting}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium text-ink italic sm:text-5xl">
          {name}
        </h1>
        <p className="mt-3 text-lg text-ink-dim">Continue forging your portfolio.</p>
      </div>
    </header>
  );
}
