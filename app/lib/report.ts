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
 * Splits the draft into its markdown body and a list of cited sources.
 * The UI renders its own Sources section, so the draft's is dropped.
 */
export function parseReport(result: ResearchResult): Report {
  const [rawBody = ""] = result.draft.split(/^## Sources$/m);
  const body = rawBody.trim();

  const cited = new Set(
    [...body.matchAll(/\[(F\d+)\]/g)].map((match) => match[1]),
  );

  const findings = cited.size
    ? result.findings.filter((finding) => cited.has(finding.id))
    : result.findings;

  const groups = new Map<string, SourceGroup>();

  for (const finding of findings) {
    const existing = groups.get(finding.sourceUrl);

    if (existing) {
      existing.ids.push(finding.id);
      existing.claims.push(finding.claim);
    } else {
      groups.set(finding.sourceUrl, {
        url: finding.sourceUrl,
        title: finding.sourceTitle || getDomain(finding.sourceUrl),
        domain: getDomain(finding.sourceUrl),
        ids: [finding.id],
        claims: [finding.claim],
      });
    }
  }

  return { body, sources: [...groups.values()] };
}
