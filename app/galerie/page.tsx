import type { Metadata } from "next";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryPhotos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Portraits, couples et portraits métiers photographiés à La Réunion, rendu argentique.",
};

export default function GaleriePage() {
  const photos = getGalleryPhotos();

  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="mx-auto max-w-2xl px-5 py-16 text-center md:py-20">
        <Reveal className="flex flex-col items-center gap-4">
          <MicroLabel>Galerie</MicroLabel>
          <MixedTitle
            lines={[[{ text: "Des instants,", variant: "sans" }], [{ text: "pas des poses", variant: "script" }]]}
            size="lg"
          />
        </Reveal>
      </section>

      <div className="pb-20 md:pb-28">
        <GalleryGrid photos={photos} />
      </div>
    </div>
  );
}
