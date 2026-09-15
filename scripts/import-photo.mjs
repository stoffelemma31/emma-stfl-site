// Import one real photo into a slot: crops it to that slot's required aspect
// ratio (center crop, never upscales past the source's native resolution),
// writes it to public/images/photos/<id>.jpg (overwriting the current photo
// in place, same filename), and refreshes that entry in
// data/photo-manifest.json (width/height/blurDataURL).
//
// The site always appends a cache-busting `?v=<mtime>` to image URLs, so the
// new photo shows up immediately — no need to hard-refresh or clear caches.
//
// Usage:
//   node scripts/import-photo.mjs <slot-id> <path-to-your-photo.jpg>
//
// Example:
//   node scripts/import-photo.mjs gallery-03 ~/Desktop/photos/atelier-01.jpg

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "photos");
const MANIFEST_PATH = path.join(ROOT, "data", "photo-manifest.json");
const SLOTS_PATH = path.join(ROOT, "data", "photo-slots.json");

// Website images never need more than this — caps output size/weight even
// when the source is a huge multi-thousand-pixel export.
const MAX_WIDTH = 2400;

const [, , slotId, sourceArg] = process.argv;

if (!slotId || !sourceArg) {
  console.error("Usage: node scripts/import-photo.mjs <slot-id> <path-to-photo>");
  console.error("Slot ids are listed in data/photo-slots.json");
  process.exit(1);
}

async function run() {
  const slots = JSON.parse(await readFile(SLOTS_PATH, "utf8"));
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) {
    console.error(`Unknown slot id "${slotId}". See data/photo-slots.json for valid ids.`);
    process.exit(1);
  }

  const sourcePath = path.resolve(sourceArg);
  const [rw, rh] = slot.ratio;
  const meta = await sharp(sourcePath).metadata();
  const width = Math.min(meta.width, MAX_WIDTH);
  const height = Math.round((width * rh) / rw);

  const outPath = path.join(OUT_DIR, `${slotId}.jpg`);
  await sharp(sourcePath)
    .resize(width, height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85 })
    .toFile(outPath);

  const blurBuffer = await sharp(outPath).resize(16).jpeg({ quality: 40 }).toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  manifest[slotId] = {
    src: `/images/photos/${slotId}.jpg`,
    width,
    height,
    blurDataURL,
  };
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`Imported "${sourceArg}" into slot "${slotId}" (${width}x${height}).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
