import { z } from "zod";

export const ResearchPlanSchema = z.object({
  questions: z.array(z.string()),
});

export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;
