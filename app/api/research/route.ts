import { createResearchPlan } from "@/agents/planner";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question) {
    return Response.json({ error: "Question is required" }, { status: 400 });
  }

  const plan = await createResearchPlan(question);

  return Response.json(plan);
}
