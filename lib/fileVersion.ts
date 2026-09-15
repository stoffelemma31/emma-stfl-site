import fs from "node:fs";
import path from "node:path";

/**
 * A file's on-disk mtime, meant to be appended as a `?v=` query param.
 *
 * Without this, replacing a static asset in place (same filename — the
 * whole point, so real photos/logos can replace placeholders without
 * touching code) leaves browsers and the Next.js image optimizer serving
 * old cached bytes at that same URL.
 */
export function getFileVersion(publicSrc: string): number {
  try {
    const filePath = path.join(process.cwd(), "public", publicSrc);
    return Math.floor(fs.statSync(filePath).mtimeMs);
  } catch {
    return 0;
  }
}
