import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { CritiqueSchema } from "@/schemas/critique";
import type { FindingWithId } from "@/schemas/finding";

export async function critiqueResearch(
  draft: string,
  findings: FindingWithId[],
) {
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

  const response = await generateText({
    model: openrouter("openai/gpt-4o-mini"),
    output: Output.object({
      schema: CritiqueSchema,
    }),
    prompt: `
Review the research report against the provided research findings.

Your job is ONLY to identify:
- unsupported factual claims
- direct contradictions between factual claims

Do NOT evaluate citation formatting or citation correctness.
Citation bookkeeping is handled separately by the application.

Rules for unsupported claims:
- A claim is unsupported only when the provided findings do not reasonably support it.
- Check the exact wording of the claim against the cited finding.
- Do not demand that the finding use the exact same wording.
- Do not reject a reasonable paraphrase.
- Do not reject a narrower claim when the finding supports the broader fact.
- Do not reject a claim merely because the finding does not quantify an effect.
- Do not infer that a claim is unsupported merely because another finding could have been cited.
- Do not require multiple findings when one finding adequately supports the claim.
- Do not treat reasonable synthesis of directly related findings as unsupported.
- Do not report missing citations. Citation validation is handled separately.
- Do not report citation formatting problems.

Rules for contradictions:
- Only report a contradiction when two factual claims cannot both reasonably be true.
- Different benefits and risks are not contradictions.
- Different effects in different contexts are not contradictions.
- Do not treat a limitation as a contradiction to a benefit.

Do not rewrite the report.

Research report:
${draft}

Research findings:
${sources}
`,
  });

  return response.output;
}
