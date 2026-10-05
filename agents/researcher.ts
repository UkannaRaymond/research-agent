import { generateJSON, MODELS } from "@/lib/ai";
import { FindingsSchema } from "@/schemas/finding";
import { searchWeb } from "@/tools/search";

export async function researchQuestion(question: string) {
  const results = await searchWeb(question);

  const sources = results
    .map(
      (result) => `
    Title: ${result.title}
    URL: ${result.url}
    Content: ${result.content.slice(0, 800)}
    `,
    )
    .join("\n\n");

  const findings = await generateJSON({
    model: MODELS.researcher,
    schema: FindingsSchema,
    maxOutputTokens: 2500,
    prompt: `
Extract factual findings that help answer the research question using only the provided sources.

Research question:
${question}

Sources:
${sources}

Return at most 5 individual findings.

For each finding:
- claim: one concise, factual statement
- evidence: 1-2 sentences directly supported by the source
- sourceUrl: exact URL of the supporting source
- sourceTitle: exact title of the supporting source

Important:
- Do not summarize the overall research question.
- Do not write a report.
- Do not write an introduction or conclusion.
- Do not create sections or headings.
- Do not combine unrelated claims.
- Do not infer or invent information.
- Every finding must be supported by the provided sources.
`,
  });

  return findings;
}
