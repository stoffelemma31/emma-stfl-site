import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { BookingModal } from "@/components/booking/BookingModal";
import { ctaBanner } from "@/data/home-content";

export function CtaBanner() {
  return (
    <section className="grain-overlay bg-deep px-5 py-20 text-center text-cream md:py-28">
      <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-6">
        <MicroLabel color="var(--color-light)">{ctaBanner.eyebrow}</MicroLabel>
        <MixedTitle lines={ctaBanner.titleLines} size="lg" color="#faf5ee" />
        <p className="max-w-[38ch] text-sm text-cream/80 md:text-base">
          {ctaBanner.bodyLine1}
          <br />
          {ctaBanner.bodyLine2}
        </p>
        <BookingModal
          triggerLabel="Réserver ma séance"
          triggerClassName="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-cream px-8 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-deep transition-opacity hover:opacity-85"
        />
      </Reveal>
    </section>
  );
}
