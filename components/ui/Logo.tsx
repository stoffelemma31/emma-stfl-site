import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";
import logoVersion from "@/data/logo-version.json";

interface LogoProps {
  tone?: "dark" | "light";
  className?: string;
}

const LOGO_RATIO = 3509 / 855;

export function Logo({ tone = "dark", className = "" }: LogoProps) {
  const base = tone === "light" ? "/logo/logo-cream.png" : "/logo/logo-deep.png";
  const src = `${base}?v=${logoVersion.version}`;

  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label={`${site.brandName} ${site.brandScript} — retour à l'accueil`}
    >
      <Image
        src={src}
        alt={`${site.brandName} ${site.brandScript}`}
        width={Math.round(36 * LOGO_RATIO)}
        height={36}
        className="h-8 w-auto md:h-9"
        priority
      />
    </Link>
  );
}
