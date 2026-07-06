import { Spread } from "./spread";

function AiMockup() {
  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col justify-end gap-3 bg-gradient-to-br from-[#241d2c] via-[#171319] to-ground p-6"
    >
      <div className="max-w-[85%] self-start rounded-sm rounded-bl-none bg-ground-raised/80 px-4 py-2.5 font-editorial text-sm text-ink-dim">
        Analyze my portfolio
      </div>
      <div className="max-w-[90%] self-start rounded-sm rounded-bl-none border border-ember-soft/40 bg-ember/10 px-4 py-3 font-editorial text-sm text-ink">
        Your &ldquo;Villa X&rdquo; case study is strong, but it&apos;s missing the outcome — add a
        result, and this becomes your strongest piece.
      </div>
      <div className="flex items-center gap-2 self-start rounded-sm border border-ember-soft/50 px-3 py-1.5 font-meta text-[0.65rem] text-ember uppercase">
        Apply suggestion
      </div>
    </div>
  );
}

export function AiGenerationSection() {
  return (
    <Spread
      id="ai"
      kicker="AI Portfolio Assistant"
      title={
        <>
          An assistant that already
          <br />
          knows your work.
        </>
      }
      body="Grounded entirely in what's actually in your portfolio — real project names, real skills, real gaps. It analyzes, recommends, and lets you apply a suggestion with one click. Never generic advice disconnected from your data."
      art={<AiMockup />}
    />
  );
}
