import { generateText } from "ai";
import { openrouter } from "@/lib/ai";

export async function GET() {
  const result = await generateText({
    model: openrouter("openai/gpt-4o-mini"),
    prompt: "Explain what a research agent is in one sentence.",
  });

  return Response.json({ result: result.text });
}
