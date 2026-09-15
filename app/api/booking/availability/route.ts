import { NextResponse } from "next/server";
import { getOffer } from "@/data/offers";
import { getAvailableSlots } from "@/lib/booking/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const offerId = searchParams.get("offerId") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const offer = getOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Formule invalide." }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(date, offer.id);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("GET /api/booking/availability failed", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les disponibilités pour le moment." },
      { status: 500 },
    );
  }
}
