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

  const modelStart = Date.now();

  const findings = await generateJSON({
    model: MODELS.researcher,
    schema: FindingsSchema,
    maxOutputTokens: 8000,
    normalize: (value) => (Array.isArray(value) ? { findings: value } : value),
    prompt: `
      Research the following question using the provided sources.

      Research question:
      ${question}

      Sources:
      ${sources}

      Return only factual findings supported by the sources.
      Include the source URL for each finding.
      Return at most 5 findings.
      Keep each "evidence" value to 1-2 sentences taken from the source.

      Respond with ONLY valid JSON in exactly this shape, no other text:
      {"findings":[{"claim":"","evidence":"","sourceUrl":"","sourceTitle":""}]}
    `,
  });

  console.log(`model: ${((Date.now() - modelStart) / 1000).toFixed(1)}s`);

  return findings;
}
