/**
 * Models don't always cite as [F1]. This rewrites the common variants to
 * plain [F1] so validation, the Sources list and clickable citations work:
 *
 *   【F6】        -> [F6]
 *   (F1)          -> [F1]
 *   (F1, F2)      -> [F1][F2]
 *   (F1‑F5)       -> [F1][F2][F3][F4][F5]   (any dash character)
 */

const DASHES = "\\u2010-\\u2015\\-";
const TOKEN = `F\\d+(?:\\s*[${DASHES}]\\s*F\\d+)?`;

const CITATION_GROUP = new RegExp(
  `[\\[\\u3010(]\\s*(${TOKEN}(?:\\s*[,;\\uFF0C\\u3001]\\s*${TOKEN})*)\\s*[\\]\\u3011)]`,
  "g",
);

const RANGE = new RegExp(`^F(\\d+)\\s*[${DASHES}]\\s*F(\\d+)$`);

function expandToken(token: string): string[] {
  const range = RANGE.exec(token.trim());

  if (!range) return [token.trim()];

  const start = Number(range[1]);
  const end = Number(range[2]);

  // Implausible range: keep just the two endpoints.
  if (end < start || end - start > 50) return [`F${start}`, `F${end}`];

  return Array.from({ length: end - start + 1 }, (_, i) => `F${start + i}`);
}

export function normalizeCitations(draft: string): string {
  return draft.replace(CITATION_GROUP, (_match, inner: string) =>
    inner
      .split(/\s*[,;\uFF0C\u3001]\s*/)
      .flatMap(expandToken)
      .map((id) => `[${id}]`)
      .join(""),
  );
}
