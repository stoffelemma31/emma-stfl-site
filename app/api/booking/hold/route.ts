import { NextResponse } from "next/server";
import { holdSchema } from "@/lib/booking/schema";
import { startCheckout } from "@/lib/booking/checkout";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const { ok: withinLimit } = rateLimit(`booking-hold:${ip}`, 5, 10 * 60 * 1000);
  if (!withinLimit) {
    return NextResponse.json({ error: "Trop de demandes. Réessaie dans quelques minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = holdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Certains champs sont invalides.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Honeypot: pretend success without creating anything, so bots don't learn to adapt.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, checkoutUrl: null });
  }

  const result = await startCheckout(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl });
}
