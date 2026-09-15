import type { Metadata } from "next";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { OfferCard } from "@/components/offers/OfferCard";
import { offers, TRAVEL_SURCHARGE } from "@/data/offers";

export const metadata: Metadata = {
  title: "Les séances",
  description:
    "Portrait, couple ou portraits métiers : trois formules simples, déplacement inclus entre Étang-Salé et Saint-Pierre.",
};

export default function SeancesPage() {
  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="mx-auto max-w-2xl px-5 py-16 text-center md:py-24">
        <Reveal className="flex flex-col items-center gap-4">
          <MicroLabel>Les séances</MicroLabel>
          <MixedTitle
            lines={[
              [{ text: "Choisis", variant: "sans" }],
              [{ text: "ton moment", variant: "script" }],
            ]}
            size="lg"
          />
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-deep/80 md:text-base">
            Trois formules simples, une expérience pensée pour toi. Le prix comprend toujours le
            déplacement entre l&rsquo;Étang-Salé et Saint-Pierre.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-16 md:grid-cols-3 md:pb-24">
        {offers.map((offer, i) => (
          <Reveal key={offer.id} delay={i * 0.08}>
            <OfferCard offer={offer} className="h-full" />
          </Reveal>
        ))}
      </section>

      <div className="mx-auto max-w-2xl px-5 pb-24 text-center">
        <MicroLabel>
          Déplacement hors de la zone Étang-Salé ↔ Saint-Pierre : +{TRAVEL_SURCHARGE}&nbsp;€
        </MicroLabel>
      </div>
    </div>
  );
}
