import Link from "next/link";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { OfferCard } from "@/components/offers/OfferCard";
import { offers } from "@/data/offers";
import { offersPreview } from "@/data/home-content";

export function OffersPreview() {
  return (
    <section className="bg-beige px-5 py-14 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <MicroLabel>{offersPreview.eyebrow}</MicroLabel>
          <MixedTitle lines={offersPreview.titleLines} size="md" />
        </Reveal>

        {/* Anchor target sits on the card row itself, not the section top —
            so jumping here always lands with the full cards (price + button
            included) in view, regardless of how tall the heading above is. */}
        <div id="offres" className="mt-10 scroll-mt-[5.5rem] grid gap-6 md:scroll-mt-28 md:grid-cols-3">
          {offers.map((offer, i) => (
            <Reveal key={offer.id} delay={i * 0.08}>
              <OfferCard offer={offer} className="h-full" />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/les-seances"
            className="micro-label border-b border-mid pb-1 transition-opacity hover:opacity-70"
          >
            Voir toutes les séances
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
