import { tavily } from "@tavily/core";
import { getSourceQuality } from "@/tools/source-quality";

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export async function searchWeb(query: string) {
  const result = await client.search(query, {
    maxResults: 5,
  });

  return result.results
    .map((result) => ({
      ...result,
      sourceQuality: getSourceQuality(result.url),
    }))
    .sort((a, b) => b.sourceQuality - a.sourceQuality);
}
