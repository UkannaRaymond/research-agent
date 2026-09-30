import { generateText } from "ai";
import { openrouter } from "@/lib/ai";
import type { Finding } from "@/schemas/finding";

export async function writeResearchReport(research: { findings: Finding[] }[]) {
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
    prompt: `
Write a clear research report using only the findings provided below.

Requirements:
- Organize the report with clear Markdown headings.
- Synthesize related findings instead of simply listing them.
- Do not invent facts.
- Do not make claims that are not supported by the findings.
- Add citation numbers like [1], [2] after claims.
- End with a "Sources" section containing the source title and URL.
- Do not mention the research process.

Research findings:
${sources}
`,
  });

  return response.text;
}
