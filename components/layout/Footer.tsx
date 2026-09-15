import Link from "next/link";
import { navLinks, site } from "@/data/site";
import { Logo } from "../ui/Logo";
import { MicroLabel } from "../ui/MicroLabel";
import { SocialLinks } from "../ui/SocialLinks";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="grain-overlay border-t border-deep/10 bg-beige text-deep">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Logo tone="dark" />
            <p className="max-w-[24ch] text-sm text-deep/70">{site.region}</p>
          </div>

          <nav aria-label="Pied de page" className="flex flex-col items-center gap-3 md:items-start">
            <MicroLabel>Navigation</MicroLabel>
            <ul className="flex flex-col items-center gap-2 md:items-start">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-opacity hover:opacity-70">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-center gap-3 md:items-start">
            <MicroLabel>Contact</MicroLabel>
            <a href={`mailto:${site.email}`} className="text-sm transition-opacity hover:opacity-70">
              {site.email}
            </a>
            <a href={`tel:${site.phone}`} className="text-sm transition-opacity hover:opacity-70">
              {site.phoneDisplay}
            </a>
            <SocialLinks tone="dark" className="-ml-3 md:ml-0" />
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-3 border-t border-deep/15 pt-6 text-xs text-deep/60 md:flex-row md:justify-between">
          <p>
            © {year} {site.brandName} {site.brandScript}. Tous droits réservés.
          </p>
          <Link href="/mentions-legales" className="transition-opacity hover:opacity-70">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
