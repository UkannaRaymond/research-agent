import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { FindingsSchema } from "@/schemas/finding";
import { searchWeb } from "@/tools/search";

export async function researchQuestion(question: string) {
  const results = await searchWeb(question);

  const sources = results
    .map(
      (result) => `
Title: ${result.title}
URL: ${result.url}
Content: ${result.content}
`,
    )
    .join("\n\n");

  const response = await generateText({
    model: openrouter("openai/gpt-4o-mini"),
    output: Output.object({
      schema: FindingsSchema,
    }),
    prompt: `
      Research the following question using the provided sources.

      Research question:
      ${question}

      Sources:
      ${sources}

      Return only factual findings supported by the sources.
      Include the source URL for each finding.
    `,
  });

  return response.output;
}
