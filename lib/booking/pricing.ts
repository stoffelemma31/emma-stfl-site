import { getOffer, TRAVEL_SURCHARGE, DEPOSIT_RATE, type OfferId } from "@/data/offers";

export type LocationType = "included" | "outside";

export function computeTotal(offerId: OfferId | string, location: LocationType): number {
  const offer = getOffer(offerId);
  if (!offer) return 0;
  return offer.price + (location === "outside" ? TRAVEL_SURCHARGE : 0);
}

/** Deposit is a share of the base session price only — the travel surcharge (if any) is added to the balance, not the deposit. */
export function computeDeposit(offerId: OfferId | string): number {
  const offer = getOffer(offerId);
  if (!offer) return 0;
  return Math.round(offer.price * DEPOSIT_RATE);
}

export function computeBalance(offerId: OfferId | string, location: LocationType): number {
  return computeTotal(offerId, location) - computeDeposit(offerId);
}

export interface PriceBreakdown {
  total: number;
  deposit: number;
  balance: number;
}

export function computePriceBreakdown(offerId: OfferId | string, location: LocationType): PriceBreakdown {
  const total = computeTotal(offerId, location);
  const deposit = computeDeposit(offerId);
  return { total, deposit, balance: total - deposit };
}
