import { NextResponse } from "next/server";
import { getOffer } from "@/data/offers";
import { getAvailableSlotsForRange } from "@/lib/booking/availability";

function monthBounds(month: string): { start: string; end: string } {
  const [year, monthNum] = month.split("-").map(Number);
  const start = `${month}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";
  const offerId = searchParams.get("offerId") ?? "";

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Mois invalide." }, { status: 400 });
  }
  const offer = getOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Formule invalide." }, { status: 400 });
  }

  try {
    const { start, end } = monthBounds(month);
    const slotsByDate = await getAvailableSlotsForRange(start, end, offer.id);
    const days = Object.fromEntries(
      Object.entries(slotsByDate).map(([date, slots]) => [date, slots.map((s) => s.start)]),
    );
    return NextResponse.json({ days });
  } catch (error) {
    console.error("GET /api/booking/availability/month failed", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les disponibilités pour le moment." },
      { status: 500 },
    );
  }
}
