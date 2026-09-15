export type OfferId = "portrait" | "couple" | "metiers";

export interface Offer {
  id: OfferId;
  name: string;
  duration: string;
  /** Real session length in minutes — used to block the calendar for the right duration. */
  durationMinutes: number;
  price: number;
  features: string[];
}

export const TRAVEL_SURCHARGE = 15;
export const INCLUDED_ZONE_LABEL = "Entre Étang-Salé et Saint-Pierre — inclus";
export const OUTSIDE_ZONE_LABEL = "Ailleurs sur l'île — +15 €";

/** Deposit taken at booking time, as a share of the base session price. Edit this one number to change it everywhere. */
export const DEPOSIT_RATE = 0.3;

export const offers: Offer[] = [
  {
    id: "portrait",
    name: "Portrait",
    duration: "1h de shooting",
    durationMinutes: 60,
    price: 300,
    features: [
      "1h de shooting",
      "15 photos retouchées",
      "Galerie en ligne sous 2 semaines",
      "Déplacement inclus entre Étang-Salé et Saint-Pierre",
    ],
  },
  {
    id: "couple",
    name: "Couple",
    duration: "1h30 de shooting",
    durationMinutes: 90,
    price: 350,
    features: [
      "1h30 de shooting",
      "20 photos retouchées",
      "Galerie en ligne sous 2 semaines",
      "Déplacement inclus entre Étang-Salé et Saint-Pierre",
    ],
  },
  {
    id: "metiers",
    name: "Portraits métiers",
    duration: "1h30 de shooting",
    durationMinutes: 90,
    price: 350,
    features: [
      "Pour studios de pilates, sportifs, créateurs, artisans",
      "1h30 de shooting",
      "20 photos retouchées",
      "Galerie en ligne sous 2 semaines",
      "Déplacement inclus entre Étang-Salé et Saint-Pierre",
    ],
  },
];

export function getOffer(id: string | null | undefined): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}
