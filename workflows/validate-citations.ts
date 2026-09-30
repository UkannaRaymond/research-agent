import type { FindingWithId } from "@/schemas/finding";

export function validateCitations(draft: string, findings: FindingWithId[]) {
  const findingIds = new Set(findings.map((finding) => finding.id));

  const [body, sourcesSection = ""] = draft.split(/^## Sources$/m);

  const bodyCitations = [...body.matchAll(/\[F\d+\]/g)].map(
    (match) => match[0],
  );

  const sourceCitations = [...sourcesSection.matchAll(/\[F\d+\]/g)].map(
    (match) => match[0],
  );

  const uniqueBodyCitations = [...new Set(bodyCitations)];
  const uniqueSourceCitations = [...new Set(sourceCitations)];

  const invalidCitations = uniqueBodyCitations.filter(
    (citation) => !findingIds.has(citation.slice(1, -1)),
  );

  const missingFromSources = uniqueBodyCitations.filter(
    (citation) => !uniqueSourceCitations.includes(citation),
  );

  const uncitedSources = uniqueSourceCitations.filter(
    (citation) => !uniqueBodyCitations.includes(citation),
  );

  return {
    valid:
      invalidCitations.length === 0 &&
      missingFromSources.length === 0 &&
      uncitedSources.length === 0,

    invalidCitations,
    missingFromSources,
    uncitedSources,
  };
}

export function repairSourcesSection(draft: string, findings: FindingWithId[]) {
  const [body] = draft.split(/^## Sources$/m);

  const citations = [
    ...new Set([...body.matchAll(/\[F\d+\]/g)].map((match) => match[0])),
  ];

  const findingMap = new Map(findings.map((finding) => [finding.id, finding]));

  const sources = citations
    .map((citation) => {
      const id = citation.slice(1, -1);
      const finding = findingMap.get(id);

      if (!finding) {
        return null;
      }

      return `- ${finding.sourceTitle} [${id}] ${finding.sourceUrl}`;
    })
    .filter(Boolean)
    .join("\n");

  return `${body.trim()}\n\n## Sources\n\n${sources}`;
}
