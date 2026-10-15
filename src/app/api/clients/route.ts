import { NextResponse } from "next/server";
import { getClients, createClient } from "@/app/actions/crm";
import { ClientStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ClientStatus | null;
  const search = searchParams.get("search") || undefined;

  const result = await getClients({
    status: status || undefined,
    search,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createClient(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
