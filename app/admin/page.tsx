import { listBookingsForAdmin } from "@/lib/booking/repository";
import { getOffer } from "@/data/offers";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/admin/statusLabels";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { BookingRowActions } from "@/components/admin/BookingRowActions";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "short" }).format(
    new Date(`${iso}T12:00:00`),
  );
}

export default async function AdminPage() {
  const bookings = await listBookingsForAdmin();
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= todayISO);
  const past = bookings.filter((b) => b.date < todayISO);

  const now = new Date();

  return (
    <div className="min-h-screen bg-beige px-5 py-10 text-deep md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-deep/10 pb-6">
          <h1 className="font-script text-3xl text-deep">Réservations</h1>
          <AdminLogoutButton />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <AdminCalendar year={now.getFullYear()} month={now.getMonth()} bookings={bookings} />

          <div>
            <p className="micro-label mb-3">À venir ({upcoming.length})</p>
            <BookingsTable bookings={upcoming} showActions />
          </div>
        </div>

        {past.length > 0 && (
          <div className="mt-12">
            <p className="micro-label mb-3">Passées ({past.length})</p>
            <BookingsTable bookings={past.slice(0, 30)} showActions={false} />
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsTable({
  bookings,
  showActions,
}: {
  bookings: Awaited<ReturnType<typeof listBookingsForAdmin>>;
  showActions: boolean;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-deep/60">Aucune réservation.</p>;
  }

  return (
    <div className="overflow-x-auto border border-deep/10 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-deep/10 bg-beige-soft text-xs uppercase tracking-wide text-deep/60">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Heure</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Coordonnées</th>
            <th className="px-4 py-3">Séance</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Acompte</th>
            <th className="px-4 py-3 text-right">Reste</th>
            <th className="px-4 py-3">Statut</th>
            {showActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const offer = getOffer(b.offer_id);
            return (
              <tr key={b.id} className="border-b border-deep/5 last:border-0">
                <td className="px-4 py-3 capitalize">{formatDateShort(b.date)}</td>
                <td className="px-4 py-3">{b.slot_start}</td>
                <td className="px-4 py-3">{b.customer_name}</td>
                <td className="px-4 py-3 text-xs text-deep/70">
                  <div>{b.customer_email}</div>
                  <div>{b.customer_phone}</div>
                </td>
                <td className="px-4 py-3">{offer?.name ?? b.offer_id}</td>
                <td className="px-4 py-3 text-right">{b.total_amount} €</td>
                <td className="px-4 py-3 text-right">{b.deposit_amount} €</td>
                <td className="px-4 py-3 text-right">{b.balance_amount} €</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 text-[11px] font-semibold ${STATUS_COLORS[b.status]}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <BookingRowActions
                      id={b.id}
                      canComplete={b.status === "deposit_paid"}
                      canCancel={b.status === "pending" || b.status === "deposit_paid"}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
