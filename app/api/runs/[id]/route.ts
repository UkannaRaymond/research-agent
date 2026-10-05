import { NextResponse } from "next/server";
import { deleteRun, getRun, toRunDto } from "@/lib/db/runs";
import { isUuid, readVisitorId } from "@/lib/visitor";

type Context = { params: Promise<{ id: string }> };

/** A run by id. Ids are unguessable, so a run's link can be shared. */
export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const run = await getRun(id);

    if (!run) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(toRunDto(run), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load run:", error);

    return NextResponse.json(
      { error: "Could not load this research." },
      { status: 500 },
    );
  }
}

/** Only the browser that created a run can delete it. */
export async function DELETE(req: Request, { params }: Context) {
  const { id } = await params;
  const visitorId = readVisitorId(req.headers.get("cookie"));

  if (!isUuid(id) || !visitorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const deleted = await deleteRun(id, visitorId);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete run:", error);

    return NextResponse.json(
      { error: "Could not delete this research." },
      { status: 500 },
    );
  }
}
