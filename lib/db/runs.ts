import { Prisma } from "@/generated/prisma/client";
import { getDb } from "./index";
import type {
  ResearchRunRow,
  RunStage,
  StoredCitationValidation,
  StoredCritique,
  StoredFinding,
  StoredPlan,
  StoredResearch,
} from "./schema";

// The API route is limited to 5 minutes, so a run still "running" after this was interrupted.
const STALE_AFTER_MS = 8 * 60 * 1000;

// Submitting the same question again within this window reuses the running run.
const DUPLICATE_WINDOW_MS = 60 * 1000;

export interface CompletedResult {
  plan: StoredPlan;
  research: StoredResearch[];
  findings: StoredFinding[];
  draft: string;
  citationValidation: StoredCitationValidation;
  critique: StoredCritique | null;
}

const json = (value: unknown) => value as Prisma.InputJsonValue;

export async function createRun(input: {
  visitorId: string;
  question: string;
}): Promise<{ id: string; isNew: boolean }> {
  const db = getDb();

  const existing = await db.researchRun.findFirst({
    where: {
      visitorId: input.visitorId,
      question: input.question,
      status: "running",
      createdAt: { gt: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    select: { id: true },
  });

  if (existing) return { id: existing.id, isNew: false };

  const row = await db.researchRun.create({
    data: {
      visitorId: input.visitorId,
      question: input.question,
      status: "running",
      stage: "planning",
    },
    select: { id: true },
  });

  return { id: row.id, isNew: true };
}

export async function setStage(id: string, stage: RunStage) {
  await getDb().researchRun.updateMany({
    where: { id, status: "running" },
    data: { stage },
  });
}

export async function setPlan(id: string, plan: StoredPlan) {
  await getDb().researchRun.updateMany({
    where: { id, status: "running" },
    data: {
      plan: json(plan),
      stage: "researching",
    },
  });
}

/** Atomic per-key update, safe while several researchers finish at once. */
export async function setQueryDone(
  id: string,
  index: number,
  findings: number,
) {
  await getDb().$executeRaw`
    UPDATE "research_runs"
    SET "query_progress" =
      jsonb_set(
        COALESCE("query_progress", '{}'::jsonb),
        ARRAY[${String(index)}]::text[],
        ${JSON.stringify({ findings })}::jsonb
      )
    WHERE "id" = ${id}::uuid
      AND "status" = 'running'
  `;
}

export async function completeRun(id: string, result: CompletedResult) {
  await getDb().researchRun.updateMany({
    where: { id },
    data: {
      status: "done",
      stage: null,
      plan: json(result.plan),
      research: json(result.research),
      findings: json(result.findings),
      draft: result.draft,
      citationValidation: json(result.citationValidation),
      critique:
        result.critique === null ? Prisma.JsonNull : json(result.critique),
      error: null,
      completedAt: new Date(),
    },
  });
}

export async function failRun(id: string, message: string) {
  await getDb().researchRun.updateMany({
    where: { id },
    data: {
      status: "error",
      stage: null,
      error: message,
      completedAt: new Date(),
    },
  });
}

export async function getRun(id: string): Promise<ResearchRunRow | null> {
  const db = getDb();

  // Polling hits this every few seconds, so skip the large result columns
  // until the run has finished.
  const light = await db.researchRun.findUnique({
    where: { id },
    omit: {
      research: true,
      findings: true,
      draft: true,
      citationValidation: true,
      critique: true,
    },
  });

  if (!light) return null;

  if (light.status === "running") {
    // The server may have restarted mid-run; don't leave it "running" forever.
    if (Date.now() - light.createdAt.getTime() > STALE_AFTER_MS) {
      const updated = await db.researchRun.updateMany({
        where: { id, status: "running" },
        data: {
          status: "error",
          stage: null,
          error: "This research run was interrupted. Please try again.",
          completedAt: new Date(),
        },
      });

      if (updated.count > 0) {
        return db.researchRun.findUnique({ where: { id } });
      }
    } else {
      return {
        ...light,
        research: null,
        findings: null,
        draft: null,
        citationValidation: null,
        critique: null,
      };
    }
  }

  return db.researchRun.findUnique({ where: { id } });
}

export async function listRuns(visitorId: string, limit = 50) {
  return getDb().researchRun.findMany({
    where: { visitorId },
    select: {
      id: true,
      question: true,
      status: true,
      createdAt: true,
      completedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Only the browser that created the run can delete it. */
export async function deleteRun(
  id: string,
  visitorId: string,
): Promise<boolean> {
  const deleted = await getDb().researchRun.deleteMany({
    where: { id, visitorId },
  });

  return deleted.count > 0;
}

/** JSON returned by the API (no visitor id; dates as ISO strings). */
export function toRunDto(row: ResearchRunRow) {
  const end = row.completedAt ?? new Date();

  return {
    id: row.id,
    question: row.question,
    status: row.status,
    stage: row.stage,
    plan: row.plan,
    queryProgress: row.queryProgress,
    research: row.research,
    findings: row.findings,
    draft: row.draft,
    citationValidation: row.citationValidation,
    critique: row.critique,
    error: row.error,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    elapsedSeconds: Math.max(
      0,
      Math.round((end.getTime() - row.createdAt.getTime()) / 1000),
    ),
  };
}

export function toRunSummaryDto(
  row: Awaited<ReturnType<typeof listRuns>>[number],
) {
  return {
    id: row.id,
    question: row.question,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}
