import { createResearchPlan } from "@/agents/planner";
import { researchQuestion } from "@/agents/researcher";
import { writeResearchReport } from "@/agents/writer";

export async function runResearch(question: string) {
  const plan = await createResearchPlan(question);

  const research = await Promise.all(
    plan.questions.map((question) => researchQuestion(question)),
  );

  const draft = await writeResearchReport(research);

  return {
    plan,
    research,
    draft,
  };
}
