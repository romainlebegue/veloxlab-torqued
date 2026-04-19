"use client";

import { Flag } from "@/components/ui/flag";
import { RecBadge } from "@/components/ui/rec-badge";
import { SponsoredTag } from "@/components/ui/sponsored-tag";
import type { RankedOffer } from "@/lib/search";

interface OfferRowProps {
  offer: RankedOffer;
  rank: number;
  compact?: boolean;
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Neuf", USED: "Occasion", REMAN: "Reconditionné", REC: "Recyclé certifié",
};

const SOURCE_META: Record<string, { name: string; country: string; ships: string }> = {
  autodoc:     { name: "AutoDoc",      country: "DE", ships: "Expédié 24h" },
  mister_auto: { name: "Mister Auto",  country: "FR", ships: "Expédié 48h" },
  oscaro:      { name: "Oscaro",       country: "FR", ships: "Expédié 24h" },
  rockauto:    { name: "RockAuto",     country: "US", ships: "Expédié 5–8j" },
  ebay_fr:     { name: "eBay France",  country: "FR", ships: "Variable" },
  ebay_de:     { name: "eBay DE",      country: "DE", ships: "Variable" },
  ebay_uk:     { name: "eBay UK",      country: "UK", ships: "Variable" },
  ebay_es:     { name: "eBay ES",      country: "ES", ships: "Variable" },
  ovoko:       { name: "Ovoko",        country: "LT", ships: "Expédié 3–5j" },
};

export function OfferRow({ offer, rank, compact = false }: OfferRowProps) {
  const total = offer.price_eur + (offer.shipping_cost_eur ?? 0);
  const meta = SOURCE_META[offer.source] ?? { name: offer.source, country: "FR", ships: "" };
  const seller = offer.seller_name ?? meta.name;
  const isFree = !offer.shipping_cost_eur || offer.shipping_cost_eur === 0;
  const isBest = rank === 1;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: compact ? "8px 16px" : "12px 16px",
      background: isBest ? "rgba(253,236,234,0.35)" : "transparent",
      borderTop: "0.5px solid var(--border)",
      transition: "background 0.15s",
    }}>
      {/* Rank */}
      <div style={{ width: 24, textAlign: "center", flexShrink: 0 }}>
        {isBest ? (
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%", background: "var(--coral)",
            color: "#fff", fontSize: 10, fontWeight: 600, fontFamily: "var(--font-mono)",
          }}>1</span>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--border-strong)", fontSize: 12 }}>{rank}</span>
        )}
      </div>

      {/* Seller */}
      <div style={{ flex: "1 1 30%", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Flag code={meta.country} size={12} />
          <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {seller}
          </span>
          {offer.is_sponsored && <SponsoredTag />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.04em" }}>
            {CONDITION_LABEL[offer.condition] ?? offer.condition}
          </span>
          {offer.is_rec && offer.rec_grade && (
            <RecBadge grade={offer.rec_grade as "A" | "B"} compact donorVin={offer.rec_donor_vin} donorKm={offer.rec_donor_km} dismantlerCert={offer.rec_dismantler_cert} />
          )}
          {offer.warranty_months && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>
              · Gar. {offer.warranty_months} mois
            </span>
          )}
        </div>
      </div>

      {/* Shipping */}
      <div style={{ flex: "0 0 140px", textAlign: "right", fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-mono)" }}>
        {isFree ? (
          <span style={{ color: "var(--success)", fontWeight: 500 }}>Livraison offerte</span>
        ) : (
          <span>+ {offer.shipping_cost_eur!.toFixed(2)} €</span>
        )}
        <div style={{ marginTop: 2 }}>{meta.ships}</div>
      </div>

      {/* Price */}
      <div style={{ flex: "0 0 110px", textAlign: "right" }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {offer.price_eur.toFixed(2)} €
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>
          total {total.toFixed(2)} €
        </div>
      </div>

      <a
        href={`/go/${offer.source}/${offer.id}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn btn-primary btn-sm"
        style={{ flexShrink: 0, minWidth: 84 }}
      >
        Voir →
      </a>
    </div>
  );
}
