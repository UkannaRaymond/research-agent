import type { Report, ResultsTab } from "../types";
import ReportChecks from "./ReportChecks";
import ReportMarkdown from "./ReportMarkdown";
import SectionTitle from "./SectionTitle";
import SourceCard from "./SourceCard";

interface ResearchResultsProps {
  activeTab: ResultsTab;
  setActiveTab: (tab: ResultsTab) => void;
  report: Report | null;
  query: string;
  isResearching: boolean;
}

const tabClass = (active: boolean) =>
  `flex cursor-pointer items-center gap-2 border-b-2 pb-1 text-sm font-medium transition-all duration-200 ${
    active
      ? "border-cyan-500 text-cyan-500"
      : "border-transparent text-ink-muted hover:text-ink"
  }`;

export default function ResearchResults({
  activeTab,
  setActiveTab,
  report,
  query,
  isResearching,
}: ResearchResultsProps) {
  const sources = report?.sources ?? [];

  return (
    <div className="card-shadow slide-up-enter slide-up-delay-1 overflow-hidden rounded-sm border border-line bg-white">
      <div className="flex items-center gap-4 border-b border-line px-4 py-3">
        <button
          onClick={() => setActiveTab("summary")}
          className={tabClass(activeTab === "summary")}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={tabClass(activeTab === "sources")}
        >
          Sources
          {sources.length > 0 && (
            <span className="rounded-sm bg-fill px-2 py-0.5 text-xs text-ink-faint">
              {sources.length}
            </span>
          )}
        </button>
      </div>

      <div className="h-[420px] overflow-y-auto p-4 sm:h-[500px]">
        {activeTab === "summary" ? (
          report ? (
            <div className="space-y-6">
              {report.body ? (
                <ReportMarkdown citations={report.citations}>
                  {report.body}
                </ReportMarkdown>
              ) : (
                <section>
                  <SectionTitle barClassName="bg-cyan-500">Overview</SectionTitle>
                  <p className="pl-3 text-sm leading-relaxed text-ink-muted">
                    Limited information found for “{query}”. Try a more
                    specific query.
                  </p>
                </section>
              )}

              <section>
                <SectionTitle barClassName="bg-ink-subtle">Sources</SectionTitle>
                {sources.length > 0 ? (
                  <ul className="space-y-1.5 pl-3">
                    {sources.map((source) => (
                      <li
                        key={source.url}
                        className="flex flex-wrap items-baseline gap-x-2 text-sm"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 underline underline-offset-2 hover:text-cyan-500"
                        >
                          {source.title}
                        </a>
                        <span className="text-xs text-ink-faint">
                          {source.domain}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pl-3 text-sm text-ink-muted">
                    No sources were successfully retrieved.
                  </p>
                )}
              </section>

              {report.body && (
                <ReportChecks
                  citationValidation={report.citationValidation}
                  critique={report.critique}
                />
              )}
            </div>
          ) : isResearching ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-full rounded bg-fill" />
              <div className="h-4 w-5/6 rounded bg-fill" />
              <div className="h-4 w-4/6 rounded bg-fill" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-ink-faint">
              Summary will appear here after research completes
            </div>
          )
        ) : sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sources.map((source) => (
              <SourceCard key={source.url} source={source} />
            ))}
          </div>
        ) : isResearching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-sm bg-canvas p-4">
                <div className="mb-2 h-4 w-3/4 rounded bg-fill" />
                <div className="mb-3 h-3 w-1/4 rounded bg-fill" />
                <div className="mb-1 h-3 w-full rounded bg-fill" />
                <div className="h-3 w-5/6 rounded bg-fill" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-ink-faint">
            Research sources will appear here
          </div>
        )}
      </div>
    </div>
  );
}
