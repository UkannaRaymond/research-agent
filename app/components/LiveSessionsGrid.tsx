import type { CSSProperties } from "react";
import type { ResearchResult, ResearchStatus } from "../types";
import { formatTime } from "../lib/report";
import SessionCard from "./SessionCard";
import SessionCardSkeleton from "./SessionCardSkeleton";

// The planner splits a question into this many research queries.
const DEFAULT_QUERY_COUNT = 3;

const BADGE_LABEL = {
  loading: "active",
  done: "complete",
  error: "stopped",
} as const;

interface LiveSessionsGridProps {
  status: Exclude<ResearchStatus, "idle">;
  sessionTime: number;
  result: ResearchResult | null;
}

export default function LiveSessionsGrid({
  status,
  sessionTime,
  result,
}: LiveSessionsGridProps) {
  const questions = result?.plan.questions ?? null;
  const count = questions?.length ?? DEFAULT_QUERY_COUNT;

  return (
    <div className="slide-up-enter mb-6 w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-muted">
            Research queries
          </span>
          <span className="rounded-sm bg-azure/20 px-2 py-0.5 text-xs text-azure">
            {count} {BADGE_LABEL[status]}
          </span>
        </div>

        {/* Session timer */}
        <div className="flex items-center gap-3 rounded-sm border border-line bg-fill px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4 text-ink-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm text-ink-muted">
              <span className="font-medium">Session:</span>{" "}
              <span className="inline-block min-w-[52px]">
                {formatTime(sessionTime)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div
        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": count } as CSSProperties}
      >
        {status === "done" && result && questions
          ? questions.map((question, index) => (
              <SessionCard
                key={index}
                label={`Query ${index + 1}`}
                question={question}
                findingCount={result.research[index]?.findings.length ?? 0}
              />
            ))
          : Array.from({ length: count }, (_, index) => (
              <SessionCardSkeleton
                key={index}
                label={`Query ${index + 1}`}
                stopped={status === "error"}
              />
            ))}
      </div>
    </div>
  );
}
