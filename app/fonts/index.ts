import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * Freight Sans (brief) is a paid typeface with no valid web license available.
 * Public Sans is the closest free alternative: humanist proportions, a true
 * Black weight for display type, and a Light weight for body copy.
 * Swap this loader for a licensed Freight Sans woff2 later if one is purchased —
 * every consumer reads the `--font-sans` CSS variable, so nothing else changes.
 */
export const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "900"],
  display: "swap",
});

export const homemadeApple = localFont({
  variable: "--font-script",
  src: "./HomemadeApple-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});
