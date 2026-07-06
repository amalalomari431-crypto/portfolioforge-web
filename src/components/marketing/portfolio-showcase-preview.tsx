import { Reveal } from "./reveal";
import { Kicker } from "./kicker";

export function PortfolioShowcasePreview() {
  return (
    <section id="showcase" className="border-t border-ground-line px-6 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <div className="flex justify-center">
            <Kicker>The Reveal</Kicker>
          </div>
          <h2 className="text-balance font-display text-4xl leading-[1.05] font-medium italic text-ink sm:text-5xl">
            Not a webpage.
            <br />A published portfolio.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-balance leading-relaxed text-ink-dim">
            Visitors don&apos;t scroll a website — they open a cover, turn pages, and read a
            portfolio built with the same rhythm as a design annual or an exhibition catalogue.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <div className="mx-auto mt-16 aspect-[16/9] max-w-3xl overflow-hidden rounded-sm border border-ground-line">
          <div
            aria-hidden
            className="relative grid h-full grid-cols-2 bg-[#ededf0]"
          >
            <div className="flex flex-col justify-end gap-3 border-r border-black/10 p-8">
              <span className="font-meta text-[0.6rem] tracking-[0.1em] text-[#7a5430] uppercase">
                Product Design · 2024
              </span>
              <h3 className="font-display text-2xl font-medium text-[#1b1b20] italic sm:text-3xl">
                Trust, redesigned.
              </h3>
              <p className="max-w-[26ch] text-sm text-[#55555f]">
                A banking app rebuilt around one idea: show people their money moving.
              </p>
            </div>
            <div
              className="bg-gradient-to-br from-[#2a2440] via-[#1b1b26] to-[#12131a]"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
