import ReactMarkdown, { type Components } from "react-markdown";

// Accent bar colour for each section heading, in order.
const SECTION_BARS =
  "[&>h2:nth-of-type(1)]:before:bg-cyan-500 [&>h2:nth-of-type(2)]:before:bg-azure [&>h2:nth-of-type(3)]:before:bg-leaf [&>h2:nth-of-type(4)]:before:bg-sun";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 text-base font-semibold text-ink">{children}</h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink before:block before:h-5 before:w-1 before:rounded-full before:bg-ink-subtle first:mt-0">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 pl-3 text-sm font-semibold text-ink">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="mb-3 pl-3 text-sm leading-relaxed text-ink-muted">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-2 pl-8 text-sm text-ink-muted marker:text-cyan-500">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-2 pl-8 text-sm text-ink-muted marker:text-cyan-500">
      {children}
    </ol>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-600 underline underline-offset-2 hover:text-cyan-500"
    >
      {children}
    </a>
  ),
};

export default function ReportMarkdown({ children }: { children: string }) {
  return (
    <div className={`break-words ${SECTION_BARS}`}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
