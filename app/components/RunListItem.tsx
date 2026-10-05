import Link from "next/link";
import type { RunStatus, RunSummary } from "../types";

const STATUS_STYLES: Record<RunStatus, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-azure/20 text-azure" },
  done: { label: "Complete", className: "bg-leaf/20 text-ink-muted" },
  error: { label: "Failed", className: "bg-red-500/10 text-red-600" },
};

interface RunListItemProps {
  run: RunSummary;
  onDelete: (id: string) => void;
}

export default function RunListItem({ run, onDelete }: RunListItemProps) {
  const status = STATUS_STYLES[run.status];

  return (
    <li className="flex items-stretch gap-2">
      <Link
        href={`/results/${run.id}`}
        className="card-shadow min-w-0 flex-1 rounded-sm border border-line bg-white p-4 transition-all duration-200 hover:border-ink"
      >
        <p className="line-clamp-2 text-sm font-medium text-ink">
          {run.question}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          <span
            className={`rounded-sm px-2 py-0.5 font-medium ${status.className}`}
          >
            {status.label}
          </span>
          <span>{new Date(run.createdAt).toLocaleString()}</span>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => onDelete(run.id)}
        aria-label={`Delete research: ${run.question}`}
        className="shrink-0 cursor-pointer rounded-sm border border-line bg-white px-3 text-ink-faint transition-colors hover:border-red-500/40 hover:text-red-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7h12M9 7V5h6v2m-8 0l1 12h8l1-12"
          />
        </svg>
      </button>
    </li>
  );
}
