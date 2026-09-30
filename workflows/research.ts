import { createResearchPlan } from "@/agents/planner";
import { researchQuestion } from "@/agents/researcher";

export async function runResearch(question: string) {
  const plan = await createResearchPlan(question);

  const research = await Promise.all(
    plan.questions.map((question) => researchQuestion(question)),
  );

  return {
    plan,
    research,
  };
}
