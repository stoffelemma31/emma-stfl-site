import type { BookingRow } from "@/lib/booking/repository";
import { STATUS_COLORS } from "@/lib/admin/statusLabels";

interface AdminCalendarProps {
  year: number;
  month: number; // 0-11
  bookings: BookingRow[];
}

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AdminCalendar({ year, month, bookings }: AdminCalendarProps) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0=dimanche..6=samedi → convert to Monday-first index (0=lundi..6=dimanche)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;

  const byDate = new Map<string, BookingRow[]>();
  for (const booking of bookings) {
    const list = byDate.get(booking.date) ?? [];
    list.push(booking);
    byDate.set(booking.date, list);
  }

  const cells: { date: string | null; day: number | null }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = toISODate(new Date(year, month, day));
    cells.push({ date, day });
  }

  const todayISO = toISODate(new Date());

  return (
    <div className="border border-deep/10 bg-white p-5">
      <p className="micro-label mb-4">
        {MONTH_LABELS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="pb-2 text-[10px] font-semibold uppercase tracking-wide text-deep/50">
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;
          const dayBookings = byDate.get(cell.date) ?? [];
          const isToday = cell.date === todayISO;
          return (
            <div
              key={i}
              className={`flex min-h-16 flex-col items-center gap-1 border border-deep/5 p-1 text-xs ${
                isToday ? "bg-beige-soft" : ""
              }`}
            >
              <span className={isToday ? "font-bold text-deep" : "text-deep/70"}>{cell.day}</span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {dayBookings.slice(0, 4).map((b) => (
                  <span
                    key={b.id}
                    title={`${b.slot_start} — ${b.customer_name}`}
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[b.status].split(" ")[0]}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
