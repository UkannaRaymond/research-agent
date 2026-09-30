import { z } from "zod";

export const ResearchPlanSchema = z.object({
  questions: z.array(z.string()).min(1).max(5),
});

export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;
