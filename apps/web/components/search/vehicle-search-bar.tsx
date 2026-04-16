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
  { value: "disques-de-frein",   label: "Disques de frein" },
  { value: "plaquettes-de-frein",label: "Plaquettes de frein" },
  { value: "amortisseurs",       label: "Amortisseurs" },
  { value: "filtres",            label: "Filtres" },
  { value: "bougies",            label: "Bougies" },
  { value: "courroie-distribution", label: "Courroie de distribution" },
  { value: "batterie",           label: "Batterie" },
  { value: "embrayage",          label: "Embrayage" },
];

/**
 * VehicleSearchBar — main search entry point.
 * Three modes: make/model/year/category | VIN | Part number ref.
 */
export function VehicleSearchBar({ defaultValues }: VehicleSearchBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<SearchMode>("vehicle");
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
        const makeSlug = make.toLowerCase().replace(/\s+/g, "-");
        const modelSlug = model.toLowerCase().replace(/\s+/g, "-");
        router.push(`/pieces/${makeSlug}/${modelSlug}/${year}/${category}`);
      } else if (mode === "vin") {
        if (!vin || vin.length !== 17) return;
        router.push(`/vin/${vin.toUpperCase()}`);
      } else {
        if (!ref) return;
        const normalized = ref.toUpperCase().replace(/[^A-Z0-9]/g, "");
        router.push(`/pieces/ref/${normalized}`);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-5">
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${mode === value
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "vehicle" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Marque (ex: Volkswagen)"
              className={inputCls}
              required
            />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Modèle (ex: Golf 7)"
              className={inputCls}
              required
            />
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Année (ex: 2016)"
              type="number"
              min={1980}
              max={new Date().getFullYear()}
              className={inputCls}
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Catégorie…</option>
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {mode === "vin" && (
          <div className="flex gap-3">
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="VIN — 17 caractères (ex: WVWZZZ1KZG1234567)"
              maxLength={17}
              className={`${inputCls} flex-1 font-mono tracking-widest`}
              required
            />
          </div>
        )}

        {mode === "ref" && (
          <div className="flex gap-3">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Référence pièce (ex: 34116792217)"
              className={`${inputCls} flex-1 font-mono`}
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-3 w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Recherche…" : "Comparer les prix →"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50";
