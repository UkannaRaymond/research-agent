import { runResearch } from "@/workflows/research";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question) {
    return Response.json({ error: "Question is required" }, { status: 400 });
  }

  const result = await runResearch(question);

  return Response.json(result);
}
