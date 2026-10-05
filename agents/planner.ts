import { generateText } from "ai";
import { openrouter, MODELS } from "@/lib/ai";
import { ResearchPlanSchema } from "@/schemas/research-plan";

export async function createResearchPlan(question: string) {
  const result = await generateText({
    model: openrouter(MODELS.planner),
    maxOutputTokens: 2000,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(90_000), // 90 seconds
    prompt: `
      Break this research question into exactly 3 smaller research questions.

      Research question:
      ${question}

      Return only a numbered list (1. to 3.), one question per line.
      Do not provide answers or explanations.
    `,
  });

  const questions = result.text
    .split("\n")
    .filter((line) => /^\s*\d+[.)]\s+/.test(line))
    .map((line) => line.replace(/^\s*\d+[.)]\s+/, "").trim())
    .slice(0, 3);

  return ResearchPlanSchema.parse({ questions });
}
