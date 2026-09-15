import type { Metadata } from "next";
import { Suspense } from "react";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { BookingConfirmationStatus } from "@/components/contact/BookingConfirmationStatus";

export const metadata: Metadata = {
  title: "Réservation",
  robots: { index: false, follow: false },
};

export default function BookingMerciPage() {
  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="mx-auto max-w-xl px-5 py-16 text-center md:py-24">
        <MicroLabel>Réservation</MicroLabel>
        <MixedTitle
          lines={[[{ text: "Presque prête", variant: "script" }]]}
          size="lg"
          className="mt-4"
        />
        <div className="mt-10">
          <Suspense fallback={<div className="h-48" />}>
            <BookingConfirmationStatus />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
