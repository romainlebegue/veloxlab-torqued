import { RecBadge } from "@/components/ui/rec-badge";
import { SponsoredTag } from "@/components/ui/sponsored-tag";
import type { RankedOffer } from "@/lib/search";

interface OfferRowProps {
  offer: RankedOffer;
  rank: number;
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Neuf",
  USED: "Occasion",
  REMAN: "Reconditionné",
  REC: "Recyclé certifié",
};

const SOURCE_LOGO: Record<string, string> = {
  autodoc:    "AutoDoc",
  mister_auto:"Mister Auto",
  oscaro:     "Oscaro",
  rockauto:   "RockAuto",
  ebay_fr:    "eBay France",
  ebay_de:    "eBay Allemagne",
  ebay_uk:    "eBay UK",
  ebay_es:    "eBay Espagne",
  ovoko:      "Ovoko",
};

/**
 * One offer row inside a PartCard.
 * Ref: partfinder_price_compare_v3.html — offer row layout.
 */
export function OfferRow({ offer, rank }: OfferRowProps) {
  const totalEur = offer.price_eur + (offer.shipping_cost_eur ?? 0);
  const sellerLabel = offer.seller_name ?? SOURCE_LOGO[offer.source] ?? offer.source;
  const conditionLabel = CONDITION_LABEL[offer.condition] ?? offer.condition;
  const isFreeShipping = offer.shipping_cost_eur === 0 || offer.shipping_cost_eur === null;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 border-t border-gray-100
        ${rank === 1 ? "bg-blue-50/40" : "hover:bg-gray-50"}
        transition-colors`}
    >
      {/* Rank badge */}
      <div className="w-6 shrink-0 flex justify-center">
        {rank === 1 ? (
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            1
          </span>
        ) : (
          <span className="text-xs text-gray-300 font-medium">{rank}</span>
        )}
      </div>

      {/* Seller + condition */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">{sellerLabel}</span>
          {offer.is_sponsored && <SponsoredTag />}
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium
              ${offer.condition === "NEW"   ? "bg-green-50 text-green-700" :
                offer.condition === "REC"   ? "bg-emerald-50 text-emerald-700" :
                offer.condition === "REMAN" ? "bg-sky-50 text-sky-700" :
                                              "bg-gray-100 text-gray-600"}`}
          >
            {conditionLabel}
          </span>
        </div>

        {/* REC traceability line */}
        {offer.is_rec && offer.rec_grade && (
          <div className="mt-1">
            <RecBadge
              grade={offer.rec_grade as "A" | "B"}
              donorVin={offer.rec_donor_vin}
              donorKm={offer.rec_donor_km}
              dismantlerCert={offer.rec_dismantler_cert}
            />
          </div>
        )}

        {/* Warranty */}
        {offer.warranty_months && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            Garantie {offer.warranty_months} mois
          </p>
        )}
      </div>

      {/* Shipping */}
      <div className="text-right text-xs text-gray-500 shrink-0 hidden sm:block">
        {isFreeShipping ? (
          <span className="text-green-600 font-medium">Livraison offerte</span>
        ) : (
          <span>+ {offer.shipping_cost_eur?.toFixed(2)} € livraison</span>
        )}
      </div>

      {/* Price + CTA */}
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-gray-900">{offer.price_eur.toFixed(2)} €</p>
        {!isFreeShipping && (
          <p className="text-[11px] text-gray-400 sm:hidden">
            + {offer.shipping_cost_eur?.toFixed(2)} € livraison
          </p>
        )}
        <p className="text-[11px] text-gray-400">total {totalEur.toFixed(2)} €</p>
        <a
          href={`/go/${offer.source}/${offer.id}`}
          className="mt-1.5 inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          Voir l'offre →
        </a>
      </div>
    </div>
  );
}
