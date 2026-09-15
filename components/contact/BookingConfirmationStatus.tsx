"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "checking" | "confirmed" | "pending" | "unknown";

const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 2500;

export function BookingConfirmationStatus() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>(sessionId ? "checking" : "unknown");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(`/api/booking/status?sessionId=${encodeURIComponent(sessionId!)}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.status === "deposit_paid") {
          setStatus("confirmed");
          return;
        }
      } catch {
        // ignore — we'll just retry or fall back below
      }

      if (!cancelled && attempts < POLL_ATTEMPTS) {
        setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!cancelled) {
        setStatus("pending");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (status === "confirmed") {
    return (
      <div className="border border-mid/30 bg-white px-6 py-10 text-center">
        <p className="font-script text-2xl text-mid">C&rsquo;est confirmé !</p>
        <p className="mt-4 text-sm leading-relaxed text-deep/85">
          Ton acompte a bien été reçu et ta séance est réservée. Un e-mail récapitulatif vient de
          t&rsquo;être envoyé.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-mid/30 bg-white px-6 py-10 text-center">
      <p className="font-script text-2xl text-mid">Merci !</p>
      <p className="mt-4 text-sm leading-relaxed text-deep/85">
        {status === "checking"
          ? "Ton paiement est en cours de confirmation…"
          : "Ton paiement a bien été transmis. Tu vas recevoir un e-mail de confirmation d'ici quelques instants."}
      </p>
    </div>
  );
}
