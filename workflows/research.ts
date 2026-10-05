import { createResearchPlan } from "@/agents/planner";
import { researchQuestion } from "@/agents/researcher";
import { writeResearchReport } from "@/agents/writer";
import { critiqueResearch } from "@/agents/critic";
import type { FindingWithId } from "@/schemas/finding";
import type { Critique, CritiqueResult } from "@/schemas/critique";
import { normalizeCitations } from "@/workflows/normalize-citations";
import {
  repairSourcesSection,
  validateCitations,
} from "@/workflows/validate-citations";

export type ResearchStage =
  | "planning"
  | "researching"
  | "writing"
  | "reviewing"
  | "revising";

/** Optional progress callbacks (used to persist progress while a run is going). */
export interface ResearchHooks {
  onStage?: (stage: ResearchStage) => void | Promise<void>;
  onPlan?: (plan: { questions: string[] }) => void | Promise<void>;
  onQueryDone?: (
    index: number,
    result: { findings: unknown[] },
  ) => void | Promise<void>;
}

// Progress reporting must never break the research itself.
async function emit(callback: () => void | Promise<void>) {
  try {
    await callback();
  } catch (error) {
    console.error("Progress update failed:", error);
  }
}

// Logs how long each step takes when DEBUG_RESEARCH=true.
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (process.env.DEBUG_RESEARCH !== "true") return fn();

  const start = Date.now();
  console.log(`${label}: started`);

  try {
    return await fn();
  } finally {
    console.log(`${label}: ${((Date.now() - start) / 1000).toFixed(1)}s`);
  }
}

export async function runResearch(question: string, hooks: ResearchHooks = {}) {
  const criticEnabled = process.env.ENABLE_CRITIC === "true";

  await emit(() => hooks.onStage?.("planning"));
  const plan = await timed("planner", () => createResearchPlan(question));
  await emit(() => hooks.onPlan?.(plan));

  const research = await Promise.all(
    plan.questions.map(async (q, i) => {
      const result = await timed(`researcher ${i + 1}`, () =>
        researchQuestion(q),
      );
      await emit(() => hooks.onQueryDone?.(i, result));
      return result;
    }),
  );

  const findings: FindingWithId[] = research
    .flatMap((result) => result.findings)
    .map((finding, index) => ({
      ...finding,
      id: `F${index + 1}`,
    }));

  await emit(() => hooks.onStage?.("writing"));
  let draft = normalizeCitations(
    await timed("writer", () => writeResearchReport(question, findings)),
  );

  // null when the critic is switched off (ENABLE_CRITIC is not "true").
  let critique: Critique | null = null;

  if (criticEnabled) {
    await emit(() => hooks.onStage?.("reviewing"));
    const review = await timed("critic", () =>
      critiqueResearch(draft, findings),
    );

    // Delete flagged sentences in code: no extra model calls, and the
    // removal is guaranteed (a rewrite can reintroduce the same claim).
    const cleaned = removeFlaggedSentences(draft, review.issues);
    draft = cleaned.draft;

    critique = {
      passed: cleaned.remaining.length === 0,
      issues: cleaned.remaining.map(({ type, explanation }) => ({
        type,
        explanation,
      })),
      removed: cleaned.removed,
    };
  }

  // Deterministically rebuild Sources from citations in the final draft.
  draft = repairSourcesSection(draft, findings);

  const citationValidation = validateCitations(draft, findings);

  return {
    plan,
    research,
    findings,
    draft,
    citationValidation,
    critique,
  };
}

type FlaggedIssue = CritiqueResult["issues"][number];

/** Removes each flagged sentence that can be found verbatim in the draft. */
function removeFlaggedSentences(draft: string, issues: FlaggedIssue[]) {
  let out = draft;
  let removed = 0;
  const remaining: FlaggedIssue[] = [];

  for (const issue of issues) {
    const sentence = issue.sentence.trim();

    // Too short or multi-line means the model did not copy a single sentence.
    if (
      sentence.length >= 20 &&
      !sentence.includes("\n") &&
      out.includes(sentence)
    ) {
      out = out.replace(sentence, "");
      removed += 1;
    } else {
      remaining.push(issue);
    }
  }

  out = out.replace(/(\S) {2,}(?=\S)/g, "$1 ").replace(/\n{3,}/g, "\n\n");

  return { draft: out, removed, remaining };
}
