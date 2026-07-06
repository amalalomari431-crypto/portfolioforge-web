import Link from "next/link";
import { Reveal } from "./reveal";

export function FinalCta({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-t border-ground-line px-6 py-32 text-center sm:px-8 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(227,161,92,0.1), transparent 60%)",
        }}
      />
      <Reveal className="relative z-10 mx-auto max-w-2xl">
        <h2 className="text-balance font-display text-4xl leading-[1.05] font-medium italic text-ink sm:text-5xl md:text-6xl">
          Raw material becomes
          <br />a forged portfolio.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-balance leading-relaxed text-ink-dim">
          Yours starts here — free to begin, ready whenever your work is.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href={isSignedIn ? "/dashboard" : "/signup"}
            className="rounded-sm bg-gradient-to-r from-ember-soft to-ember px-8 py-3.5 font-editorial text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
          >
            {isSignedIn ? "Go to dashboard" : "Get started"}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
