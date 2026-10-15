import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/app/actions/projects";
import { TaskStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(TaskStatus).includes(status)) {
      return NextResponse.json(
        { error: "Valid task status is required (TODO, IN_PROGRESS, REVIEW, DONE)" },
        { status: 400 }
      );
    }

    const result = await updateTaskStatus(id, status as TaskStatus);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
