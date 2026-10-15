import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/app/actions/projects";
import { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") || undefined;
  const status = searchParams.get("status") as ProjectStatus | null;

  const result = await getProjects({
    clientId,
    status: status || undefined,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createProject(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
