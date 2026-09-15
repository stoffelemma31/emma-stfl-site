import { NextResponse } from "next/server";
import { getBookingByCheckoutSessionId } from "@/lib/booking/repository";

/**
 * Deliberately returns only a coarse status — never trust this for anything
 * that matters (that's the webhook's job). This exists purely so the
 * "merci" page can say "confirmed" a little faster than waiting for the
 * confirmation e-mail, nothing more.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId manquant." }, { status: 400 });
  }

  try {
    const booking = await getBookingByCheckoutSessionId(sessionId);
    if (!booking) {
      return NextResponse.json({ status: null });
    }
    return NextResponse.json({ status: booking.status });
  } catch (error) {
    console.error("GET /api/booking/status failed", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
