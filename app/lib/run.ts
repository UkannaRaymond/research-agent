import type { ResearchResult, Run } from "../types";

/** The finished result of a run, or null while it is running / failed. */
export function toResearchResult(run: Run | null): ResearchResult | null {
  if (
    !run ||
    run.status !== "done" ||
    !run.plan ||
    !run.research ||
    !run.findings ||
    run.draft === null ||
    !run.citationValidation
  ) {
    return null;
  }

  return {
    plan: run.plan,
    research: run.research,
    findings: run.findings,
    draft: run.draft,
    citationValidation: run.citationValidation,
    critique: run.critique ?? null,
  };
}

/** Text for the status banner while a run is in progress. */
export function stageMessage(run: Run): string {
  const total = run.plan?.questions.length ?? 0;
  const done = Object.keys(run.queryProgress).length;

  switch (run.stage) {
    case "planning":
      return "Planning research queries…";
    case "researching":
      return total > 0
        ? `Researching ${Math.min(done, total)} of ${total} queries done…`
        : "Researching across multiple sources…";
    case "writing":
      return "Writing the report…";
    case "reviewing":
      return "Reviewing claims against the sources…";
    case "revising":
      return "Revising the report…";
    default:
      return "Researching across multiple sources…";
  }
}
