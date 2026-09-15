import type { Metadata } from "next";
import { publicSans, homemadeApple } from "./fonts";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/data/site";
import { getPhoto } from "@/lib/images";
import "./globals.css";

// Reads the real current hero photo (dimensions included) rather than
// hardcoding them, so the Open Graph preview never goes stale when the photo
// is swapped via scripts/import-photo.mjs.
const ogPhoto = getPhoto("hero-main");

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: `${site.brandName} ${site.brandScript} — Photographe portrait à La Réunion`,
    template: `%s — ${site.brandName} ${site.brandScript}`,
  },
  description:
    "Photographe portrait basée à l'Étang-Salé, La Réunion. Séances portrait, couple et portraits métiers au rendu argentique, chaud et sincère.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: `${site.brandName} ${site.brandScript}`,
    url: site.baseUrl,
    title: `${site.brandName} ${site.brandScript} — Photographe portrait à La Réunion`,
    description:
      "Des souvenirs qui te ressemblent vraiment. Séances portrait, couple et portraits métiers au sud de La Réunion.",
    images: [{ url: ogPhoto.src, width: ogPhoto.width, height: ogPhoto.height }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.brandName} ${site.brandScript}`,
    description: "Photographe portrait à La Réunion — rendu argentique, chaud et sincère.",
    images: [ogPhoto.src],
  },
};

export const viewport = {
  themeColor: "#1e4c51",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${publicSans.variable} ${homemadeApple.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-beige text-deep">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
