import { runResearch } from "@/workflows/research";
import {
  completeRun,
  failRun,
  setPlan,
  setQueryDone,
  setStage,
} from "@/lib/db/runs";

/**
 * Runs the whole pipeline for a stored run, saving progress as it goes,
 * then stores the final result (or the error).
 */
export async function executeRun(id: string, question: string) {
  try {
    const result = await runResearch(question, {
      onStage: (stage) => setStage(id, stage),
      onPlan: (plan) => setPlan(id, plan),
      onQueryDone: (index, query) =>
        setQueryDone(id, index, query.findings.length),
    });

    await completeRun(id, result);
  } catch (error) {
    console.error("Research failed:", error);

    // Provider errors can contain internal details; keep them out of production.
    const message =
      process.env.NODE_ENV === "production"
        ? "Research failed. Please try again."
        : error instanceof Error
          ? error.message
          : "Research failed";

    await failRun(id, message).catch((dbError) =>
      console.error("Could not save the failure:", dbError),
    );
  }
}
