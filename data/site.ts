/**
 * Central site identity & contact info.
 */
export const site = {
  brandName: "Emma STFL",
  brandScript: "Photographie",
  tagline: "Des souvenirs qui te ressemblent vraiment",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  locationShort: "Étang-Salé, La Réunion",
  region: "La Réunion",
  zoneIncluded: "Entre Étang-Salé et Saint-Pierre",
  email: "contact@example.com",
  phone: "+262 6 92 15 86 86",
  phoneDisplay: "06 92 15 86 86",
  instagramUrl: "https://www.instagram.com/emmastfl_photographie/",
  facebookUrl: "https://facebook.com/",
} as const;

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/galerie", label: "Galerie" },
  { href: "/les-seances", label: "Les séances" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
