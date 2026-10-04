const SOURCES = [
  { name: "Google", dot: "bg-azure" },
  { name: "Wikipedia", dot: "bg-leaf" },
  { name: "YouTube", dot: "bg-red-500" },
  { name: "Hacker News", dot: "bg-sun" },
  { name: "+ more", dot: "bg-ink-subtle" },
];

export default function SourceBadges() {
  return (
    <div className="hero-badges flex flex-wrap items-center justify-center gap-2">
      {SOURCES.map((source) => (
        <span
          key={source.name}
          className="source-badge inline-flex cursor-default items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-muted"
        >
          <span className={`h-2 w-2 rounded-full ${source.dot}`} />
          {source.name}
        </span>
      ))}
    </div>
  );
}
