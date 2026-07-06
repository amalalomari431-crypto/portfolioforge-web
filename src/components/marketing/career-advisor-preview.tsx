import { Spread } from "./spread";

function CareerAdvisorMockup() {
  const steps = ["Learn WebGL for interactive case studies", "Ship one open-source tool", "Target a Staff Designer role"];
  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col justify-center gap-3 bg-gradient-to-br from-[#201a26] to-ground p-6"
    >
      {steps.map((s, i) => (
        <div key={s} className="flex items-start gap-3">
          <span className="font-display text-lg text-ember-soft italic">{`0${i + 1}`}</span>
          <span className="pt-0.5 font-editorial text-sm text-ink-dim">{s}</span>
        </div>
      ))}
    </div>
  );
}

export function CareerAdvisorPreview() {
  return (
    <Spread
      id="career-advisor"
      kicker="Career Advisor"
      title="Know what to build next."
      body="Not generic industry advice — a roadmap built from the actual gap between what you have today and where you say you're headed, with the technologies and certifications that close it."
      art={<CareerAdvisorMockup />}
    />
  );
}
