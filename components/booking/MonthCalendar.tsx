"use client";

import { useEffect, useMemo, useState } from "react";
import type { OfferId } from "@/data/offers";
import { MAX_ADVANCE_DAYS } from "@/data/availability";
import { minLeadDateISO, MIN_LEAD_DAYS } from "@/lib/booking/schema";
import { errorClass, labelClass } from "@/components/contact/formStyles";

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const minDateISO = minLeadDateISO(MIN_LEAD_DAYS);
const maxDateISO = minLeadDateISO(MAX_ADVANCE_DAYS);

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(iso: string): Date {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Mon-first 6x7 grid, `null` for the leading/trailing days outside the month. */
function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, monthIndex, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface MonthCalendarProps {
  offerId: OfferId;
  date: string;
  slotStart: string | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: string) => void;
  error?: string;
}

/**
 * Month-at-a-glance date + slot picker. Fetches an entire month's
 * availability in one request so every day without a free slot is greyed
 * out upfront — no clicking a date blind and waiting to find out it's full.
 */
type LoadState =
  | { key: string; status: "loaded"; days: Record<string, string[]> }
  | { key: string; status: "error"; message: string };

export function MonthCalendar({ offerId, date, slotStart, onSelectDate, onSelectSlot, error }: MonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(minDateISO));
  const [result, setResult] = useState<LoadState | null>(null);

  const grid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const minMonthKey = monthKey(startOfMonth(minDateISO));
  const maxMonthKey = monthKey(startOfMonth(maxDateISO));

  const currentKey = `${monthKey(visibleMonth)}:${offerId}`;
  // Derived, not effect-set: any render whose fetch hasn't landed yet for the
  // current month/offer simply shows loading, with no synchronous setState
  // needed at the top of the effect below.
  const loading = result?.key !== currentKey;
  const daysMap = result?.key === currentKey && result.status === "loaded" ? result.days : null;
  const loadError = result?.key === currentKey && result.status === "error" ? result.message : null;

  useEffect(() => {
    let cancelled = false;
    const key = `${monthKey(visibleMonth)}:${offerId}`;

    fetch(`/api/booking/availability/month?month=${monthKey(visibleMonth)}&offerId=${offerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setResult({ key, status: "error", message: data.error });
          return;
        }
        setResult({ key, status: "loaded", days: data.days });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key, status: "error", message: "Impossible de charger le calendrier." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visibleMonth, offerId]);

  function goToMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const canGoPrev = monthKey(visibleMonth) > minMonthKey;
  const canGoNext = monthKey(visibleMonth) < maxMonthKey;
  const slotsForSelectedDate = date ? (daysMap?.[date] ?? []) : [];

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>Date &amp; créneau</span>

      <div className="border border-deep/15 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            disabled={!canGoPrev}
            aria-label="Mois précédent"
            className="flex h-9 w-9 items-center justify-center rounded-full text-deep transition-colors hover:bg-deep/10 disabled:pointer-events-none disabled:opacity-25"
          >
            ‹
          </button>
          <p className="font-sans text-sm font-semibold capitalize text-deep">
            {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(visibleMonth)}
          </p>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            disabled={!canGoNext}
            aria-label="Mois suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full text-deep transition-colors hover:bg-deep/10 disabled:pointer-events-none disabled:opacity-25"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="micro-label py-1 text-[0.65rem] text-deep/50">
              {label}
            </span>
          ))}

          {grid.map((day, i) => {
            if (!day) return <span key={i} />;
            const iso = toISODate(day);
            const hasSlots = Boolean(daysMap?.[iso]?.length);
            const inRange = iso >= minDateISO && iso <= maxDateISO;
            const selectable = !loading && !loadError && inRange && hasSlots;
            const selected = iso === date;

            return (
              <button
                key={i}
                type="button"
                disabled={!selectable}
                onClick={() => onSelectDate(iso)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  selected
                    ? "bg-deep font-semibold text-cream"
                    : selectable
                      ? "text-deep hover:bg-deep/10"
                      : "cursor-not-allowed text-deep/25"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {loading && <p className="mt-3 text-center text-sm text-deep/60">Chargement du calendrier…</p>}
        {loadError && <p className={`mt-3 text-center ${errorClass}`}>{loadError}</p>}
      </div>

      {date && !loading && (
        <div className="mt-1 flex flex-col gap-2">
          <span className={labelClass}>Créneau</span>
          {slotsForSelectedDate.length === 0 ? (
            <p className="text-sm text-deep/60">Aucun créneau disponible ce jour-là.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {slotsForSelectedDate.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`min-h-11 min-w-16 rounded-md border px-4 text-sm font-semibold transition-colors ${
                    slotStart === slot
                      ? "border-deep bg-deep text-cream"
                      : "border-deep/20 bg-white text-deep hover:border-mid"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
