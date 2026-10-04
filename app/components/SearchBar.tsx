interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  isResearching: boolean;
  onSearch: () => void;
}

export default function SearchBar({
  query,
  setQuery,
  isResearching,
  onSearch,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isResearching) {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 'What are the effects of AI on software development?'"
        aria-label="Research question"
        className="min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-3 text-base sm:px-5 sm:py-4 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 placeholder:text-ink-subtle focus:border-cyan-500 focus:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_3px_rgba(6,182,212,0.15)] focus:outline-none"
        disabled={isResearching}
      />
      <button
        onClick={onSearch}
        disabled={isResearching || !query.trim()}
        className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-cyan-500 bg-cyan-500 px-8 py-3 font-medium sm:py-4 text-white shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-cyan-500 hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] focus:outline-none disabled:cursor-not-allowed disabled:border-fill disabled:bg-fill disabled:text-ink-faint disabled:shadow-none disabled:hover:translate-y-0"
      >
        Research
      </button>
    </div>
  );
}
