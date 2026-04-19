"use client";

export interface FilterState {
  condition: string[];
  brands: string[];
  priceMax: number;
  freeShipping: boolean;
  recOnly: boolean;
  warranty: number;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}

const BRANDS = ["Zimmermann", "Brembo", "Bosch", "ATE", "Textar", "Febi", "Mann", "NGK"];

const INITIAL_FILTERS: FilterState = {
  condition: [], brands: [], priceMax: 200, freeShipping: false, recOnly: false, warranty: 0,
};

function Checkbox({ label, checked, onToggle, count, swatch }: {
  label: string; checked: boolean; onToggle: () => void; count?: number; swatch?: React.ReactNode;
}) {
  return (
    <label onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0", fontSize: 13 }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: "1px solid " + (checked ? "var(--coral)" : "var(--border-mid)"),
        background: checked ? "var(--coral)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && (
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        )}
      </span>
      {swatch}
      <span style={{ flex: 1, color: "var(--ink)" }}>{label}</span>
      {count != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>{count}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--border)" }}>
      <div className="label-caps" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const toggle = (key: "condition" | "brands", value: string) => {
    const set = new Set(filters[key]);
    if (set.has(value)) set.delete(value); else set.add(value);
    onFiltersChange({ ...filters, [key]: Array.from(set) });
  };

  return (
    <aside className="card" style={{ position: "sticky", top: 88, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Filtres</span>
        <button
          onClick={() => onFiltersChange(INITIAL_FILTERS)}
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--coral)", background: "none", border: "none", cursor: "pointer" }}
        >
          Réinitialiser
        </button>
      </div>

      <Section title="Neuf">
        <Checkbox label="Origine constructeur" checked={filters.condition.includes("OEM")} onToggle={() => toggle("condition", "OEM")} count={8}
          swatch={<span className="badge badge-oem" style={{ padding: "2px 6px", fontSize: 9 }}>OEM</span>} />
        <Checkbox label="Équipementier 1ère monte" checked={filters.condition.includes("OES")} onToggle={() => toggle("condition", "OES")} count={10}
          swatch={<span className="badge badge-oes" style={{ padding: "2px 6px", fontSize: 9 }}>OES</span>} />
        <Checkbox label="Aftermarket" checked={filters.condition.includes("IAM")} onToggle={() => toggle("condition", "IAM")} count={24}
          swatch={<span className="badge badge-iam" style={{ padding: "2px 6px", fontSize: 9 }}>IAM</span>} />
      </Section>

      <Section title="Occasion">
        <Checkbox label="Recyclé certifié" checked={filters.condition.includes("REC")} onToggle={() => toggle("condition", "REC")} count={7}
          swatch={<span className="badge badge-certified" style={{ padding: "2px 6px", fontSize: 9 }}>REC</span>} />
        <Checkbox label="Occasion vendeur" checked={filters.condition.includes("USED")} onToggle={() => toggle("condition", "USED")} count={12}
          swatch={<span className="badge badge-used" style={{ padding: "2px 6px", fontSize: 9 }}>USED</span>} />
      </Section>

      <Section title="Prix (total)">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)" }}>0 €</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
            ≤ {filters.priceMax} €
          </span>
        </div>
        <input type="range" min={10} max={200} step={5} value={filters.priceMax}
          onChange={e => onFiltersChange({ ...filters, priceMax: +e.target.value })}
          style={{ width: "100%", accentColor: "var(--coral)" }} />
      </Section>

      <Section title="Marques">
        {BRANDS.map(b => (
          <Checkbox key={b} label={b} checked={filters.brands.includes(b)} onToggle={() => toggle("brands", b)} />
        ))}
      </Section>

      <Section title="Options">
        <Checkbox label="Livraison offerte" checked={filters.freeShipping} onToggle={() => onFiltersChange({ ...filters, freeShipping: !filters.freeShipping })} />
        <Checkbox label="REC uniquement" checked={filters.recOnly} onToggle={() => onFiltersChange({ ...filters, recOnly: !filters.recOnly })} />
      </Section>

      <Section title="Garantie min.">
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 12, 24, 36].map(w => (
            <button key={w} onClick={() => onFiltersChange({ ...filters, warranty: w })} style={{
              flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer",
              background: filters.warranty === w ? "var(--ink)" : "var(--bg-warm)",
              color: filters.warranty === w ? "#fff" : "var(--ink-mid)",
              fontFamily: "var(--font-mono)",
            }}>
              {w === 0 ? "Toutes" : `${w}m`}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}
