import { Spread } from "./spread";

function RecruiterMockup() {
  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1b1b26] to-ground p-6 text-center"
    >
      <span className="font-meta text-[0.65rem] tracking-[0.14em] text-ink-faint uppercase">
        First impression
      </span>
      <span className="font-display text-6xl font-medium text-ember italic">6s</span>
      <span className="max-w-[20ch] font-editorial text-sm text-ink-dim">
        &ldquo;Would interview — strong visuals, but I&apos;d ask about the team size.&rdquo;
      </span>
    </div>
  );
}

export function RecruiterSimulationPreview() {
  return (
    <Spread
      id="recruiter-simulation"
      reverse
      kicker="Recruiter Simulation"
      title={
        <>
          Six seconds.
          <br />
          That&apos;s what you get.
        </>
      }
      body="See your portfolio the way a recruiter actually reads it — a candid first impression, red flags, standout points, and the questions it would raise, before a real recruiter ever sees it."
      art={<RecruiterMockup />}
    />
  );
}
