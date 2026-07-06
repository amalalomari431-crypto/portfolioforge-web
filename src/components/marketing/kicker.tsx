export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-meta text-[0.68rem] tracking-[0.16em] text-ember uppercase">
      <span aria-hidden className="h-px w-6 bg-ember-soft" />
      {children}
    </div>
  );
}
