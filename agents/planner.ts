import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { ResearchPlanSchema } from "@/schemas/research-plan";

export async function createResearchPlan(question: string) {
  const result = await generateText({
    model: openrouter("openai/gpt-4o-mini"),
    output: Output.object({
      schema: ResearchPlanSchema,
    }),
    prompt: `
      Break this research question into exactly 5 smaller research questions.

      Research question:
      ${question}

      Return only the 5 research questions.
      Do not provide answers or explanations.
    `,
  });

  return result.output;
}
