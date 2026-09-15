"use client";

import { useMemo, useState } from "react";
import type { Photo, PhotoCategory } from "@/lib/images";
import { Photo as PhotoImg } from "@/components/ui/Photo";
import { Lightbox } from "./Lightbox";

interface GalleryGridProps {
  photos: Photo[];
}

const CATEGORIES: { id: PhotoCategory | "all"; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "portrait", label: "Portrait" },
  { id: "couple", label: "Couple" },
  { id: "metiers", label: "Métiers" },
];

export function GalleryGrid({ photos }: GalleryGridProps) {
  const [category, setCategory] = useState<PhotoCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (category === "all" ? photos : photos.filter((p) => p.category === category)),
    [photos, category],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 px-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`micro-label pb-1 transition-colors ${
              category === c.id ? "border-b border-mid text-mid" : "text-deep/60 hover:text-mid"
            }`}
            aria-pressed={category === c.id}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl columns-2 gap-4 px-5 sm:gap-5 md:columns-3 md:gap-6 md:px-10">
        {filtered.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="mb-4 block w-full break-inside-avoid sm:mb-5 md:mb-6"
            aria-label={`Agrandir la photo : ${photo.alt}`}
          >
            <PhotoImg
              photo={photo}
              sizes="(min-width: 768px) 30vw, 48vw"
              className="w-full transition-opacity hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={filtered}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}
