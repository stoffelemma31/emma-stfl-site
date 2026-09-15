import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { getHomeStripPhotos } from "@/lib/images";
import { galleryStrip } from "@/data/home-content";

export function GalleryStrip() {
  const photos = getHomeStripPhotos();

  return (
    <section className="bg-beige-soft py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <MicroLabel>{galleryStrip.eyebrow}</MicroLabel>
          <MixedTitle lines={galleryStrip.titleLines} size="md" />
        </Reveal>
      </div>

      <div className="mt-12 overflow-hidden">
        <div className="marquee-track flex gap-4 md:gap-6">
          {[0, 1].map((copy) =>
            photos.map((photo) => (
              <Photo
                key={`${copy}-${photo.id}`}
                photo={photo}
                sizes="(min-width: 768px) 280px, 62vw"
                className="w-[62vw] shrink-0 md:w-[280px]"
              />
            )),
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-center px-5">
        <Link
          href="/galerie"
          className="micro-label border-b border-mid pb-1 transition-opacity hover:opacity-70"
        >
          Voir la galerie complète
        </Link>
      </div>
    </section>
  );
}
