import manifest from "@/data/photo-manifest.json";
import slots from "@/data/photo-slots.json";
import { getFileVersion } from "@/lib/fileVersion";

export type PhotoCategory = "portrait" | "couple" | "metiers" | "decor";
export type PhotoOrientation = "portrait" | "landscape";

export interface PhotoSlot {
  id: string;
  orientation: PhotoOrientation;
  ratio: [number, number];
  category: PhotoCategory;
  showOnHome: boolean;
  alt: string;
}

interface ManifestEntry {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
}

const typedSlots = slots as unknown as PhotoSlot[];
const slotById = new Map(typedSlots.map((slot) => [slot.id, slot]));
const manifestById = manifest as Record<string, ManifestEntry>;

export interface Photo extends PhotoSlot, ManifestEntry {}

export function getPhoto(id: string): Photo {
  const slot = slotById.get(id);
  const entry = manifestById[id];
  if (!slot || !entry) {
    throw new Error(
      `Unknown photo slot: "${id}". Add it to data/photo-slots.json, then run ` +
        `scripts/generate-placeholders.mjs (or scripts/import-photo.mjs for a real photo).`,
    );
  }
  return { ...slot, ...entry, src: `${entry.src}?v=${getFileVersion(entry.src)}` };
}

export function getPhotosByCategory(category: PhotoCategory): Photo[] {
  return typedSlots.filter((slot) => slot.category === category).map((slot) => getPhoto(slot.id));
}

export function getGalleryPhotos(): Photo[] {
  return typedSlots.filter((slot) => slot.category !== "decor").map((slot) => getPhoto(slot.id));
}

export function getHomeStripPhotos(): Photo[] {
  return typedSlots.filter((slot) => slot.showOnHome).map((slot) => getPhoto(slot.id));
}
