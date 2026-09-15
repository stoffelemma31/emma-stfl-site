"use client";

import { useMemo, useState } from "react";
import { offers, getOffer, INCLUDED_ZONE_LABEL, OUTSIDE_ZONE_LABEL, TRAVEL_SURCHARGE, type OfferId } from "@/data/offers";
import { computePriceBreakdown } from "@/lib/booking/pricing";
import { inputClass, labelClass, errorClass } from "@/components/contact/formStyles";
import { MonthCalendar } from "./MonthCalendar";

type Status = "idle" | "submitting" | "error";

interface SlotPickerProps {
  /** Preselects a formule. When `lockOffer` is set, it can't be changed — used from a specific offer card. */
  initialOfferId?: OfferId;
  lockOffer?: boolean;
  /** Adds name/email/phone/message fields, collected upfront instead of by Stripe — used on the /contact page. */
  collectIdentity?: boolean;
}

/**
 * Slot + date + lieu picker, optionally with name/email/phone/message fields
 * (`collectIdentity`). Without it, Stripe Checkout collects identity itself
 * right after this, so a visitor never sees a separate "form page" before
 * paying the deposit — that's the flow used by the quick booking modal.
 */
export function SlotPicker({ initialOfferId, lockOffer = false, collectIdentity = false }: SlotPickerProps) {
  const [offerId, setOfferId] = useState<OfferId>(initialOfferId ?? "portrait");
  const [date, setDate] = useState("");
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [location, setLocation] = useState<"included" | "outside">("included");
  const [locationDetail, setLocationDetail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const offer = getOffer(offerId);
  const { total, deposit, balance } = useMemo(() => computePriceBreakdown(offerId, location), [offerId, location]);

  function selectDate(newDate: string) {
    setDate(newDate);
    setSlotStart(null);
  }

  function selectOffer(newOfferId: OfferId) {
    setOfferId(newOfferId);
    setSlotStart(null);
  }

  const offerSelectField = (
    <Field label="Type de séance" htmlFor="offerId">
      <select
        id="offerId"
        value={offerId}
        onChange={(e) => selectOffer(e.target.value as OfferId)}
        className={inputClass}
      >
        {offers.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} — {o.price} €
          </option>
        ))}
      </select>
    </Field>
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!date) {
      setErrors({ date: "Choisis une date." });
      return;
    }
    if (!slotStart) {
      setErrors({ slotStart: "Choisis un créneau." });
      return;
    }

    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const payload = {
      offerId,
      date,
      slotStart,
      location,
      locationDetail: location === "outside" ? locationDetail : undefined,
      ...(collectIdentity
        ? {
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            phone: String(form.get("phone") ?? ""),
            message: String(form.get("message") ?? ""),
          }
        : {}),
      cancelPath: window.location.pathname,
      company: String(form.get("company") ?? ""),
    };

    try {
      const res = await fetch("/api/booking/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerError(data.error ?? "Une erreur est survenue.");
        if (data.fieldErrors) {
          const flat: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(data.fieldErrors as Record<string, string[]>)) {
            if (msgs?.[0]) flat[field] = msgs[0];
          }
          setErrors(flat);
        }
        // The slot might have just been taken by someone else — clear the pick so they choose again.
        if (res.status === 409) {
          setSlotStart(null);
        }
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Honeypot path: pretend everything's fine, nothing was actually created.
      setStatus("idle");
    } catch {
      setStatus("error");
      setServerError("Impossible d'envoyer la demande. Vérifie ta connexion et réessaie.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — hidden from real visitors, invisible to screen readers via aria-hidden + tabIndex. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Ne pas remplir</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {collectIdentity ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Nom complet" htmlFor="name" error={errors.name}>
            <input id="name" name="name" type="text" required className={inputClass} autoComplete="name" />
          </Field>
          <Field label="E-mail" htmlFor="email" error={errors.email}>
            <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Téléphone" htmlFor="phone" error={errors.phone}>
            <input id="phone" name="phone" type="tel" required className={inputClass} autoComplete="tel" />
          </Field>
          {offerSelectField}
        </div>
      ) : lockOffer && offer ? (
        <div className="flex items-baseline justify-between border-b border-deep/10 pb-4">
          <span className="font-script text-2xl text-deep">{offer.name}</span>
          <span className="font-sans text-xl font-black text-deep">{offer.price}&nbsp;€</span>
        </div>
      ) : (
        offerSelectField
      )}

      <MonthCalendar
        offerId={offerId}
        date={date}
        slotStart={slotStart}
        onSelectDate={selectDate}
        onSelectSlot={setSlotStart}
        error={errors.date ?? errors.slotStart}
      />

      <Field label="Lieu du shooting" htmlFor="location">
        <select
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value as typeof location)}
          className={inputClass}
        >
          <option value="included">{INCLUDED_ZONE_LABEL}</option>
          <option value="outside">{OUTSIDE_ZONE_LABEL}</option>
        </select>
      </Field>

      {location === "outside" && (
        <Field label="Précise le lieu" htmlFor="locationDetail" error={errors.locationDetail}>
          <input
            id="locationDetail"
            type="text"
            value={locationDetail}
            onChange={(e) => setLocationDetail(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex. Saint-Denis, Saint-Leu…"
          />
        </Field>
      )}

      {collectIdentity && (
        <Field label="Parlez-moi de votre projet" htmlFor="message">
          <textarea id="message" name="message" rows={4} className={inputClass} />
        </Field>
      )}

      <div className="space-y-2 border border-deep/15 bg-beige-soft px-5 py-4">
        <div className="flex items-center justify-between text-sm text-deep/70">
          <span>Prix total</span>
          <span>
            {total}&nbsp;€{location === "outside" && ` (dont ${TRAVEL_SURCHARGE}€ déplacement)`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="micro-label">Acompte à payer maintenant</span>
          <span className="font-sans text-2xl font-black text-deep">{deposit}&nbsp;€</span>
        </div>
        <div className="flex items-center justify-between text-sm text-deep/70">
          <span>Solde restant, le jour J</span>
          <span>{balance}&nbsp;€</span>
        </div>
      </div>

      {serverError && <p className={errorClass}>{serverError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-deep px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting"
          ? "Redirection vers le paiement…"
          : collectIdentity
            ? `Payer l'acompte (${deposit} €)`
            : `Continuer vers le paiement (${deposit} €)`}
      </button>

      <p className="text-xs text-deep/60">
        {collectIdentity ? (
          <>
            Paiement sécurisé par Stripe. Ton créneau est réservé dès que l&rsquo;acompte est confirmé — il
            n&rsquo;est bloqué que quelques minutes le temps du paiement.
          </>
        ) : (
          <>
            L&rsquo;étape suivante (paiement sécurisé Stripe) te demandera juste ton nom, ton e-mail et ton
            téléphone. Ton créneau est réservé dès que l&rsquo;acompte est confirmé — il n&rsquo;est bloqué que
            quelques minutes le temps du paiement.
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
