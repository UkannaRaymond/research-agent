import { Firecrawl } from "firecrawl";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export async function scrapeWebPage(url: string) {
  return firecrawl.scrape(url, {
    formats: ["markdown"],
    onlyMainContent: true,
  });
}
