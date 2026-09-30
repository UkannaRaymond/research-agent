import { tavily } from "@tavily/core";

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export async function searchWeb(query: string) {
  const result = await client.search(query, {
    maxResults: 5,
  });

  return result.results;
}
