import type { CitationValidation, Critique } from "../types";
import SectionTitle from "./SectionTitle";

const ISSUE_LABELS = {
  unsupported_claim: "Unsupported claim",
  contradiction: "Contradiction",
} as const;

interface ReportChecksProps {
  citationValidation: CitationValidation;
  critique: Critique | null;
}

function CheckRow({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2 text-ink-muted">
      {ok ? (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-leaf"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Passed"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-sun"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Warning"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v4m0 4h.01M10.3 4.3L2.7 18a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z"
          />
        </svg>
      )}
      <span>{children}</span>
    </li>
  );
}

/**
 * Shows the automatic checks the pipeline ran on the report:
 * citation matching, and the critic's review when it is enabled.
 */
export default function ReportChecks({
  citationValidation,
  critique,
}: ReportChecksProps) {
  const citationsOk = citationValidation.valid;
  const criticFailed = critique !== null && !critique.passed;
  const hasWarnings = !citationsOk || criticFailed;

  return (
    <section>
      <SectionTitle barClassName={hasWarnings ? "bg-sun" : "bg-leaf"}>
        Checks
      </SectionTitle>

      <ul className="space-y-2 pl-3 text-sm">
        <CheckRow ok={citationsOk}>
          {citationsOk
            ? "All citations match a source."
            : citationValidation.invalidCitations.length > 0
              ? `Some citations don't match any source: ${citationValidation.invalidCitations.join(", ")}.`
              : "The source list and the citations don't fully match."}
        </CheckRow>

        {critique && (
          <CheckRow ok={critique.passed}>
            {critique.passed
              ? (critique.removed ?? 0) > 0
                ? `Critic review removed ${critique.removed} unsupported ${
                    critique.removed === 1 ? "sentence" : "sentences"
                  } from the report.`
                : "Critic review passed."
              : `Critic review still flags ${critique.issues.length} ${
                  critique.issues.length === 1 ? "issue" : "issues"
                }.`}
          </CheckRow>
        )}
      </ul>

      {criticFailed && critique.issues.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 pl-11 text-sm text-ink-muted marker:text-sun">
          {critique.issues.map((issue, index) => (
            <li key={index}>
              <span className="font-medium text-ink">
                {ISSUE_LABELS[issue.type]}:
              </span>{" "}
              {issue.explanation}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
