import type { Offer } from "@/data/offers";
import { BookingModal } from "@/components/booking/BookingModal";

interface OfferCardProps {
  offer: Offer;
  className?: string;
}

export function OfferCard({ offer, className = "" }: OfferCardProps) {
  return (
    <div
      className={`flex h-full flex-col justify-between rounded-md border border-deep/10 bg-beige-soft p-8 ${className}`}
    >
      <div>
        <h3 className="font-script text-3xl text-deep">{offer.name}</h3>
        <p className="micro-label mt-2">{offer.duration}</p>

        <ul className="mt-6 space-y-3">
          {offer.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-snug text-deep/85">
              <span aria-hidden="true" className="text-mid">
                —
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-start gap-5">
        <p className="font-sans text-3xl font-black text-deep">{offer.price}&nbsp;€</p>
        <BookingModal
          offerId={offer.id}
          triggerLabel="Réserver cette séance"
          triggerClassName="inline-flex min-h-11 items-center justify-center rounded-md bg-mid px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-colors hover:bg-deep"
        />
      </div>
    </div>
  );
}
