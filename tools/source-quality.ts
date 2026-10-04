const sourceQuality: Record<string, number> = {
  "ieee.org": 5,
  "ibm.com": 5,
  "anthropic.com": 5,
  "gitlab.com": 5,
  "mdpi.com": 5,
  "pagerduty.com": 4,
  "harness.io": 4,
  "yahoo.com": 3,
};

export function getSourceQuality(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    for (const [domain, score] of Object.entries(sourceQuality)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return score;
      }
    }

    return 2;
  } catch {
    return 1;
  }
}
