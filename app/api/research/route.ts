import { runResearch } from "@/workflows/research";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    const result = await runResearch(question);

    return Response.json(result);
  } catch (error) {
    console.error("Research failed:", error);

    const message = error instanceof Error ? error.message : "Research failed";

    return Response.json({ error: message }, { status: 500 });
  }
}
