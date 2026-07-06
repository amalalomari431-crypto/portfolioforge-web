"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type {
  AiOutcome,
  CareerAdvice,
  PortfolioAnalysis,
  Recommendation,
  RecruiterFeedback,
} from "@/lib/ai-types";
import { applyAiRecommendation, runAiQuickAction, sendAiChatMessage } from "./actions";

type Entry =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "analysis"; data: PortfolioAnalysis }
  | { kind: "recommendations"; data: Recommendation[] }
  | { kind: "recruiter"; data: RecruiterFeedback }
  | { kind: "career"; data: CareerAdvice }
  | { kind: "error"; message: string };

function recommendationKey(rec: Recommendation) {
  return `${rec.type}:${rec.targetId ?? ""}:${rec.suggestedValue}`;
}

function handleOutcome<T>(
  outcome: AiOutcome<T>,
  onOk: (data: T) => void,
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>
) {
  if (outcome.ok) {
    onOk(outcome.data);
  } else {
    setEntries((prev) => [...prev, { kind: "error", message: outcome.message }]);
  }
}

export function AiAssistantClient({
  portfolioId,
  initialCompletionPercent,
}: {
  portfolioId: string;
  initialCompletionPercent: number;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [lastScore, setLastScore] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  // Proactive: run a first analysis immediately, same as the Flutter
  // AI Assistant's opening summary — no button tap required.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startTransition(async () => {
      const outcome = await runAiQuickAction(portfolioId, "analyzePortfolio");
      handleOutcome(
        outcome,
        (data) => {
          setEntries((prev) => [...prev, { kind: "analysis", data }]);
          setLastScore(data.score);
        },
        setEntries
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runQuickAction(feature: "analyzePortfolio" | "recommend" | "recruiterSimulation" | "careerAdvice") {
    startTransition(async () => {
      switch (feature) {
        case "analyzePortfolio": {
          const outcome = await runAiQuickAction(portfolioId, "analyzePortfolio");
          handleOutcome(
            outcome,
            (data) => {
              setEntries((prev) => [...prev, { kind: "analysis", data }]);
              setLastScore(data.score);
            },
            setEntries
          );
          break;
        }
        case "recommend": {
          const outcome = await runAiQuickAction(portfolioId, "recommend");
          handleOutcome(outcome, (data) => setEntries((prev) => [...prev, { kind: "recommendations", data: data.recommendations }]), setEntries);
          break;
        }
        case "recruiterSimulation": {
          const outcome = await runAiQuickAction(portfolioId, "recruiterSimulation");
          handleOutcome(outcome, (data) => setEntries((prev) => [...prev, { kind: "recruiter", data }]), setEntries);
          break;
        }
        case "careerAdvice": {
          const outcome = await runAiQuickAction(portfolioId, "careerAdvice");
          handleOutcome(outcome, (data) => setEntries((prev) => [...prev, { kind: "career", data }]), setEntries);
          break;
        }
      }
    });
  }

  function send() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput("");
    setEntries((prev) => [...prev, { kind: "user", text }]);

    const history = entries
      .filter((e): e is Entry & { kind: "user" | "assistant" } => e.kind === "user" || e.kind === "assistant")
      .slice(-10)
      .map((e) => ({ role: e.kind === "user" ? ("user" as const) : ("assistant" as const), content: e.text }));

    startTransition(async () => {
      const outcome = await sendAiChatMessage(portfolioId, text, history);
      handleOutcome(
        outcome,
        (data) => {
          setEntries((prev) => [...prev, { kind: "assistant", text: data.reply }]);
          if (data.actionableRecommendation) {
            setEntries((prev) => [...prev, { kind: "recommendations", data: [data.actionableRecommendation!] }]);
          }
        },
        setEntries
      );
    });
  }

  function apply(rec: Recommendation) {
    startTransition(async () => {
      const result = await applyAiRecommendation(portfolioId, rec);
      if (result.ok) {
        setAppliedKeys((prev) => new Set(prev).add(recommendationKey(rec)));
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">AI Portfolio Assistant</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Grounded in your real portfolio data — nothing here is invented.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/60 to-ground-raised/20 p-5 backdrop-blur-sm">
        <div>
          <p className="font-display text-2xl font-medium text-ink italic">{initialCompletionPercent}%</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Profile completion</p>
        </div>
        <div className="h-8 w-px bg-ground-line" />
        <div>
          <p className="font-display text-2xl font-medium text-ink italic">{lastScore ?? "—"}</p>
          <p className="font-meta text-[0.6rem] tracking-[0.06em] text-ink-faint uppercase">Last AI score</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickActionButton label="Analyze my portfolio" onClick={() => runQuickAction("analyzePortfolio")} disabled={isPending} />
        <QuickActionButton label="Get recommendations" onClick={() => runQuickAction("recommend")} disabled={isPending} />
        <QuickActionButton label="Simulate recruiter" onClick={() => runQuickAction("recruiterSimulation")} disabled={isPending} />
        <QuickActionButton label="Career advice" onClick={() => runQuickAction("careerAdvice")} disabled={isPending} />
      </div>

      <div className="flex min-h-[320px] flex-1 flex-col gap-3 rounded-xl border border-ground-line bg-ground-raised/20 p-5">
        {entries.length === 0 && !isPending && (
          <p className="m-auto text-sm text-ink-faint">Preparing your portfolio summary…</p>
        )}
        {entries.map((entry, i) => (
          <EntryView key={i} entry={entry} appliedKeys={appliedKeys} onApply={apply} isPending={isPending} />
        ))}
        {isPending && <p className="text-sm text-ink-faint">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={isPending}
          placeholder="Ask about your portfolio — e.g. “improve my bio”"
          className="flex-1 rounded-full border border-ground-line bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={isPending || !input.trim()}
          className="rounded-full bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-ground-line px-4 py-2 text-sm text-ink-dim transition-colors hover:border-ember hover:text-ink disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function EntryView({
  entry,
  appliedKeys,
  onApply,
  isPending,
}: {
  entry: Entry;
  appliedKeys: Set<string>;
  onApply: (rec: Recommendation) => void;
  isPending: boolean;
}) {
  switch (entry.kind) {
    case "user":
      return (
        <div className="ml-auto max-w-[75%] rounded-2xl bg-ember px-4 py-2 text-sm text-[#1a1208]">{entry.text}</div>
      );
    case "assistant":
      return (
        <div className="max-w-[85%] rounded-2xl border border-ground-line bg-ground-raised/40 px-4 py-2 text-sm text-ink">
          {entry.text}
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-2 rounded-lg border-l-2 border-red-400/70 bg-ground-raised/40 px-4 py-3 text-sm text-ink-dim">
          {entry.message}
        </div>
      );
    case "analysis":
      return <AnalysisCard analysis={entry.data} />;
    case "recommendations":
      return (
        <div className="flex flex-col gap-2">
          {entry.data.map((rec) => (
            <RecommendationCard
              key={recommendationKey(rec)}
              recommendation={rec}
              applied={appliedKeys.has(recommendationKey(rec))}
              onApply={() => onApply(rec)}
              disabled={isPending}
            />
          ))}
        </div>
      );
    case "recruiter":
      return <RecruiterCard feedback={entry.data} />;
    case "career":
      return <CareerAdviceCard advice={entry.data} />;
  }
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ground-line bg-ground-raised/40 p-4 text-sm text-ink">{children}</div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">{title}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-dim">
            <span className="text-ember">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: PortfolioAnalysis }) {
  return (
    <SectionCard>
      <p className="font-display text-xl font-medium text-ink italic">{analysis.score}/100</p>
      <p className="mt-2 text-sm text-ink-dim">{analysis.recruiterImpression}</p>
      <BulletList title="Strengths" items={analysis.strengths} />
      <BulletList title="Weaknesses" items={analysis.weaknesses} />
      <BulletList title="Missing" items={analysis.missing} />
      <BulletList title="Priority improvements" items={analysis.priorityImprovements} />
    </SectionCard>
  );
}

function RecommendationCard({
  recommendation,
  applied,
  onApply,
  disabled,
}: {
  recommendation: Recommendation;
  applied: boolean;
  onApply: () => void;
  disabled: boolean;
}) {
  const canApply = recommendation.type !== "certification" && (recommendation.type === "bio" ||
    recommendation.type === "professionalTitle" ||
    recommendation.type === "skill" ||
    !!recommendation.targetId);

  return (
    <div className="rounded-xl border border-ember-soft/40 bg-ground-raised/40 p-4">
      <p className="font-display text-base font-medium text-ink italic">{recommendation.title}</p>
      <p className="mt-1 text-sm text-ink-dim">{recommendation.rationale}</p>
      <p className="mt-2 rounded-lg bg-ground/60 p-3 text-sm text-ink">{recommendation.suggestedValue}</p>
      {applied ? (
        <span className="mt-3 inline-block font-meta text-[0.65rem] tracking-[0.06em] text-ember uppercase">
          ✓ Applied
        </span>
      ) : canApply ? (
        <button
          type="button"
          onClick={onApply}
          disabled={disabled}
          className="mt-3 rounded-full bg-gradient-to-r from-ember-soft to-ember px-4 py-1.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          Apply
        </button>
      ) : (
        <p className="mt-3 font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">
          Advisory only — no safe field to write this into automatically
        </p>
      )}
    </div>
  );
}

function RecruiterCard({ feedback }: { feedback: RecruiterFeedback }) {
  return (
    <SectionCard>
      <p className="font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">
        First impression: {feedback.firstImpressionSeconds}
      </p>
      <p className="mt-2 text-sm text-ink-dim">{feedback.impressionSummary}</p>
      <BulletList title="Standout points" items={feedback.standoutPoints} />
      <BulletList title="Red flags" items={feedback.redFlags} />
      <BulletList title="Questions they might ask" items={feedback.suggestedQuestions} />
    </SectionCard>
  );
}

function CareerAdviceCard({ advice }: { advice: CareerAdvice }) {
  return (
    <SectionCard>
      <p className="text-sm text-ink-dim">{advice.rationale}</p>
      <BulletList title="Recommended technologies" items={advice.recommendedTechnologies} />
      <BulletList title="Certifications to consider" items={advice.recommendedCertifications} />
      {advice.roadmap.length > 0 && (
        <div className="mt-3">
          <p className="font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Roadmap</p>
          <div className="mt-1.5 flex flex-col gap-2">
            {advice.roadmap.map((step, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-ink">
                  {step.stepTitle} · {step.timeframe}
                </p>
                <p className="text-sm text-ink-faint">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
