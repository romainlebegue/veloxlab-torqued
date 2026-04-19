"use client";

import { useState } from "react";
import { OfferRow } from "./offer-row";
import { TierPill } from "@/components/ui/tier-pill";
import { RecBadge } from "@/components/ui/rec-badge";
import { ImgPlaceholder } from "@/components/ui/img-placeholder";
import type { PartGroup } from "@/lib/search";

interface PartCardProps {
  group: PartGroup;
  onOpenDetail?: (id: string) => void;
  compact?: boolean;
}

export function PartCard({ group, onOpenDetail, compact = false }: PartCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...group.offers].sort((a, b) =>
    (a.price_eur + (a.shipping_cost_eur ?? 0)) - (b.price_eur + (b.shipping_cost_eur ?? 0))
  );
  const best = sorted[0];
  const bestTotal = best.price_eur + (best.shipping_cost_eur ?? 0);
  const spread = sorted[sorted.length - 1].price_eur - sorted[0].price_eur;
  const visibleOffers = sorted.slice(0, expanded ? undefined : 3);

  const tier = group.offers[0]?.part_type?.includes("OEM") ? "OEM"
    : group.offers[0]?.part_type?.includes("OES") ? "OES"
    : group.offers[0]?.part_type?.includes("IAM") ? "IAM"
    : "IAM";

  return (
    <article className="card" style={{ overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, padding: compact ? "12px 16px" : "16px 20px", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.part_name}
            style={{ width: compact ? 56 : 72, height: compact ? 56 : 72, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <ImgPlaceholder label="pièce" width={compact ? 56 : 72} height={compact ? 56 : 72} style={{ flexShrink: 0 }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <TierPill tier={tier} />
            {group.has_rec && <RecBadge grade="A" compact />}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
            {group.part_name}
            {group.brand_name && <span style={{ color: "var(--ink-mid)" }}> · {group.brand_name}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span className="text-ref">{group.part_number_normalized}</span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginBottom: 2 }}>à partir de</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {sorted[0].price_eur.toFixed(2)}<span style={{ fontSize: 15, color: "var(--ink-mid)" }}> €</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 4 }}>
            {group.offer_count} offres · Δ {spread.toFixed(0)} €
          </div>
          {onOpenDetail && (
            <button
              onClick={e => { e.stopPropagation(); onOpenDetail(group.part_number_normalized); }}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8 }}
            >
              Détails →
            </button>
          )}
        </div>
      </div>

      {/* Offer rows */}
      <div>
        {visibleOffers.map((o, i) => (
          <OfferRow key={o.id} offer={o} rank={i + 1} compact={compact} />
        ))}
      </div>

      {sorted.length > 3 && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            width: "100%", padding: "10px 16px",
            borderTop: "0.5px solid var(--border)",
            fontSize: 12, color: "var(--coral)", fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {expanded ? "Replier" : `Voir ${sorted.length - 3} offres de plus`}
          <svg
            width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </article>
  );
}
