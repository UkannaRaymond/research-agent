export type ResearchStatus = "idle" | "loading" | "done" | "error";

export type ResultsTab = "summary" | "sources";

export interface Finding {
  id: string;
  claim: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
}

/** Shape returned by POST /api/research */
export interface ResearchResult {
  plan: { questions: string[] };
  research: { findings: { claim: string }[] }[];
  findings: Finding[];
  draft: string;
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
}
