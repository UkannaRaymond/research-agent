import { createResearchPlan } from "@/agents/planner";
import { researchQuestion } from "@/agents/researcher";
import { writeResearchReport } from "@/agents/writer";
import { critiqueResearch } from "@/agents/critic";
import type { FindingWithId } from "@/schemas/finding";
import { generateText } from "ai";
import { openrouter } from "@/lib/ai";
import {
  repairSourcesSection,
  validateCitations,
} from "@/workflows/validate-citations";

export async function runResearch(question: string) {
  const plan = await createResearchPlan(question);

  const research = await Promise.all(
    plan.questions.map((question) => researchQuestion(question)),
  );

  const findings: FindingWithId[] = research
    .flatMap((result) => result.findings)
    .map((finding, index) => ({
      ...finding,
      id: `F${index + 1}`,
    }));

  let draft = await writeResearchReport(findings);

  let critique = await critiqueResearch(draft, findings);

  for (let attempt = 1; attempt < 2 && !critique.passed; attempt++) {
    draft = await reviseResearchReport(draft, critique, findings);

    critique = await critiqueResearch(draft, findings);
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
    model: openrouter("openai/gpt-4o-mini"),
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
