"use client";

import { useState } from "react";
import { OfferRow } from "./offer-row";
import type { PartGroup } from "@/lib/search";

interface PartCardProps {
  group: PartGroup;
}

/**
 * PartCard — one card per part reference (ADR-002: Kayak/Skyscanner model).
 * Shows summary line (low price + offer count) then collapsible offer rows.
 * Ref: partfinder_price_compare_v3.html — right panel part cards.
 */
export function PartCard({ group }: PartCardProps) {
  const [expanded, setExpanded] = useState(false);

  const bestOffer = group.offers[0];
  const visibleOffers = expanded ? group.offers : group.offers.slice(0, 3);
  const hiddenCount = group.offers.length - 3;

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Part image placeholder */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
          {group.image_url ? (
            <img
              src={group.image_url}
              alt={group.part_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3M6.75 21h10.5" />
            </svg>
          )}
        </div>

        {/* Part info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{group.part_name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {group.brand_name && (
              <span className="text-xs text-gray-500">{group.brand_name}</span>
            )}
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs font-mono text-gray-400">{group.part_number_normalized}</span>
            {group.has_rec && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486z" clipRule="evenodd" />
                </svg>
                REC dispo
              </span>
            )}
          </div>
        </div>

        {/* Price summary + expand chevron */}
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-gray-900">
            {group.low_price_eur.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-500">
            {group.offer_count} offre{group.offer_count > 1 ? "s" : ""}
          </p>
          <svg
            className={`w-4 h-4 text-gray-400 mt-1 ml-auto transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Best offer preview (always visible, collapsed) */}
      {!expanded && bestOffer && (
        <div className="border-t border-gray-100">
          <OfferRow offer={bestOffer} rank={1} />
        </div>
      )}

      {/* All offers (expanded) */}
      {expanded && (
        <div>
          {visibleOffers.map((offer, i) => (
            <OfferRow key={offer.id} offer={offer} rank={i + 1} />
          ))}
          {!expanded && hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Voir {hiddenCount} offre{hiddenCount > 1 ? "s" : ""} de plus ↓
            </button>
          )}
        </div>
      )}

      {/* Collapse button */}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors"
        >
          Réduire ↑
        </button>
      )}
    </article>
  );
}
