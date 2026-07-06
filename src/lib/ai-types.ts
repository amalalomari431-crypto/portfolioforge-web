// Shapes returned by the `ai_orchestrator` Appwrite Function
// (appwrite/functions/ai_orchestrator/index.js in the companion Flutter
// project) — this Next.js app calls the same deployed function rather than
// integrating with Gemini a second time.

export type PortfolioAnalysis = {
  score: number;
  recruiterReadiness: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  missing: string[];
  recruiterImpression: string;
  priorityImprovements: string[];
};

export type RecommendationType =
  | "bio"
  | "professionalTitle"
  | "projectDescription"
  | "skill"
  | "certification"
  | "link"
  | "achievement";

export type Recommendation = {
  type: RecommendationType;
  targetId: string | null;
  title: string;
  rationale: string;
  currentValue: string | null;
  suggestedValue: string;
  metadata?: { category?: string } | null;
};

export type ChatReply = {
  reply: string;
  actionableRecommendation: Recommendation | null;
};

export type RecruiterFeedback = {
  firstImpressionSeconds: string;
  wouldInterview: boolean;
  impressionSummary: string;
  redFlags: string[];
  standoutPoints: string[];
  suggestedQuestions: string[];
};

export type CareerAdvice = {
  recommendedTechnologies: string[];
  recommendedCertifications: string[];
  roadmap: { stepTitle: string; description: string; timeframe: string }[];
  rationale: string;
};

export type AiErrorKind = "missing_key" | "rate_limit" | "unavailable" | "failed" | "network";

export type AiOutcome<T> = { ok: true; data: T } | { ok: false; kind: AiErrorKind; message: string };
