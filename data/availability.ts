/**
 * Central availability config — edit this file to change when sessions can
 * be booked. No other code needs to change.
 */

export interface TimeSlot {
  /** 24h "HH:mm" */
  start: string;
}

/** Applied to every day of the week unless overridden below. */
export const defaultDaySlots: TimeSlot[] = [{ start: "10:00" }, { start: "17:00" }];

/**
 * Per-weekday overrides (0 = dimanche, 1 = lundi, … 6 = samedi).
 * Add an entry to replace that day's slots — an empty array closes the day.
 */
export const weekdayOverrides: Partial<Record<number, TimeSlot[]>> = {
  0: [], // fermé le dimanche
};

export function getSlotsForWeekday(weekday: number): TimeSlot[] {
  return weekdayOverrides[weekday] ?? defaultDaySlots;
}

/** How many days ahead bookings can be made. */
export const MAX_ADVANCE_DAYS = 60;
