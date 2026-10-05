import { after, NextResponse } from "next/server";
import { z } from "zod";
import { createRun } from "@/lib/db/runs";
import { rateLimit } from "@/lib/rate-limit";
import {
  readVisitorId,
  VISITOR_COOKIE,
  visitorCookieOptions,
} from "@/lib/visitor";
import { executeRun } from "@/workflows/execute-run";

// The research keeps running after the response is sent (see after() below).
export const maxDuration = 300;

const BodySchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Question is too short")
    .max(500, "Question must be 500 characters or fewer"),
});

const REQUIRED_ENV = [
  "OPENROUTER_API_KEY",
  "TAVILY_API_KEY",
  "DATABASE_URL",
] as const;

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;
const RATE_LIMIT_WINDOW_MS =
  (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 60) * 60_000;

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");

  return (
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Starts a research run and returns its id straight away.
 * The pipeline runs in the background and saves its progress to the database;
 * the client follows it with GET /api/runs/[id].
 */
export async function POST(req: Request) {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);

    return NextResponse.json(
      { error: "The server is not configured correctly." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const limit = rateLimit(
    getClientIp(req),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );

  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);

    return NextResponse.json(
      {
        error: `Too many research requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const existingVisitorId = readVisitorId(req.headers.get("cookie"));
  const visitorId = existingVisitorId ?? crypto.randomUUID();

  let id: string;
  let isNew: boolean;

  try {
    ({ id, isNew } = await createRun({
      visitorId,
      question: parsed.data.question,
    }));
  } catch (error) {
    console.error("Could not create research run:", error);

    return NextResponse.json(
      { error: "Could not start the research. Please try again." },
      { status: 500 },
    );
  }

  // A duplicate submit reuses the run that is already going.
  if (isNew) after(() => executeRun(id, parsed.data.question));

  const response = NextResponse.json({ id }, { status: 202 });

  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, visitorCookieOptions);
  }

  return response;
}
