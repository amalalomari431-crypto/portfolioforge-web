"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants, type Easing } from "framer-motion";

const EASE_PREMIERE: Easing = [0.16, 1, 0.3, 1];

export function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.12 } },
  };
  const item: Variants = {
    hidden: reduced ? {} : { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_PREMIERE } },
  };

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-32 text-center sm:px-8">
      {/* ambient ember glow — decorative only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 32%, rgba(227,161,92,0.14), transparent 55%), radial-gradient(circle at 74% 68%, rgba(227,161,92,0.08), transparent 60%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 animate-ember-drift opacity-60" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-3xl flex-col items-center"
      >
        <motion.div
          variants={item}
          className="mb-6 flex items-center gap-3 font-meta text-[0.7rem] tracking-[0.18em] text-ink-faint uppercase"
        >
          <span aria-hidden className="h-px w-8 bg-ember-soft" />
          The AI-forged portfolio
          <span aria-hidden className="h-px w-8 bg-ember-soft" />
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance font-display text-5xl leading-[0.98] font-medium italic text-ink sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Where great work
          <br />
          becomes unforgettable
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-balance text-base leading-relaxed text-ink-dim sm:text-lg"
        >
          Turn your projects into a professional portfolio with intelligent organization,
          beautiful presentation, and AI-powered insights.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href={isSignedIn ? "/dashboard" : "/signup"}
            className="group relative overflow-hidden rounded-sm bg-gradient-to-r from-ember-soft to-ember px-8 py-3.5 font-editorial text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
          >
            <span className="relative z-10">
              {isSignedIn ? "Go to dashboard" : "Get started"}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </Link>
          {!isSignedIn && (
            <Link
              href="/signin"
              className="rounded-sm border border-ground-line px-8 py-3.5 font-editorial text-sm font-medium text-ink transition-colors hover:border-ember-soft hover:text-ember"
            >
              Sign in
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
