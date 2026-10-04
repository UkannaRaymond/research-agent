import type { SourceGroup } from "../types";

interface SourceCardProps {
  source: SourceGroup;
}

export default function SourceCard({ source }: SourceCardProps) {
  return (
    <div className="break-words rounded-sm border border-line bg-canvas p-4 transition-all duration-200 hover:border-ink">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-medium leading-tight text-ink">
          {source.title}
        </h3>
        <span className="shrink-0 rounded-full bg-fill px-2 py-0.5 text-xs text-ink-faint">
          {source.ids.join(", ")}
        </span>
      </div>
      <p className="mb-2 text-xs text-ink-faint">{source.domain}</p>
      <ul className="mb-3 list-disc space-y-1.5 pl-5 text-sm text-ink-muted marker:text-cyan-500">
        {source.claims.map((claim, index) => (
          <li key={index}>{claim}</li>
        ))}
      </ul>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex cursor-pointer items-center gap-1 text-xs text-cyan-500 hover:text-cyan-600"
      >
        View source
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
