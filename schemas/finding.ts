import { z } from "zod";

export const FindingSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  sourceUrl: z.string(),
  sourceTitle: z.string(),
});

export const FindingsSchema = z.object({
  findings: z.array(FindingSchema),
});

export type Finding = z.infer<typeof FindingSchema>;
