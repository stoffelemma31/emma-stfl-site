// Generates abstract, on-brand placeholder photographs for every slot in
// data/photo-slots.json, plus a manifest with dimensions + blurDataURL.
//
// These are NOT stock photos — no image is downloaded from anywhere. Each is a
// procedurally rendered gradient + grain composition in the site's palette,
// standing in for the real shoot photos until they're supplied. Re-run this
// script any time slots change:
//
//   node scripts/generate-placeholders.mjs

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "photos");
const MANIFEST_PATH = path.join(ROOT, "data", "photo-manifest.json");

const TONES = {
  deep: ["#123338", "#2e7885"],
  cool: ["#2e7885", "#a9c8db"],
  warm: ["#8a5a34", "#e6bd8e"],
  sand: ["#d8c4a8", "#f6ecdd"],
};

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function buildSvg({ width, height, tone, seed }) {
  const [c1, c2] = TONES[tone] ?? TONES.deep;
  const angle = seed % 360;
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 + 50 * Math.cos(rad);
  const y1 = 50 + 50 * Math.sin(rad);
  const x2 = 50 - 50 * Math.cos(rad);
  const y2 = 50 - 50 * Math.sin(rad);
  const leakX = 15 + (seed % 70);
  const leakY = 10 + ((seed >> 3) % 60);
  const freq = 0.75 + ((seed % 10) / 100);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="base" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <radialGradient id="leak" cx="${leakX}%" cy="${leakY}%" r="70%">
        <stop offset="0%" stop-color="#f2d9b0" stop-opacity="0.35" />
        <stop offset="60%" stop-color="#f2d9b0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
        <stop offset="55%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.28" />
      </radialGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)" />
    <rect width="100%" height="100%" fill="url(#leak)" />
    <rect width="100%" height="100%" filter="url(#grain)" />
    <rect width="100%" height="100%" fill="url(#vignette)" />
  </svg>`;
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const raw = await readFile(path.join(ROOT, "data", "photo-slots.json"), "utf8");
  const slots = JSON.parse(raw);

  const manifest = {};

  for (const slot of slots) {
    const seed = hashId(slot.id);
    const [rw, rh] = slot.ratio;
    const baseWidth = slot.orientation === "landscape" ? 1800 : 1400;
    const width = baseWidth;
    const height = Math.round((baseWidth * rh) / rw);

    const svg = buildSvg({ width, height, tone: slot.tone, seed });
    const buffer = Buffer.from(svg);

    const fileName = `${slot.id}.jpg`;
    const outPath = path.join(OUT_DIR, fileName);

    await sharp(buffer).jpeg({ quality: 82 }).toFile(outPath);

    const blurBuffer = await sharp(buffer)
      .resize(16)
      .jpeg({ quality: 40 })
      .toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

    manifest[slot.id] = {
      src: `/images/photos/${fileName}`,
      width,
      height,
      blurDataURL,
    };

    console.log(`generated ${slot.id} (${width}x${height})`);
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to ${path.relative(ROOT, MANIFEST_PATH)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
