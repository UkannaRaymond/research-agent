# AI Research Agent

Ask a question and the agent researches it across the web, then writes a cited report. A critic checks the report and strips any claim the sources don't support.

## How it works

```
Question → Planner → Researchers (in parallel) → Writer → Critic → Report
```

1. **Planner** splits the question into focused search queries.
2. **Researchers** run one per query, searching the web (Tavily), reading pages (Firecrawl) and extracting cited findings.
3. **Writer** drafts a report where every claim cites a finding (`[F1]`, `[F2]`, …).
4. **Critic** flags unsupported claims and contradictions. Flagged sentences are removed in code, not rewritten.
5. **Checks** confirm every citation matches a source, then the report is stored.

Runs execute in the background and are saved to Postgres, so you can leave the page, come back from **History**, or share `/results/<id>`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Vercel AI SDK + OpenRouter · Tavily · Firecrawl · Prisma + PostgreSQL

## Getting started

```bash
pnpm install
cp .env.example .env      # then fill in the values below
pnpm exec prisma migrate dev --config prisma7.config.ts
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable                                                            | Purpose                                         |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`                                                      | PostgreSQL connection string                    |
| `OPENROUTER_API_KEY`                                                | LLM access                                      |
| `TAVILY_API_KEY`                                                    | Web search                                      |
| `FIRECRAWL_API_KEY`                                                 | Page scraping                                   |
| `PLANNER_MODEL`, `RESEARCHER_MODEL`, `WRITER_MODEL`, `CRITIC_MODEL` | OpenRouter model IDs, e.g. `openai/gpt-4o-mini` |
| `ENABLE_CRITIC`                                                     | `true` to run the critic step                   |
| `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MINUTES`                       | Per-visitor limit on new runs                   |
| `DEBUG_RESEARCH`                                                    | Optional. Logs timing for each pipeline step    |

## Project structure

```
agents/      planner, researcher, writer, critic
workflows/   the research pipeline
tools/       Tavily search, Firecrawl scrape, source quality scoring
schemas/     Zod schemas for model output
lib/         AI client, database access, rate limiting
app/         pages, components and API routes
```

## Cost notes

One search makes up to 6–7 LLM calls plus a few Tavily and Firecrawl requests. Use a smaller model for the planner and researchers, and keep the stronger one for the writer and critic.

## Status

In active development.
