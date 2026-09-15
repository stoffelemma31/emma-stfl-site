"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";
import { Logo } from "../ui/Logo";
import { MobileMenu } from "./MobileMenu";

const NAV_HEIGHT = 72;

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const heroEl = hero;

    function update() {
      setOverHero(heroEl.getBoundingClientRect().bottom > NAV_HEIGHT);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const light = isHome && overHero;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          light ? "bg-transparent" : "border-b border-deep/10 bg-beige/95 backdrop-blur-sm"
        }`}
      >
        {light && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        )}
        <div className="relative flex h-[4.5rem] items-center justify-between px-5 md:h-20 md:px-8">
          <Logo tone={light ? "light" : "dark"} />

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`micro-label transition-opacity hover:opacity-70 ${light ? "text-cream" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`micro-label flex h-11 w-11 items-center justify-center md:hidden ${light ? "text-cream" : ""}`}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </header>

      <MobileMenu key={pathname} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
