"use client";

import { useEffect, useState } from "react";
import type { OfferId } from "@/data/offers";
import { SlotPicker } from "./SlotPicker";

interface BookingModalProps {
  /** When set, the picker opens locked to this formule instead of showing a selector. */
  offerId?: OfferId;
  triggerLabel: string;
  triggerClassName: string;
}

/**
 * Self-contained trigger + dialog: clicking the button opens the slot picker
 * right there, over the current page — no navigation, no separate form page.
 * Confirming a slot redirects straight to Stripe Checkout.
 */
export function BookingModal({ offerId, triggerLabel, triggerClassName }: BookingModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Réserver une séance"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-deep/60 backdrop-blur-[2px]"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md bg-beige p-6 shadow-xl md:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer la fenêtre de réservation"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-deep/60 transition-colors hover:bg-deep/10 hover:text-deep"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>

            <h2 className="micro-label mb-6 pr-10">Réserver une séance</h2>

            <SlotPicker initialOfferId={offerId} lockOffer={Boolean(offerId)} />
          </div>
        </div>
      )}
    </>
  );
}
