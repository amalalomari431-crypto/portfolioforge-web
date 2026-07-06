import { Reveal } from "./reveal";
import { Kicker } from "./kicker";

export function Spread({
  id,
  reverse = false,
  kicker,
  title,
  body,
  art,
  children,
}: {
  id?: string;
  reverse?: boolean;
  kicker: string;
  title: React.ReactNode;
  body: string;
  art: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-t border-ground-line px-6 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 sm:gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div className={reverse ? "lg:order-2" : undefined}>
          <Reveal>
            <Kicker>{kicker}</Kicker>
            <h2 className="text-balance font-display text-3xl leading-tight font-medium italic text-ink sm:text-4xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-dim">{body}</p>
            {children}
          </Reveal>
        </div>
        <Reveal delay={0.15} className={reverse ? "lg:order-1" : undefined}>
          <div className="aspect-[4/3] overflow-hidden rounded-sm border border-ground-line">
            {art}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
