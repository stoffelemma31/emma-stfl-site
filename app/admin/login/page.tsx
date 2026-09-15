"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Connexion impossible. Vérifie ta connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 border border-deep/15 bg-beige-soft p-8">
        <h1 className="font-script text-3xl text-deep">Espace admin</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="micro-label">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full border border-deep/20 bg-white px-4 py-3 text-sm text-deep focus:border-mid focus:outline-none focus:ring-1 focus:ring-mid"
          />
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-deep px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
