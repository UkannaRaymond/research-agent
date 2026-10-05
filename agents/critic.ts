import { generateJSON, MODELS } from "@/lib/ai";
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

  return generateJSON({
    model: MODELS.critic,
    schema: CritiqueSchema,
    maxOutputTokens: 2000,
    prompt: `
You are a fact-checker. Review the research report against the research findings.

Report only two kinds of problems:
1. unsupported_claim: a sentence that states a fact, number, date, name, or relationship as established when the findings do not support it.
2. contradiction: two statements in the report that cannot both be true, or a statement that conflicts with a finding.

How to read the report:
- In the overview and the thematic sections, factual statements need support from the findings. A reasonable paraphrase or summary of a finding is supported.
- The "Analysis", "Limitations and Open Questions", and "Conclusion" sections contain interpretation. Interpretation is NOT an unsupported claim when it is hedged (for example "may", "might", "is consistent with", "one reading is", "taken together ... point to") and rests on related findings. In these sections, report a sentence only if it states a cause-and-effect ("because", "drives", "in turn", "leads to"), a comparison ("more X than Y", "stronger than"), or a number as established fact AND no finding states it.
- Statements about what the sources do not cover (limitations, gaps) are not unsupported claims.

Do NOT report:
- Paraphrases, summaries, or reasonable synthesis of related findings.
- Wording slightly stronger or weaker than a finding that means the same thing.
- Missing, wrong, or oddly formatted citations (handled separately).
- Style, tone, or completeness.

Be precise:
- Report only clear problems. If you are unsure, do not report it.
- Report at most 5 issues, most serious first.
- "sentence" must be the full problem sentence copied EXACTLY, character for character, from the report, including its [F#] citations. Copy one sentence only, never a whole paragraph.
- "explanation" says briefly which part is not supported and why.
- Use "contradiction" only when two statements conflict. Cause-and-effect or "parallel" links that no finding states are "unsupported_claim".
- If there are no clear problems, return an empty issues list.

Research findings:
${sources}

Research report:
${draft}

Respond with ONLY valid JSON in exactly this shape, no other text.
"type" must be either "unsupported_claim" or "contradiction":
{"issues":[{"type":"unsupported_claim","sentence":"","explanation":""}]}
`,
  });
}
