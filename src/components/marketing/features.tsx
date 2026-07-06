import { Reveal } from "./reveal";
import { Kicker } from "./kicker";

const FEATURES = [
  {
    n: "01",
    title: "Structured, not just uploaded",
    body: "Projects, galleries, and case-study PDFs live in one place — organized like a real body of work, not a folder of attachments.",
  },
  {
    n: "02",
    title: "Editorial by default",
    body: "Every project reads like a spread from a design annual: considered type, real hierarchy, generous space — never a cramped template grid.",
  },
  {
    n: "03",
    title: "Effortless to keep current",
    body: "Every field autosaves as you type. No save button to forget, no draft to lose — your portfolio is always exactly as current as your work.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-ground-line px-6 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Kicker>Features</Kicker>
          <h2 className="max-w-xl text-balance font-display text-3xl leading-tight font-medium italic text-ink sm:text-4xl">
            The parts that actually matter.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={i * 0.08}>
              <div className="grid grid-cols-[3.5rem_1fr] gap-6 border-t border-ground-line py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
                <span className="font-display text-3xl text-ember-soft italic sm:text-4xl">
                  {f.n}
                </span>
                <div className="max-w-xl">
                  <h3 className="font-editorial text-lg font-semibold text-ink sm:text-xl">
                    {f.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-dim">{f.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <div aria-hidden className="border-t border-ground-line" />
        </div>
      </div>
    </section>
  );
}
