import { Reveal } from "./reveal";
import { Kicker } from "./kicker";

export function Philosophy() {
  return (
    <section id="philosophy" className="border-t border-ground-line px-6 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <div className="flex justify-center">
            <Kicker>Philosophy</Kicker>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-balance font-display text-4xl leading-[1.05] font-medium italic text-ink sm:text-5xl md:text-6xl">
            A portfolio is not a gallery.
            <br />
            It&apos;s an argument.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-balance leading-relaxed text-ink-dim">
            Most portfolio tools optimize for how many projects you can cram onto one page. We
            optimize for the six seconds a recruiter actually gives you — clarifying what you did,
            why it mattered, and presenting it like it belongs in a design annual, not a template
            gallery.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
