import type { BookingStatus } from "@/lib/booking/repository";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Réservation en cours",
  deposit_paid: "Acompte payé",
  payment_failed: "Paiement échoué",
  cancelled: "Annulée",
  expired: "Expirée",
  completed: "Terminée",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-light/30 text-deep",
  deposit_paid: "bg-mid text-cream",
  payment_failed: "bg-red-100 text-red-800",
  cancelled: "bg-deep/10 text-deep/60",
  expired: "bg-deep/10 text-deep/60",
  completed: "bg-deep text-cream",
};
