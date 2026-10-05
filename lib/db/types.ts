export const RUN_STATUSES = ["running", "done", "error"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const RUN_STAGES = [
  "planning",
  "researching",
  "writing",
  "reviewing",
  "revising",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export interface StoredFinding {
  id: string;
  claim: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface StoredPlan {
  questions: string[];
}

export interface StoredResearch {
  findings: Omit<StoredFinding, "id">[];
}

export interface StoredCitationValidation {
  valid: boolean;
  invalidCitations: string[];
  missingFromSources: string[];
  uncitedSources: string[];
}

export interface StoredCritique {
  passed: boolean;
  issues: { type: "unsupported_claim" | "contradiction"; explanation: string }[];
}
