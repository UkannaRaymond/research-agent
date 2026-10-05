import { NextResponse } from "next/server";
import { listRuns, toRunSummaryDto } from "@/lib/db/runs";
import { readVisitorId } from "@/lib/visitor";

/** The current browser's research history, newest first. */
export async function GET(req: Request) {
  const visitorId = readVisitorId(req.headers.get("cookie"));

  if (!visitorId) {
    return NextResponse.json({ runs: [] });
  }

  try {
    const runs = await listRuns(visitorId);

    return NextResponse.json(
      { runs: runs.map(toRunSummaryDto) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not load history:", error);

    return NextResponse.json(
      { error: "Could not load history." },
      { status: 500 },
    );
  }
}
