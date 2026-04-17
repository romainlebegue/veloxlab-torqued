"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface VehicleSearchBarProps {
  defaultValues?: {
    make?: string;
    model?: string;
    year?: string;
    category?: string;
    vin?: string;
  };
}

type SearchMode = "vehicle" | "vin" | "ref";

const CATEGORIES = [
  { value: "disques-de-frein",      label: "Disques de frein" },
  { value: "plaquettes-de-frein",   label: "Plaquettes de frein" },
  { value: "amortisseurs",          label: "Amortisseurs" },
  { value: "filtres",               label: "Filtres" },
  { value: "bougies",               label: "Bougies" },
  { value: "courroie-distribution", label: "Courroie de distribution" },
  { value: "batterie",              label: "Batterie" },
  { value: "embrayage",             label: "Embrayage" },
];

export function VehicleSearchBar({ defaultValues }: VehicleSearchBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode]         = useState<SearchMode>("vehicle");
  const [make, setMake]         = useState(defaultValues?.make ?? "");
  const [model, setModel]       = useState(defaultValues?.model ?? "");
  const [year, setYear]         = useState(defaultValues?.year ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? "");
  const [vin, setVin]           = useState(defaultValues?.vin ?? "");
  const [ref, setRef]           = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      if (mode === "vehicle") {
        if (!make || !model || !year || !category) return;
        router.push(`/pieces/${make.toLowerCase().replace(/\s+/g, "-")}/${model.toLowerCase().replace(/\s+/g, "-")}/${year}/${category}`);
      } else if (mode === "vin") {
        if (!vin || vin.length !== 17) return;
        router.push(`/vin/${vin.toUpperCase()}`);
      } else {
        if (!ref) return;
        router.push(`/pieces/ref/${ref.toUpperCase().replace(/[^A-Z0-9]/g, "")}`);
      }
    });
  }

  return (
    <div className="bg-bg rounded-xl border text-left" style={{ borderColor: "var(--border-mid)", boxShadow: "var(--shadow-md)" }}>

      {/* Mode tabs */}
      <div className="flex gap-1 p-2 border-b" style={{ borderColor: "var(--border)" }}>
        {(
          [
            { value: "vehicle", label: "Marque / Modèle" },
            { value: "vin",     label: "VIN" },
            { value: "ref",     label: "Référence" },
          ] as { value: SearchMode; label: string }[]
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              mode === value
                ? { background: "var(--coral)", color: "#fff" }
                : { color: "var(--ink-light)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {mode === "vehicle" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={make}     onChange={e => setMake(e.target.value)}     placeholder="Marque (ex: Volkswagen)" className={inputCls} required />
            <input value={model}    onChange={e => setModel(e.target.value)}    placeholder="Modèle (ex: Golf 7)"     className={inputCls} required />
            <input value={year}     onChange={e => setYear(e.target.value)}     placeholder="Année (ex: 2016)" type="number" min={1980} max={new Date().getFullYear()} className={inputCls} required />
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls} required>
              <option value="">Catégorie…</option>
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {mode === "vin" && (
          <input
            value={vin}
            onChange={e => setVin(e.target.value.toUpperCase())}
            placeholder="VIN — 17 caractères (ex: WVWZZZ1KZG1234567)"
            maxLength={17}
            className={`${inputCls} w-full font-mono tracking-widest`}
            required
          />
        )}

        {mode === "ref" && (
          <input
            value={ref}
            onChange={e => setRef(e.target.value)}
            placeholder="Référence pièce (ex: 34116792217)"
            className={`${inputCls} w-full font-mono`}
            required
          />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-3 w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: "var(--coral)" }}
        >
          {isPending ? "Recherche…" : "Comparer les prix →"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm text-ink placeholder:text-ink-light focus:outline-none transition-colors"
  + " bg-bg-warm border"
  + " focus:border-coral";
