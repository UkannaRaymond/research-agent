interface ExampleQueriesProps {
  onSelect: (query: string) => void;
}

const EXAMPLES = [
  "What are the effects of AI on software development?",
  "What are the latest developments in artificial intelligence?",
  "How does quantum computing work?",
];

export default function ExampleQueries({ onSelect }: ExampleQueriesProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <span className="text-sm text-ink-subtle">Try:</span>
      {EXAMPLES.map((example) => (
        <button
          key={example}
          onClick={() => onSelect(example)}
          className="cursor-pointer rounded-md text-left border border-line bg-white px-4 py-2 text-sm text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500 hover:text-cyan-500 hover:shadow-md focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] focus:outline-none"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
