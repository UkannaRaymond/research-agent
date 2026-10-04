interface SessionCardSkeletonProps {
  label: string;
  /** Research ended without results for this query. */
  stopped?: boolean;
}

export default function SessionCardSkeleton({
  label,
  stopped = false,
}: SessionCardSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-white">
      <div className="flex items-center gap-1.5 border-b border-line px-2 py-1.5">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-fill" />
          <div className="h-2 w-2 rounded-full bg-fill" />
          <div className="h-2 w-2 rounded-full bg-fill" />
        </div>
        <span className="text-xs font-medium text-ink-subtle">{label}</span>
      </div>
      <div className="flex h-24 items-center justify-center bg-fill">
        <div className="text-center">
          <svg
            className="mx-auto h-6 w-6 text-ink-subtle opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="mt-1 block text-xs text-ink-subtle">
            {stopped ? "No results" : "Waiting..."}
          </span>
        </div>
      </div>
    </div>
  );
}
