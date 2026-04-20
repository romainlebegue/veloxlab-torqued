"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Tab = "plaque" | "vin" | "ref";

const TABS: { id: Tab; label: string; placeholder: string; param: string; hint: string }[] = [
  { id: "plaque", label: "Plaque", placeholder: "AA-123-BB", param: "plaque", hint: "Format FR · 20 plaques démo disponibles" },
  { id: "vin",    label: "VIN",    placeholder: "VF1RFD00H53868217", param: "vin",    hint: "17 caractères — tous véhicules FR/EU" },
  { id: "ref",    label: "Référence OE", placeholder: "34 11 6 792 217", param: "q", hint: "Numéro constructeur ou équivalent IAM" },
];

export function SearchHero() {
  const [tab, setTab] = useState<Tab>("plaque");
  const [value, setValue] = useState("");
  const current = TABS.find((t) => t.id === tab)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    window.location.href = `/fr/recherche?${current.param}=${encodeURIComponent(q)}`;
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-5">
      <h1 className="text-display text-ink text-balance mb-3" style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
        Trouvez la pièce.<br />
        <span className="text-coral">Pas la galère.</span>
      </h1>
      <p className="text-body mb-8" style={{ fontSize: 15 }}>
        Comparez neuf OEM · OES · IAM, occasion et reconditionné — chaque résultat filtré pour votre véhicule exact.
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-3 p-1 rounded-lg bg-bg-warm2 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setValue(""); }}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--bg)" : "transparent",
              color: tab === t.id ? "var(--ink)" : "var(--ink-light)",
              boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
              fontSize: 13,
              fontWeight: tab === t.id ? 500 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="input input-mono w-full pr-4"
            style={{ fontSize: 15, height: 48, paddingLeft: 16 }}
            placeholder={current.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg flex items-center gap-2 shrink-0"
        >
          <Search size={16} strokeWidth={2.5} />
          Rechercher
        </button>
      </form>

      <p className="text-label mt-3">{current.hint}</p>
    </section>
  );
}
