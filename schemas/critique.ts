import { z } from "zod";

export const CritiqueSchema = z.object({
  passed: z.boolean(),
  issues: z.array(
    z.object({
      type: z.enum([
        "unsupported_claim",
        "missing_source",
        "weak_evidence",
        "contradiction",
        "outdated_source",
      ]),
      explanation: z.string(),
    }),
  ),
});

export type Critique = z.infer<typeof CritiqueSchema>;
