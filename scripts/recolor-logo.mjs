// One-off: derive a dark (deep-teal) variant of the real logo for use on
// light/beige backgrounds, from the single cream-colored source PNG. The
// source is a flat #f7eee7 shape on a transparent alpha mask, so recoloring
// is just: keep the alpha, replace the RGB.
//
//   node scripts/recolor-logo.mjs

import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOGO_DIR = path.join(ROOT, "public", "logo");
const SOURCE = path.join(LOGO_DIR, "logo-source.png");

const DEEP_TEAL = { r: 30, g: 76, b: 81 };

async function run() {
  // Resolve the trim first into real bytes — sharp's lazy .metadata() on an
  // unresolved pipeline can report the pre-trim size, not the trimmed one.
  const trimmedBuffer = await sharp(SOURCE).trim().png().toBuffer();
  const { width, height } = await sharp(trimmedBuffer).metadata();

  await sharp(trimmedBuffer).toFile(path.join(LOGO_DIR, "logo-cream.png"));

  const alpha = await sharp(trimmedBuffer).ensureAlpha().extractChannel(3).raw().toBuffer();

  const solidRgb = await sharp({
    create: { width, height, channels: 3, background: DEEP_TEAL },
  })
    .raw()
    .toBuffer();

  await sharp(solidRgb, { raw: { width, height, channels: 3 } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toFile(path.join(LOGO_DIR, "logo-deep.png"));

  await writeFile(
    path.join(ROOT, "data", "logo-version.json"),
    JSON.stringify({ version: Date.now() }, null, 2),
  );

  console.log(`Wrote logo-cream.png and logo-deep.png at ${width}x${height}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
