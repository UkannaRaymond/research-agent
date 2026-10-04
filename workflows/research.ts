import { createResearchPlan } from "@/agents/planner";
import { researchQuestion } from "@/agents/researcher";
import { writeResearchReport } from "@/agents/writer";
import { critiqueResearch } from "@/agents/critic";
import type { FindingWithId } from "@/schemas/finding";
import { generateText } from "ai";
import { MODELS, openrouter } from "@/lib/ai";
import {
  repairSourcesSection,
  validateCitations,
} from "@/workflows/validate-citations";

const DEBUG = process.env.DEBUG_RESEARCH === "true";

// Logs how long a step takes, even if it fails.
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!DEBUG) return fn();
  const start = Date.now();
  console.log(`${label}: started`);

  try {
    return await fn();
  } finally {
    console.log(`${label}: ${((Date.now() - start) / 1000).toFixed(1)}s`);
  }
}

export async function runResearch(question: string) {
  const plan = await timed("planner", () => createResearchPlan(question));

  const research = await Promise.all(
    plan.questions.map((q, i) =>
      timed(`researcher ${i + 1}`, () => researchQuestion(q)),
    ),
  );

  const findings: FindingWithId[] = research
    .flatMap((result) => result.findings)
    .map((finding, index) => ({
      ...finding,
      id: `F${index + 1}`,
    }));

  const useCritic = process.env.ENABLE_CRITIC === "true";

  let draft = await timed("writer", () => writeResearchReport(findings));

  let critique: Awaited<ReturnType<typeof critiqueResearch>> = {
    passed: true,
    issues: [],
  };

  if (useCritic) {
    critique = await timed("critic", () => critiqueResearch(draft, findings));

    for (let attempt = 1; attempt < 2 && !critique.passed; attempt++) {
      draft = await timed("revise", () =>
        reviseResearchReport(draft, critique, findings),
      );

      critique = await timed("critic (after revise)", () =>
        critiqueResearch(draft, findings),
      );
    }
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

async function reviseResearchReport(
  draft: string,
  critique: {
    passed: boolean;
    issues: {
      type: string;
      explanation: string;
    }[];
  },
  findings: FindingWithId[],
) {
  const issues = critique.issues
    .map((issue) => `- ${issue.type}: ${issue.explanation}`)
    .join("\n");

  const sources = findings
    .map(
      (finding) => `
[${finding.id}]
Claim: ${finding.claim}
Evidence: ${finding.evidence}
Source: ${finding.sourceTitle}
URL: ${finding.sourceUrl}
`,
    )
    .join("\n");

  const result = await generateText({
    model: openrouter(MODELS.writer),
    maxOutputTokens: 6000,
    abortSignal: AbortSignal.timeout(240_000),
    prompt: `
Revise the research report using the critic's feedback.

Fix every issue identified by the critic.

Rules:
- Use only information supported by the research findings.
- Remove unsupported claims.
- Do not invent facts or sources.
- Keep useful information that is already supported.
- Preserve Markdown headings.
- Keep source citations.
- Use the finding IDs exactly as provided.
- Never invent, renumber, or change finding IDs.
- Do not mention the revision process.

Critic feedback:
${issues}

Current report:
${draft}

Research findings:
${sources}
`,
  });

  return result.text;
}
