import Link from "next/link";
import type { NextAction } from "@/lib/portfolio-insights";

export function NextActionCard({ action }: { action: NextAction }) {
  return (
    <div className="rounded-xl border border-ember-soft/40 bg-gradient-to-b from-ember-soft/10 to-ground-raised/20 p-6 backdrop-blur-sm">
      <h3 className="font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">
        Next Suggested Action
      </h3>
      <p className="mt-4 font-display text-xl font-medium text-ink italic">{action.label}</p>
      <p className="mt-1.5 text-sm text-ink-dim">{action.description}</p>
      <Link
        href={action.href}
        className="mt-4 inline-block rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
      >
        Go →
      </Link>
    </div>
  );
}
