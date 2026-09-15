"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingRowActionsProps {
  id: string;
  canComplete: boolean;
  canCancel: boolean;
}

export function BookingRowActions({ id, canComplete, canCancel }: BookingRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "completed" | "cancelled") {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!canComplete && !canCancel) return null;

  return (
    <div className="flex justify-end gap-3">
      {canComplete && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("completed")}
          className="text-xs font-semibold text-mid underline-offset-2 hover:underline disabled:opacity-50"
        >
          Terminée
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
          className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
