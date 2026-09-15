import type { TitleLine } from "@/components/ui/MixedTitle";

export const hero = {
  titleLines: [
    [{ text: "Des photos", variant: "sans" }],
    [{ text: "qui te ressemblent", variant: "script" }],
  ] satisfies TitleLine[],
  ctaLabel: "Je réserve ma séance",
};

export const sequence: { photoId: string; caption: string }[] = [
  { photoId: "sequence-01", caption: "Le sel sur la peau" },
  { photoId: "sequence-02", caption: "Le vent du large" },
  { photoId: "sequence-03", caption: "Le goûter du soir" },
];

export const manifesto = {
  eyebrowLeft: "Portraits",
  eyebrowRight: "Réunion",
  titleLines: [
    [{ text: "Se voir", variant: "script" }],
    [{ text: "autrement", variant: "sans" }],
  ] satisfies TitleLine[],
  paragraph:
    "SE FAIRE PHOTOGRAPHIER, CE N'EST PAS SE FIGER. C'EST SE VOIR AUTREMENT — ET SE DIRE : C'EST MOI, ÇA.",
  footerLine1: "Portrait — Couple — Portraits métiers",
  footerLine2: "Île de la Réunion",
};

export const offersPreview = {
  eyebrow: "Les séances",
  titleLines: [
    [{ text: "Trois façons", variant: "sans" }],
    [{ text: "de se raconter", variant: "script" }],
  ] satisfies TitleLine[],
};

export const galleryStrip = {
  eyebrow: "Galerie",
  titleLines: [[{ text: "Un aperçu", variant: "script" }]] satisfies TitleLine[],
};

export const ctaBanner = {
  eyebrow: "Réservation",
  titleLines: [
    [{ text: "Prête à te voir", variant: "sans" }],
    [{ text: "autrement ?", variant: "script" }],
  ] satisfies TitleLine[],
  bodyLine1: "Une heure ou deux, rien qu'à toi.",
  bodyLine2: "Racontons ensemble ton histoire.",
};
