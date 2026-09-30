import { generateObject } from "ai";
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

  const response = await generateObject({
    model: openrouter("openai/gpt-4o-mini"),
    schema: FindingsSchema,
    prompt: `
      Answer the research question using the sources below.

      Research question:
      ${question}

      Sources:
      ${sources}
    `,
  });

  return response.object;
}
