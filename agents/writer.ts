import { generateText } from "ai";
import { MODELS, openrouter } from "@/lib/ai";
import type { FindingWithId } from "@/schemas/finding";

export async function writeResearchReport(findings: FindingWithId[]) {
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
    model: openrouter(MODELS.writer),
    abortSignal: AbortSignal.timeout(240_000), // 90 seconds
    maxOutputTokens: 3000,
    prompt: `
Write a clear research report using only the findings provided below.

Requirements:
- Organize the report with clear Markdown headings.
- Synthesize related findings only when the findings explicitly support the relationship between them.
- Use only information explicitly supported by the findings.
- Do not infer broader conclusions from a finding.
- Do not generalize a finding beyond its stated evidence, population, task, tool, or context.
- Do not invent facts.
- Cite supporting findings using their exact IDs, for example [F1] or [F12].
- Never invent, renumber, or change finding IDs.
- Every factual sentence must have a citation that directly supports it.
- Only cite a finding when its evidence directly supports the claim being made.
- Keep claims narrow when the evidence is narrow.
- Do not include specific numbers, percentages, dates, or other precise details unless they are directly supported by the cited finding.
- Do not describe evidence as "significant", "substantial", "major", "neutral", or "slight" unless the finding explicitly supports that characterization.
- Do not use intensifiers such as "significantly", "substantially", "major", or "dramatically" unless the finding explicitly supports that strength.
- Do not infer causation unless the finding explicitly establishes causation.
- Do not use phrases such as "may lead to", "results in", "contributes to", "causes", "suggests", or "indicates" unless the cited finding explicitly supports that relationship.
- Do not combine findings to create a stronger claim than any individual finding supports.
- Do not add comparisons between groups unless the finding explicitly makes that comparison.
- Do not add conclusions about future outcomes unless the findings explicitly support them.
- Do not make claims about the effectiveness, reliability, or limitations of AI tools unless the cited finding explicitly makes that claim.
- Do not make claims about project-management integration unless the citation directly supports that claim.
- Do not turn findings into recommendations, instructions, or advice unless the finding itself is explicitly presented as a recommendation.
- Do not introduce words such as "should", "must", "need to", "essential", or "crucial" unless the cited finding explicitly uses or supports that normative conclusion.
- Do not add claims about what the research does or does not document unless that limitation is explicitly supported by the findings.
- Do not mention the research process.

Sources section:
- End with a "Sources" section.
- Include every finding cited in the report.
- Do not include uncited findings.
- Use the exact finding ID beside each source.
- Include the source title and URL.

Research findings:
${sources}
`,
  });

  return response.text;
}
