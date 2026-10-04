import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import type { z } from "zod";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const FALLBACK = "qwen/qwen3.8-27b:free";

export const MODELS = {
  planner: process.env.PLANNER_MODEL || FALLBACK,
  researcher: process.env.RESEARCHER_MODEL || FALLBACK,
  writer: process.env.WRITER_MODEL || FALLBACK, // also used for revising
  critic: process.env.CRITIC_MODEL || FALLBACK,
};

function extractJSONValues(text: string): unknown[] {
  const results: unknown[] = [];

  for (let start = 0; start < text.length; start++) {
    const open = text[start];

    if (open !== "{" && open !== "[") continue;

    const close = open === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === open) {
        depth++;
      } else if (char === close) {
        depth--;

        if (depth === 0) {
          try {
            results.push(JSON.parse(text.slice(start, i + 1)));
          } catch {
            // not valid JSON, try the next candidate
          }
          break;
        }
      }
    }
  }

  return results;
}

export async function generateJSON<S extends z.ZodTypeAny>({
  model,
  schema,
  prompt,
  maxOutputTokens = 4000,
  normalize,
}: {
  model: string;
  schema: S;
  prompt: string;
  maxOutputTokens?: number;
  normalize?: (value: unknown) => unknown;
}): Promise<z.infer<S>> {
  const { text, finishReason } = await generateText({
    model: openrouter(model),
    maxOutputTokens,
    abortSignal: AbortSignal.timeout(180_000), // 180 seconds
    prompt,
  });

  for (const candidate of extractJSONValues(text)) {
    for (const value of [candidate, normalize?.(candidate)]) {
      if (value === undefined) continue;

      const parsed = schema.safeParse(value);

      if (parsed.success) return parsed.data;
    }
  }

  console.error(
    `Could not parse model output (finishReason: ${finishReason}):\n`,
    text,
  );
  throw new Error(
    finishReason === "length"
      ? "Model output was cut off (hit the token limit)"
      : "Model did not return JSON matching the expected shape",
  );
}
