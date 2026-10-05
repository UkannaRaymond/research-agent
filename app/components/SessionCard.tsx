interface SessionCardProps {
  label: string;
  question: string;
  state: "searching" | "done" | "stopped";
  findingCount?: number;
}

export default function SessionCard({
  label,
  question,
  state,
  findingCount = 0,
}: SessionCardProps) {
  return (
    <div className="card-shadow overflow-hidden rounded-sm border border-line bg-white">
      <div className="flex items-center gap-1.5 border-b border-line px-2 py-1.5">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <div className="h-2 w-2 rounded-full bg-sun" />
          <div className="h-2 w-2 rounded-full bg-leaf" />
        </div>
        <span className="flex-1 truncate text-xs text-ink-faint">{label}</span>
      </div>
      <div className="flex flex-col justify-between gap-2 bg-white p-3 sm:min-h-24">
        <p className="line-clamp-3 text-xs leading-relaxed text-ink-muted">
          {question}
        </p>
        {state === "done" ? (
          <span className="self-end rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-600">
            {findingCount} {findingCount === 1 ? "finding" : "findings"}
          </span>
        ) : (
          <span className="self-end rounded-full bg-fill px-2 py-0.5 text-xs text-ink-faint">
            {state === "searching" ? "Searching…" : "Stopped"}
          </span>
        )}
      </div>
    </div>
  );
}
