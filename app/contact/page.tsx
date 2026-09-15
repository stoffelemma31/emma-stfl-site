import type { Metadata } from "next";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Choisis ta séance, ton créneau, et confirme immédiatement avec l'acompte en ligne.",
};

export default function ContactPage() {
  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <MicroLabel>Contact</MicroLabel>
            <MixedTitle lines={[[{ text: "Réserver", variant: "sans" }], [{ text: "une séance", variant: "script" }]]} size="lg" />
            <p className="max-w-[46ch] text-sm text-deep/75 md:text-base">
              Choisis ta date et ton créneau, puis règle l&rsquo;acompte en ligne pour confirmer ta séance
              immédiatement.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <SlotPicker collectIdentity />
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-14 flex flex-col items-center gap-3 border-t border-deep/10 pt-10 text-center"
          >
            <MicroLabel>Coordonnées</MicroLabel>
            <a href={`mailto:${site.email}`} className="text-lg text-deep hover:text-mid">
              {site.email}
            </a>
            <a href={`tel:${site.phone}`} className="text-lg text-deep hover:text-mid">
              {site.phoneDisplay}
            </a>
            <p className="text-sm text-deep/70">{site.locationShort}</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
