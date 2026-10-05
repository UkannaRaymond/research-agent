export type ResearchStatus = "idle" | "loading" | "done" | "error";

export type ResultsTab = "summary" | "sources";

export interface Finding {
  id: string;
  claim: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface CitationValidation {
  valid: boolean;
  invalidCitations: string[];
  missingFromSources: string[];
  uncitedSources: string[];
}

export interface CritiqueIssue {
  type: "unsupported_claim" | "contradiction";
  explanation: string;
}

export interface Critique {
  passed: boolean;
  issues: CritiqueIssue[];
  /** Flagged sentences the pipeline deleted from the report (absent on older runs). */
  removed?: number;
}

/** Shape returned by POST /api/research */
export interface ResearchResult {
  plan: { questions: string[] };
  research: { findings: { claim: string }[] }[];
  findings: Finding[];
  draft: string;
  citationValidation: CitationValidation;
  /** null when the critic is switched off on the server. */
  critique: Critique | null;
}

/** Findings grouped by the page they came from. */
export interface SourceGroup {
  url: string;
  title: string;
  domain: string;
  ids: string[];
  claims: string[];
}

export interface Report {
  /** Markdown body of the draft, without its trailing "## Sources" section. */
  body: string;
  sources: SourceGroup[];
  /** Finding ID (e.g. "F1") -> URL of the page it came from. */
  citations: Record<string, string>;
  citationValidation: CitationValidation;
  critique: Critique | null;
}

export type RunStatus = "running" | "done" | "error";

export type RunStage =
  | "planning"
  | "researching"
  | "writing"
  | "reviewing"
  | "revising";

/** A stored research run, as returned by GET /api/runs/[id]. */
export interface Run {
  id: string;
  question: string;
  status: RunStatus;
  stage: RunStage | null;
  plan: { questions: string[] } | null;
  /** Per-query progress while running, keyed by query index. */
  queryProgress: Record<string, { findings: number }>;
  research: ResearchResult["research"] | null;
  findings: Finding[] | null;
  draft: string | null;
  citationValidation: CitationValidation | null;
  critique: Critique | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  elapsedSeconds: number;
}

/** One row of the history list, from GET /api/runs. */
export interface RunSummary {
  id: string;
  question: string;
  status: RunStatus;
  createdAt: string;
  completedAt: string | null;
}
