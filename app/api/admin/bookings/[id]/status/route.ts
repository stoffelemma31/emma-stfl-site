import { NextResponse } from "next/server";
import { markStatus } from "@/lib/booking/repository";

const ALLOWED = new Set(["completed", "cancelled"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const status = (body as { status?: unknown })?.status;
  if (typeof status !== "string" || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  try {
    await markStatus(id, status as "completed" | "cancelled");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH booking status failed", error);
    return NextResponse.json({ error: "Impossible de mettre à jour le statut." }, { status: 500 });
  }
}
