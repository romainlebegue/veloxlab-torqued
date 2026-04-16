"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { decodeVinLocal } from "@/lib/vin";

/**
 * VIN decoder widget — inline on home page or /vin/[vin] page.
 * Step 1: instant local validation + WMI decode (no network).
 * Step 2: calls /api/decode-vin for Supabase match + redirect slug.
 */
export function VinDecoder() {
  const router = useRouter();
  const [vin, setVin] = useState("");
  const [preview, setPreview] = useState<{ make: string | null; year: number | null; country: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    const v = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    setVin(v);
    setError(null);

    // Instant local preview as user types
    if (v.length >= 3) {
      const local = decodeVinLocal(v.padEnd(17, "0"));
      setPreview({
        make: local.make,
        year: v.length === 17 ? local.modelYear : null,
        country: local.country,
      });
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (vin.length !== 17) {
      setError("Le VIN doit contenir exactement 17 caractères.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/decode-vin?vin=${vin}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "VIN invalide.");
        return;
      }

      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        setError("Véhicule non reconnu. Essayez la recherche par marque/modèle.");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const filled = vin.length;
  const progress = Math.min((filled / 17) * 100, 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          value={vin}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Entrez votre VIN — 17 caractères"
          maxLength={17}
          className={`w-full px-4 py-3 font-mono text-base tracking-widest border rounded-xl
            focus:outline-none focus:ring-2 transition-colors
            ${error
              ? "border-red-300 focus:ring-red-400 bg-red-50"
              : vin.length === 17
              ? "border-green-300 focus:ring-green-400 bg-green-50"
              : "border-gray-200 focus:ring-blue-500 bg-gray-50"
            }`}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
        />
        {/* Character counter */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
          {filled}/17
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-150
            ${filled === 17 ? "bg-green-500" : "bg-blue-400"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live preview */}
      {preview?.make && !error && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span>
            <span className="font-medium">{preview.make}</span>
            {preview.year && <span> · {preview.year}</span>}
            {preview.country && <span className="text-gray-400"> · {preview.country}</span>}
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={vin.length !== 17 || loading}
        className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl
          hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {loading ? "Décodage…" : "Rechercher les pièces →"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Le VIN est sur votre carte grise (case E) ou sur le tableau de bord
      </p>
    </form>
  );
}
