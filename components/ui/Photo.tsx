import Image from "next/image";
import type { Photo as PhotoData } from "@/lib/images";

interface PhotoProps {
  photo: PhotoData;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Override the alt text from data/photo-slots.json when context needs different wording. */
  alt?: string;
}

/**
 * Fill-mode photo, sized purely by CSS aspect-ratio so every usage stays
 * responsive without repeating width/height math. Purely presentational —
 * takes an already-resolved `Photo` (see lib/images.ts) rather than an id,
 * so it never touches the filesystem itself and stays safe to render from
 * client components (e.g. the gallery lightbox trigger grid).
 */
export function Photo({ photo, sizes, className = "", priority, alt }: PhotoProps) {
  const [rw, rh] = photo.ratio;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${rw} / ${rh}` }}
    >
      <Image
        src={photo.src}
        alt={alt ?? photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover"
      />
    </div>
  );
}
