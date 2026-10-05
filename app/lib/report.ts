import type { Report, ResearchResult, SourceGroup } from "../types";

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Key used to recognise the same article behind different URLs
 * (www, http/https, trailing slash, #fragment, tracking parameters).
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }

    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "") || "/";

    return `${host}${path}${parsed.search}`;
  } catch {
    return url.trim();
  }
}

// A line that is only a "Sources" / "References" heading, however it is written:
// "## Sources", "### Sources", "Sources", "**Sources**", "## Sources:", ...
const SOURCES_HEADING =
  /^[ \t]*(?:#{1,6}[ \t]*|\*\*[ \t]*)?(?:sources|references)[ \t]*:?[ \t]*(?:\*\*)?[ \t]*\r?$/im;

/** Drops the draft's own Sources section; the UI renders a single, deduplicated one. */
export function stripSourcesSection(draft: string): string {
  const match = SOURCES_HEADING.exec(draft);

  return (match ? draft.slice(0, match.index) : draft).trim();
}

/**
 * Splits the draft into its markdown body and a deduplicated list of
 * cited sources (one entry per article, however many findings it supports).
 */
export function parseReport(result: ResearchResult): Report {
  const body = stripSourcesSection(result.draft);

  // Matches [F1] as well as combined forms such as [F1, F2].
  const cited = new Set(
    [...body.matchAll(/\[(F\d+(?:\s*[,;]\s*F\d+)*)\]/g)].flatMap((match) =>
      match[1].split(/\s*[,;]\s*/),
    ),
  );

  const findings = cited.size
    ? result.findings.filter((finding) => cited.has(finding.id))
    : result.findings;

  const groups = new Map<string, SourceGroup>();

  for (const finding of findings) {
    const key = normalizeUrl(finding.sourceUrl);
    const existing = groups.get(key);

    if (existing) {
      existing.ids.push(finding.id);

      if (!existing.claims.includes(finding.claim)) {
        existing.claims.push(finding.claim);
      }
    } else {
      groups.set(key, {
        url: finding.sourceUrl,
        title: finding.sourceTitle || getDomain(finding.sourceUrl),
        domain: getDomain(finding.sourceUrl),
        ids: [finding.id],
        claims: [finding.claim],
      });
    }
  }

  const citations = Object.fromEntries(
    result.findings.map((finding) => [finding.id, finding.sourceUrl]),
  );

  return {
    body,
    sources: [...groups.values()],
    citations,
    citationValidation: result.citationValidation,
    critique: result.critique,
  };
}
