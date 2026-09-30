import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { CritiqueSchema } from "@/schemas/critique";
import type { Finding } from "@/schemas/finding";

export async function critiqueResearch(
  draft: string,
  research: { findings: Finding[] }[],
) {
  const findings = research.flatMap((result) => result.findings);

  const sources = findings
    .map(
      (finding, index) => `
[${index + 1}]
Claim: ${finding.claim}
Evidence: ${finding.evidence}
Source: ${finding.sourceTitle}
URL: ${finding.sourceUrl}
`,
    )
    .join("\n");

  const response = await generateText({
    model: openrouter("openai/gpt-4o-mini"),
    output: Output.object({
      schema: CritiqueSchema,
    }),
    prompt: `
Review the research report against the provided research findings.

Check for:
- unsupported claims
- missing sources
- weak evidence
- contradictions
- outdated information

A claim is unsupported if it cannot be reasonably supported by the provided findings.

Set "passed" to true only if the report has no significant issues.

If there are issues, explain each one clearly.

Do not rewrite the report.

Research report:
${draft}

Research findings:
${sources}
`,
  });

  return response.output;
}
