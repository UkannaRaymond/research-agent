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

  a: ({ href, children }) => {
    // Citations such as [F1] are rendered as small chips that open the source.
    const isCitation = /^F\d+$/.test(String(children));

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={isCitation ? href : undefined}
        className={
          isCitation
            ? "mx-0.5 inline-block rounded bg-cyan-500/10 px-1 align-baseline text-[11px] font-medium leading-5 text-cyan-600 no-underline hover:bg-cyan-500/20"
            : "text-cyan-600 underline underline-offset-2 hover:text-cyan-500"
        }
      >
        {children}
      </a>
    );
  },
};

/** Turns [F1] (and [F1, F2]) into markdown links to each finding's source URL. */
function linkCitations(markdown: string, citations: Record<string, string>) {
  return markdown
    .replace(/\[(F\d+(?:\s*[,;]\s*F\d+)+)\]/g, (_, list: string) =>
      list
        .split(/\s*[,;]\s*/)
        .map((id) => `[${id}]`)
        .join(""),
    )
    .replace(/\[(F\d+)\](?!\()/g, (match, id: string) => {
      const url = citations[id];

      return url
        ? `[${id}](<${url.replace(/[<>\s]/g, (char) => encodeURIComponent(char))}>)`
        : match;
    });
}

interface ReportMarkdownProps {
  children: string;
  /** Finding ID -> source URL, used to make citations clickable. */
  citations?: Record<string, string>;
}

export default function ReportMarkdown({
  children,
  citations = {},
}: ReportMarkdownProps) {
  return (
    <div className={`break-words ${SECTION_BARS}`}>
      <ReactMarkdown components={components}>
        {linkCitations(children, citations)}
      </ReactMarkdown>
    </div>
  );
}
