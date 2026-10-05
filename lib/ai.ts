import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import type { z } from "zod";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const FALLBACK = "openai/gpt-4o-mini";

function modelFromEnv(key: string): string {
  const value = process.env[key]?.trim() || FALLBACK;

  if (!value.includes("/")) {
    console.warn(
      `${key}="${value}" is not a full OpenRouter model ID (expected "provider/model", e.g. "openai/gpt-4o-mini").`,
    );
  }

  return value;
}

export const MODELS = {
  planner: modelFromEnv("PLANNER_MODEL"),
  researcher: modelFromEnv("RESEARCHER_MODEL"),
  writer: modelFromEnv("WRITER_MODEL"),
  critic: modelFromEnv("CRITIC_MODEL"),
};

export async function generateJSON<S extends z.ZodType>({
  model,
  schema,
  prompt,
  maxOutputTokens = 2500,
}: {
  model: string;
  schema: S;
  prompt: string;
  maxOutputTokens?: number;
}): Promise<z.infer<S>> {
  const result = await generateText({
    model: openrouter(model),
    output: Output.object({ schema }),
    maxOutputTokens,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(180_000),
    prompt,
  });

  if (result.output == null) {
    console.error("Structured output failed:", {
      model,
      finishReason: result.finishReason,
    });

    throw new Error(
      result.finishReason === "length"
        ? "Model output was cut off (hit the token limit)"
        : "Model did not return valid structured output",
    );
  }

  return result.output as z.infer<S>;
}
