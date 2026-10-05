import { generateText } from "ai";
import { MODELS, openrouter } from "@/lib/ai";
import type { FindingWithId } from "@/schemas/finding";

export async function writeResearchReport(
  question: string,
  findings: FindingWithId[],
) {
  const sources = findings
    .map(
      (finding) => `
[${finding.id}]
Claim: ${finding.claim}
Evidence: ${finding.evidence}
Source: ${finding.sourceTitle}
URL: ${finding.sourceUrl}
`,
    )
    .join("\n");

  const response = await generateText({
    model: openrouter(MODELS.writer),
    maxOutputTokens: 6000,
    maxRetries: 2,
    abortSignal: AbortSignal.timeout(240_000),
    prompt: `
You are a research analyst. Write an in-depth research report that answers the research question, using only the findings provided below.

Research question:
${question}

Structure (Markdown):
- "# " A specific title for the topic.
- "## Overview": one short paragraph (3-4 sentences) that answers the question directly and states the main takeaways.
- 3 to 5 thematic "## " sections. Group findings by theme, not by source. In each section write two or three substantial paragraphs of connected prose: what the evidence shows, how findings relate (agree, add detail, or differ), and why it matters. Use a short bullet list only to name discrete items.
- "## Analysis": what the findings indicate when taken together. Point out patterns, tensions, and differences between sources. Write these as hedged observations ("The findings are consistent with...", "One reading is...", "Taken together, ... point to...") and cite the findings they rest on. Do not state causes or comparisons as fact ("because", "drives", "in turn", "more X than Y", "stronger than") unless a finding says so.
- "## Limitations and Open Questions": what the evidence does not cover, where it is thin, dated, promotional, or secondary, and where sources disagree. Base this only on the findings and sources provided.
- "## Conclusion": two or three sentences.

Depth:
- Aim for roughly 700 to 1000 words.
- Explain and connect; do not write one short sentence per finding.

Grounding rules:
- Every fact, name, number, and date must come from the findings. Do not add outside facts, figures, or examples.
- Analysis and interpretation are welcome when they follow from the cited findings. Make clear when you are interpreting (for example "taken together", "this points to") and cite the findings the interpretation rests on.
- Match the strength of your wording to the strength of the evidence. Do not claim causation unless a finding states it. Do not generalize beyond the context a finding describes.
- When only one source supports a point, or sources disagree, say so.
- Every sentence in the Overview, Analysis, and Conclusion must end with at least one [F#] citation. If you cannot cite a sentence, leave it out.
- The Conclusion may only restate points already made above, with their citations. Do not add new framing or trends ("becoming", "increasingly", "shifting") that no finding states.
- Do not describe two developments as parallel, matched, or pressuring each other unless a single finding says so.
- Do not give recommendations unless a finding presents one.
- Do not mention the research process.

Citation rules:
- Cite with the exact finding ID in its own plain square brackets right after the supporting statement, for example [F1] or [F1][F4].
- Use only the ASCII characters [ and ]. Never use 【F1】, (F1), or ranges such as F1-F5.
- Never combine IDs inside one bracket (not [F1, F4]).
- Never invent, renumber, or change IDs. Only cite a finding when it directly supports the statement.
- Several findings can come from the same article. Cite whichever ID supports the statement.
- Do NOT write a Sources or References section. The application adds it automatically.

Research findings:
${sources}
`,
  });

  return response.text;
}
