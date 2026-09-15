"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { navLinks } from "@/data/site";
import { SocialLinks } from "../ui/SocialLinks";
import { Logo } from "../ui/Logo";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="fixed inset-0 z-[60] flex flex-col bg-deep text-cream md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div className="flex h-[4.5rem] items-center justify-between px-5">
            <Logo tone="light" />
            <button
              type="button"
              onClick={onClose}
              className="micro-label flex h-11 w-11 items-center justify-center text-cream"
              aria-label="Fermer le menu"
            >
              Fermer
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-7">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.05 * i, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-sans text-3xl font-black uppercase tracking-tight"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex justify-center pb-10">
            <SocialLinks tone="light" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
