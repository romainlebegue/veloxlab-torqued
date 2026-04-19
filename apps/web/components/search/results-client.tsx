"use client";

import { useState, useMemo } from "react";
import { FilterPanel, type FilterState } from "@/components/search/filter-panel";
import { PartCard } from "@/components/part/part-card";
import type { PartGroup } from "@/lib/search";

const INITIAL_FILTERS: FilterState = {
  condition: [], brands: [], priceMax: 200, freeShipping: false, recOnly: false, warranty: 0,
};

interface ResultsClientProps {
  groups: PartGroup[];
}

export function ResultsClient({ groups }: ResultsClientProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const filtered = useMemo(() => {
    return groups.filter(g => {
      const bestTotal = Math.min(...g.offers.map(o => o.price_eur + (o.shipping_cost_eur ?? 0)));
      if (bestTotal > filters.priceMax) return false;

      if (filters.freeShipping && !g.offers.some(o => !o.shipping_cost_eur || o.shipping_cost_eur === 0)) return false;
      if (filters.recOnly && !g.has_rec) return false;

      if (filters.condition.length > 0) {
        const hasMatch = g.offers.some(o => {
          const t = o.part_type ?? o.condition ?? "";
          return filters.condition.some(c => t.includes(c));
        });
        if (!hasMatch) return false;
      }

      if (filters.brands.length > 0) {
        if (!g.brand_name || !filters.brands.some(b => g.brand_name?.toLowerCase().includes(b.toLowerCase()))) return false;
      }

      if (filters.warranty > 0) {
        if (!g.offers.some(o => (o.warranty_months ?? 0) >= filters.warranty)) return false;
      }

      return true;
    });
  }, [groups, filters]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start" }}>
      <FilterPanel filters={filters} onFiltersChange={setFilters} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--ink-mid)", fontSize: 14 }}>Aucun résultat avec ces filtres.</p>
          </div>
        ) : (
          filtered.map(group => (
            <PartCard key={group.part_number_normalized} group={group} />
          ))
        )}
      </div>
    </div>
  );
}
