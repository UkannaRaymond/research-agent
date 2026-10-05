import { z } from "zod";

/** What the critic model returns. `sentence` is copied verbatim from the report. */
export const CritiqueSchema = z.object({
  issues: z.array(
    z.object({
      type: z.enum(["unsupported_claim", "contradiction"]),
      sentence: z.string(),
      explanation: z.string(),
    }),
  ),
});

export type CritiqueResult = z.infer<typeof CritiqueSchema>;

/** What the pipeline stores and shows after flagged sentences were removed. */
export interface Critique {
  /** True when no flagged issue is left in the final report. */
  passed: boolean;
  /** Issues whose sentence could not be located and removed. */
  issues: {
    type: "unsupported_claim" | "contradiction";
    explanation: string;
  }[];
  /** Number of flagged sentences deleted from the report. */
  removed: number;
}
