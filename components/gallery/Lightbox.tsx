"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/images";

interface LightboxProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) onNavigate((index + 1) % photos.length);
      else onNavigate((index - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-deep"
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de la galerie"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-5 py-4 text-cream md:px-8 md:py-6">
        <span className="micro-label text-cream/70">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="micro-label flex h-11 w-11 items-center justify-center text-cream"
          aria-label="Fermer la visionneuse"
        >
          Fermer
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6 md:px-16">
        <div className="relative h-full max-h-[75vh] w-full max-w-4xl">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 70vw, 92vw"
            className="object-contain"
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
          />
        </div>

        <button
          type="button"
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-cream md:flex"
          aria-label="Photo précédente"
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % photos.length)}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-cream md:flex"
          aria-label="Photo suivante"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="flex justify-center gap-8 pb-8 md:hidden">
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          className="flex h-11 w-11 items-center justify-center text-cream"
          aria-label="Photo précédente"
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % photos.length)}
          className="flex h-11 w-11 items-center justify-center text-cream"
          aria-label="Photo suivante"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
