import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getPhoto } from "@/lib/images";
import { site } from "@/data/site";
import { hero } from "@/data/home-content";

export function Hero() {
  const photo = getPhoto("hero-main");

  return (
    <section data-hero className="relative w-full overflow-hidden">
      <h1 className="sr-only">
        {site.brandName} {site.brandScript} — {site.locationShort}
      </h1>
      <Photo
        photo={photo}
        sizes="100vw"
        priority
        alt={`${site.brandName} ${site.brandScript} — ${site.locationShort}`}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/25" />

      <div className="absolute inset-x-0 top-[45%] flex -translate-y-1/2 flex-col items-center gap-6 px-5 text-center drop-shadow-sm">
        <MixedTitle lines={hero.titleLines} size="md" scale={1.1} color="#faf5ee" />
        <Link
          href="#offres"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-cream px-8 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-deep transition-opacity hover:opacity-85"
        >
          {hero.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
