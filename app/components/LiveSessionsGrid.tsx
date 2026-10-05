import type { CSSProperties } from "react";
import type { RunStatus } from "../types";
import { formatTime } from "../lib/report";
import SessionCard from "./SessionCard";
import SessionCardSkeleton from "./SessionCardSkeleton";

// The planner splits a question into this many research queries.
const DEFAULT_QUERY_COUNT = 3;

interface LiveSessionsGridProps {
  status: RunStatus;
  sessionTime: number;
  /** Known once the planner has finished. */
  questions: string[] | null;
  /** Per-query progress, keyed by query index. */
  queryProgress: Record<string, { findings: number }>;
}

export default function LiveSessionsGrid({
  status,
  sessionTime,
  questions,
  queryProgress,
}: LiveSessionsGridProps) {
  const count = questions?.length ?? DEFAULT_QUERY_COUNT;
  const doneCount = Object.keys(queryProgress).length;

  const badge =
    status === "running"
      ? `${Math.min(doneCount, count)} of ${count} done`
      : status === "done"
        ? `${count} complete`
        : "stopped";

  return (
    <div className="slide-up-enter mb-6 w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-muted">
            Research queries
          </span>
          <span className="rounded-sm bg-azure/20 px-2 py-0.5 text-xs text-azure">
            {badge}
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
        {questions
          ? questions.map((question, index) => {
              const progress = queryProgress[String(index)];

              return (
                <SessionCard
                  key={index}
                  label={`Query ${index + 1}`}
                  question={question}
                  state={
                    progress
                      ? "done"
                      : status === "error"
                        ? "stopped"
                        : "searching"
                  }
                  findingCount={progress?.findings}
                />
              );
            })
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
