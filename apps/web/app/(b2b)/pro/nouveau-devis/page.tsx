"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { TierPill } from "@/components/ui/tier-pill";
import { Flag } from "@/components/ui/flag";
import { ImgPlaceholder } from "@/components/ui/img-placeholder";

// ─── Data ────────────────────────────────────────────────────────────────────

const VEHICLES = [
  { id: "v1", make: "Volkswagen", model: "Golf 7",         motor: "2.0 TDI 150ch", year: "2016", plate: "EF-123-GH", client: "Garage Dubois · VIN interne #D-0418",  kind: "tourisme"   },
  { id: "v2", make: "Renault",    model: "Clio IV",         motor: "1.5 dCi 90ch",  year: "2014", plate: "CG-442-VL", client: "Mme Lefèvre · entretien régulier",      kind: "tourisme"   },
  { id: "v3", make: "Ford",       model: "Transit Custom",  motor: "2.0 EcoBlue 130ch", year: "2019", plate: "FL-028-XP", client: "Flotte · Maçonnerie Morel",        kind: "utilitaire" },
];

interface Offer { id: string; brand: string; tier: string; ref: string; source: string; price: number; shipping: number; delivery: string; rec?: boolean; recGrade?: string; }
interface CartLine { id: string; vehicleId: string; label: string; category: string; qty: number; selectedId: string; offers: Offer[]; }

const CART_SEED: CartLine[] = [
  { id: "g1", vehicleId: "v1", label: "Disque de frein avant",   category: "Disques · AV",           qty: 2, selectedId: "x", offers: [
    { id: "x", brand: "Zimmermann", tier: "OES", ref: "34116792217", source: "oscaro",      price: 34.90, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "y", brand: "Zimmermann", tier: "OES", ref: "34116792217", source: "mister_auto", price: 28.50, shipping: 0,    delivery: "Jeu. 24 avr." },
    { id: "z", brand: "Brembo",     tier: "OEM", ref: "09.A761.11",  source: "oscaro",      price: 41.50, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "w", brand: "RecyclAuto", tier: "REC", ref: "VHU-044/19",  source: "ovoko",       price: 19.00, shipping: 9.90, delivery: "Mar. 29 avr.", rec: true, recGrade: "A" },
  ]},
  { id: "g2", vehicleId: "v1", label: "Jeu plaquettes avant",    category: "Plaquettes · AV",        qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Bosch",  tier: "IAM", ref: "0986494351", source: "mister_auto", price: 28.40, shipping: 0,    delivery: "Jeu. 24 avr." },
    { id: "y", brand: "Textar", tier: "OES", ref: "2501101",    source: "oscaro",      price: 34.20, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "z", brand: "Ferodo", tier: "IAM", ref: "FDB4050",    source: "autodoc",     price: 31.80, shipping: 5.90, delivery: "Ven. 25 avr." },
  ]},
  { id: "g3", vehicleId: "v1", label: "Filtre à huile",           category: "Filtration",             qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Mann",  tier: "OEM", ref: "HU716/2X", source: "oscaro",      price: 6.90, shipping: 0, delivery: "Mer. 23 avr." },
    { id: "y", brand: "Mahle", tier: "OES", ref: "OX153D2",  source: "mister_auto", price: 7.40, shipping: 0, delivery: "Jeu. 24 avr." },
  ]},
  { id: "g4", vehicleId: "v1", label: "Bougies allumage",         category: "Allumage · jeu de 4",   qty: 4, selectedId: "x", offers: [
    { id: "x", brand: "NGK",   tier: "OES", ref: "BKR6EK", source: "autodoc",     price: 3.80, shipping: 5.90, delivery: "Ven. 25 avr." },
    { id: "y", brand: "Bosch", tier: "IAM", ref: "FR7DC+", source: "mister_auto", price: 4.20, shipping: 0,    delivery: "Jeu. 24 avr." },
  ]},
  { id: "g5", vehicleId: "v1", label: "Pneu 205/55 R16 91H",      category: "Pneumatique · été",      qty: 4, selectedId: "x", offers: [
    { id: "x", brand: "Michelin",    tier: "IAM", ref: "Primacy 4", source: "rockauto", price: 74.00, shipping: 18.00, delivery: "Lun. 5 mai" },
    { id: "y", brand: "Continental", tier: "IAM", ref: "PC6",       source: "ebay_fr",  price: 82.00, shipping: 0,     delivery: "Variable" },
  ]},
  { id: "c1", vehicleId: "v2", label: "Filtre à huile",            category: "Filtration",             qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Purflux", tier: "OEM", ref: "LS932",   source: "mister_auto", price: 5.40, shipping: 0, delivery: "Jeu. 24 avr." },
    { id: "y", brand: "Mann",    tier: "OES", ref: "W712/93", source: "oscaro",      price: 6.10, shipping: 0, delivery: "Mer. 23 avr." },
  ]},
  { id: "c2", vehicleId: "v2", label: "Filtre habitacle",          category: "Habitacle",              qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Corteco", tier: "OES", ref: "80 001 181", source: "oscaro",      price: 12.40, shipping: 0, delivery: "Mer. 23 avr." },
    { id: "y", brand: "Mann",    tier: "OEM", ref: "CUK22011",   source: "mister_auto", price: 14.90, shipping: 0, delivery: "Jeu. 24 avr." },
  ]},
  { id: "c3", vehicleId: "v2", label: "Jeu de courroies",          category: "Distribution",           qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Gates", tier: "OES", ref: "5602XS",    source: "autodoc",     price: 48.20, shipping: 5.90, delivery: "Ven. 25 avr." },
    { id: "y", brand: "SKF",   tier: "OEM", ref: "VKMA 06106", source: "mister_auto", price: 54.00, shipping: 0,   delivery: "Jeu. 24 avr." },
  ]},
  { id: "t1", vehicleId: "v3", label: "Filtre à gasoil",           category: "Filtration",             qty: 2, selectedId: "x", offers: [
    { id: "x", brand: "Mann",   tier: "OES", ref: "WK820/14", source: "autodoc",     price: 18.90, shipping: 5.90, delivery: "Ven. 25 avr." },
    { id: "y", brand: "Hengst", tier: "OEM", ref: "H348WK",   source: "mister_auto", price: 22.40, shipping: 0,    delivery: "Jeu. 24 avr." },
  ]},
  { id: "t2", vehicleId: "v3", label: "Amortisseur AR (paire)",    category: "Suspension · AR",        qty: 1, selectedId: "x", offers: [
    { id: "x", brand: "Sachs",  tier: "OES", ref: "317468", source: "oscaro",   price: 148.00, shipping: 0,     delivery: "Mer. 23 avr." },
    { id: "y", brand: "Monroe", tier: "IAM", ref: "G8114",  source: "rockauto", price: 124.00, shipping: 22.00, delivery: "Mer. 7 mai" },
  ]},
];

const STRATEGIES = [
  { k: "price",     l: "Meilleur prix",    sub: "minimise le total" },
  { k: "speed",     l: "Livraison rapide", sub: "tout sous 48 h" },
  { k: "shipments", l: "Moins de colis",   sub: "consolide chez un même vendeur" },
  { k: "oem",       l: "Tout OEM/OES",     sub: "qualité constructeur" },
];

const STRATEGY_MAP: Record<string, Record<string, string>> = {
  price:     { g1: "w", g2: "x", g3: "x", g4: "y", g5: "x", c1: "x", c2: "x", c3: "x", t1: "x", t2: "y" },
  speed:     { g1: "x", g2: "y", g3: "x", g4: "y", g5: "y", c1: "y", c2: "y", c3: "y", t1: "y", t2: "x" },
  shipments: { g1: "z", g2: "y", g3: "x", g4: "x", g5: "x", c1: "y", c2: "x", c3: "y", t1: "y", t2: "x" },
  oem:       { g1: "z", g2: "y", g3: "x", g4: "y", g5: "x", c1: "y", c2: "y", c3: "y", t1: "y", t2: "x" },
};

const SELLER_META: Record<string, { name: string; country: string; torquedOk: boolean; ships: string }> = {
  oscaro:      { name: "Oscaro",       country: "FR", torquedOk: true,  ships: "24h" },
  mister_auto: { name: "Mister Auto",  country: "FR", torquedOk: true,  ships: "48h" },
  autodoc:     { name: "AutoDoc",      country: "DE", torquedOk: true,  ships: "3–5j" },
  rockauto:    { name: "RockAuto",     country: "US", torquedOk: false, ships: "5–8j" },
  ebay_fr:     { name: "eBay France",  country: "FR", torquedOk: false, ships: "variable" },
  ovoko:       { name: "Ovoko",        country: "LT", torquedOk: false, ships: "5–9j" },
};

const FREE_SHIPPING: Record<string, number | null> = {
  oscaro: 49, mister_auto: 50, autodoc: 60, ovoko: null, rockauto: null, ebay_fr: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOffer(line: CartLine): Offer {
  return line.offers.find(o => o.id === line.selectedId) ?? line.offers[0];
}

function lineTotal(line: CartLine): number {
  const o = getOffer(line);
  return o.price * line.qty;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", border: "0.5px solid var(--border)", borderRadius: 6, background: "var(--bg)" }}>
      <button onClick={() => onChange(Math.max(1, value - 1))} style={{ padding: "4px 8px", color: "var(--ink-mid)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>−</button>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "center" }}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={{ padding: "4px 8px", color: "var(--ink-mid)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>+</button>
    </div>
  );
}

interface QuoteLineProps {
  line: CartLine;
  onSwap: () => void;
  onRemove: () => void;
  onQty: (n: number) => void;
  showVehicle?: boolean;
  vehicle?: typeof VEHICLES[0] | null;
}

function QuoteLine({ line, onSwap, onRemove, onQty, showVehicle = false, vehicle = null }: QuoteLineProps) {
  const offer = getOffer(line);
  const seller = SELLER_META[offer.source] ?? { name: offer.source, country: "FR", torquedOk: false, ships: "" };
  const total = lineTotal(line);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: showVehicle ? "48px 1fr 140px 130px 120px 95px 22px" : "48px 1fr 140px 130px 95px 22px",
      gap: 12, alignItems: "center",
      padding: "11px 16px", borderTop: "0.5px solid var(--border)",
      background: "var(--bg)",
    }}>
      <ImgPlaceholder label="pièce" width={48} height={48} style={{ borderRadius: 6 }} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{line.label}</span>
          <TierPill tier={offer.tier} />
          {offer.rec && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "#D6F5E8", color: "#0A6640", padding: "2px 6px", borderRadius: 999 }}>REC {offer.recGrade}</span>
          )}
          {!seller.torquedOk && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "rgba(186,117,23,0.12)", color: "var(--warning)", padding: "1px 6px", borderRadius: 3 }}>Redirection</span>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)", marginBottom: 3 }}>
          {offer.brand} · {offer.ref} · {line.category}
        </div>
        <button onClick={onSwap} style={{
          fontSize: 11, color: "var(--ink-mid)",
          border: "0.5px solid var(--border)", padding: "1px 7px", borderRadius: 999, background: "var(--bg)",
          cursor: "pointer",
        }}>
          {line.offers.length - 1} alt. ▾
        </button>
      </div>

      {showVehicle && vehicle && (
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", background: "var(--bg-warm2)", borderRadius: 6, border: "0.5px solid var(--border)" }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--ink-mid)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13l2-6h14l2 6v5h-3M3 13v5h3M3 13h18M6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500 }}>{vehicle.make} {vehicle.model}</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 3 }}>{vehicle.plate}</div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="var(--ink-mid)" strokeWidth={1.6} strokeLinecap="round"><path d="M3 16V6h11v10M14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
          {offer.delivery}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 1 }}>
          {offer.shipping === 0 ? "Port gratuit" : `+ ${offer.shipping.toFixed(2)} €`}
        </div>
      </div>

      <QtyStepper value={line.qty} onChange={onQty} />

      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{total.toFixed(2)} €</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>{offer.price.toFixed(2)} €/u</div>
      </div>

      <button onClick={onRemove} style={{ color: "var(--ink-light)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>✕</button>
    </div>
  );
}

function SellerStrip({ sourceKey, lines }: { sourceKey: string; lines: CartLine[] }) {
  const s = SELLER_META[sourceKey] ?? { name: sourceKey, country: "FR", torquedOk: false, ships: "" };
  const subtotal = lines.reduce((acc, l) => acc + lineTotal(l), 0);
  const shipping = Math.max(0, ...lines.map(l => getOffer(l).shipping));
  const latest = lines.map(l => getOffer(l).delivery).sort().slice(-1)[0];

  return (
    <div style={{
      padding: "8px 16px", background: s.torquedOk ? "var(--bg-warm2)" : "rgba(186,117,23,0.05)",
      display: "flex", alignItems: "center", gap: 10,
      borderTop: "0.5px solid var(--border)", fontSize: 11,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
        background: s.torquedOk ? "var(--ink)" : "var(--warning)",
        color: "#fff", padding: "2px 7px", borderRadius: 3,
      }}>
        {s.torquedOk ? "COLIS" : "REDIR"}
      </span>
      <Flag code={s.country as "FR" | "DE" | "UK" | "ES" | "US" | "LT"} size={12} />
      <span style={{ fontWeight: 500 }}>{s.name}</span>
      <span style={{ color: "var(--ink-light)" }}>·</span>
      <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-light)" }}>
        {lines.length} pièce{lines.length > 1 ? "s" : ""}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-mid)" }}>
        {latest} · {shipping === 0 ? "port inclus" : `+ ${shipping.toFixed(2)} €`}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)", marginLeft: 8 }}>
        {(subtotal + shipping).toFixed(2)} €
      </span>
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

interface ViewProps {
  cart: CartLine[];
  onSwap: (id: string) => void;
  onRemove: (id: string) => void;
  onQty: (id: string, n: number) => void;
}

function ByVehicleView({ cart, onSwap, onRemove, onQty }: ViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {VEHICLES.map(v => {
        const vLines = cart.filter(l => l.vehicleId === v.id);
        if (!vLines.length) return null;

        const subtotal = vLines.reduce((s, l) => s + lineTotal(l), 0);
        const bySource = vLines.reduce((acc, l) => {
          const src = getOffer(l).source;
          if (!acc[src]) acc[src] = [];
          acc[src].push(l);
          return acc;
        }, {} as Record<string, CartLine[]>);
        const shipmentCount = Object.keys(bySource).length;

        return (
          <div key={v.id} className="card" style={{ overflow: "hidden" }}>
            {/* Vehicle header */}
            <div style={{ padding: "14px 18px", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 13l2-6h14l2 6v5h-3M3 13v5h3M3 13h18M6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 10 }}>
                  {v.make} {v.model} · {v.motor}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: "rgba(255,255,255,0.12)", padding: "2px 7px", borderRadius: 4 }}>
                    {v.plate}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{v.client}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600 }}>{subtotal.toFixed(2)} €</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                  {vLines.length} pièces · {shipmentCount} colis
                </div>
              </div>
            </div>

            {/* Lines */}
            {vLines.map(l => (
              <QuoteLine key={l.id} line={l} onSwap={() => onSwap(l.id)} onRemove={() => onRemove(l.id)} onQty={n => onQty(l.id, n)} />
            ))}

            {/* Per-seller strips */}
            {Object.entries(bySource).map(([src, lines]) => (
              <SellerStrip key={src} sourceKey={src} lines={lines} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ByMerchantView({ cart, onSwap, onRemove, onQty }: ViewProps) {
  const bySource = cart.reduce((acc, l) => {
    const src = getOffer(l).source;
    if (!acc[src]) acc[src] = [];
    acc[src].push(l);
    return acc;
  }, {} as Record<string, CartLine[]>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Object.entries(bySource).map(([src, lines]) => {
        const s = SELLER_META[src] ?? { name: src, country: "FR", torquedOk: false, ships: "" };
        const subtotal = lines.reduce((acc, l) => acc + lineTotal(l), 0);
        const threshold = FREE_SHIPPING[src];
        const toFranco = threshold ? Math.max(0, threshold - subtotal) : null;
        const francoProgress = threshold ? Math.min(1, subtotal / threshold) : null;

        return (
          <div key={src} className="card" style={{ overflow: "hidden" }}>
            {/* Merchant header */}
            <div style={{
              padding: "14px 18px",
              background: s.torquedOk ? "var(--ink)" : "var(--bg-warm2)",
              color: s.torquedOk ? "#fff" : "var(--ink)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                background: s.torquedOk ? "var(--coral)" : "var(--bg)",
                border: s.torquedOk ? "none" : "0.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Flag code={s.country as "FR" | "DE" | "UK" | "ES" | "US" | "LT"} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.torquedOk ? "rgba(255,255,255,0.6)" : "var(--ink-light)" }}>
                    · expédie depuis {s.country} · {s.ships}
                  </span>
                  {s.torquedOk && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, background: "var(--coral)", color: "#fff", padding: "2px 7px", borderRadius: 4 }}>
                      1 PAIEMENT TORQUED
                    </span>
                  )}
                </div>
                {francoProgress !== null && toFranco !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                      <div style={{ width: `${francoProgress * 100}%`, height: "100%", background: francoProgress >= 1 ? "#4CAF50" : "var(--coral)", borderRadius: 999 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.torquedOk ? "rgba(255,255,255,0.7)" : "var(--ink-light)", whiteSpace: "nowrap" }}>
                      {toFranco === 0 ? "Franco atteint ✓" : `${toFranco.toFixed(0)} € jusqu'au franco`}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600 }}>{subtotal.toFixed(2)} €</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.torquedOk ? "rgba(255,255,255,0.5)" : "var(--ink-light)", marginTop: 1 }}>
                  {lines.length} pièces
                </div>
              </div>
            </div>

            {/* Lines (cross-vehicle) */}
            {lines.map(l => {
              const veh = VEHICLES.find(v => v.id === l.vehicleId) ?? null;
              return (
                <QuoteLine key={l.id} line={l} onSwap={() => onSwap(l.id)} onRemove={() => onRemove(l.id)} onQty={n => onQty(l.id, n)} showVehicle vehicle={veh} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewQuotePage() {
  const [cart, setCart] = useState<CartLine[]>(CART_SEED);
  const [strategy, setStrategy] = useState("price");
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);
  const [view, setView] = useState<"vehicle" | "merchant">("vehicle");
  const [, setSwapOpen] = useState<string | null>(null);

  const effectiveCart = useMemo(() => {
    const map = STRATEGY_MAP[strategy] ?? {};
    return cart.map(l => {
      const override = map[l.id];
      if (!override) return l;
      const exists = l.offers.find(o => o.id === override);
      if (!exists) return l;
      return { ...l, selectedId: override };
    });
  }, [cart, strategy]);

  const visibleCart = useMemo(() => {
    if (activeVehicle === null) return effectiveCart;
    return effectiveCart.filter(l => l.vehicleId === activeVehicle);
  }, [effectiveCart, activeVehicle]);

  const allTotal = effectiveCart.reduce((s, l) => s + lineTotal(l), 0);
  const allShipping = Object.values(
    effectiveCart.reduce((acc, l) => {
      const o = getOffer(l);
      const existing = acc[o.source] ?? 0;
      acc[o.source] = Math.max(existing, o.shipping);
      return acc;
    }, {} as Record<string, number>)
  ).reduce((a, b) => a + b, 0);

  const torquedLines = effectiveCart.filter(l => {
    const s = SELLER_META[getOffer(l).source];
    return s?.torquedOk;
  });
  const redirectLines = effectiveCart.filter(l => {
    const s = SELLER_META[getOffer(l).source];
    return !s?.torquedOk;
  });
  const torquedTotal = torquedLines.reduce((s, l) => s + lineTotal(l), 0);
  const redirectTotal = redirectLines.reduce((s, l) => s + lineTotal(l), 0);

  const shipmentCount = new Set(effectiveCart.map(l => getOffer(l).source)).size;

  function removeLine(id: string) {
    setCart(c => c.filter(l => l.id !== id));
  }
  function updateQty(id: string, n: number) {
    setCart(c => c.map(l => l.id === id ? { ...l, qty: n } : l));
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo size={24} />
          </Link>
          <div style={{ flex: 1 }} />
          <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Link href="/" style={{ fontSize: 13, color: "var(--ink-mid)", textDecoration: "none" }}>B2C</Link>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>Nouveau devis</span>
            <Link href="/pro/panier" style={{ fontSize: 13, textDecoration: "none" }}>
              <span className="btn btn-primary btn-sm">
                Panier → {effectiveCart.length}
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 24px 120px" }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>Nouveau devis</h1>
          <p style={{ fontSize: 13, color: "var(--ink-mid)" }}>
            {VEHICLES.length} véhicules · {effectiveCart.length} pièces · {shipmentCount} colis estimés
          </p>
        </div>

        {/* Vehicle tabs */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Tous */}
          <button onClick={() => setActiveVehicle(null)} style={{
            padding: "10px 14px", borderRadius: 10, textAlign: "left",
            background: activeVehicle === null ? "var(--ink)" : "transparent",
            color: activeVehicle === null ? "#fff" : "var(--ink)",
            border: "0.5px solid " + (activeVehicle === null ? "var(--ink)" : "var(--border)"),
            minWidth: 160, cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: activeVehicle === null ? "rgba(255,255,255,0.15)" : "var(--bg-warm2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={activeVehicle === null ? "#fff" : "var(--ink-mid)"} strokeWidth={1.6} strokeLinecap="round"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Tous véhicules</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: activeVehicle === null ? "rgba(255,255,255,0.6)" : "var(--ink-light)", display: "flex", gap: 8 }}>
              <span>{VEHICLES.length} véh.</span>
              <span>·</span>
              <span>{effectiveCart.length} pièces</span>
              <span>·</span>
              <span style={{ color: activeVehicle === null ? "#fff" : "var(--coral)", fontWeight: 500 }}>{allTotal.toFixed(0)} €</span>
            </div>
          </button>

          {VEHICLES.map(v => {
            const vLines = effectiveCart.filter(l => l.vehicleId === v.id);
            const vTotal = vLines.reduce((s, l) => s + lineTotal(l), 0);
            const active = activeVehicle === v.id;
            return (
              <button key={v.id} onClick={() => setActiveVehicle(v.id)} style={{
                padding: "10px 14px", borderRadius: 10, textAlign: "left",
                background: active ? "var(--bg)" : "transparent",
                border: "0.5px solid " + (active ? "var(--ink)" : "var(--border)"),
                boxShadow: active ? "var(--shadow-sm)" : "none",
                minWidth: 190, cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? "var(--coral-bg)" : "var(--bg-warm2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={active ? "var(--coral)" : "var(--ink-mid)"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 13l2-6h14l2 6v5h-3M3 13v5h3M3 13h18M6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{v.make} {v.model}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", display: "flex", gap: 8 }}>
                  <span>{v.plate}</span>
                  <span>·</span>
                  <span>{vLines.length} pièce{vLines.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span style={{ color: active ? "var(--coral)" : "var(--ink-mid)", fontWeight: 500 }}>{vTotal.toFixed(0)} €</span>
                </div>
              </button>
            );
          })}

          <button style={{
            padding: "10px 14px", borderRadius: 10, border: "0.5px dashed var(--border-strong)",
            background: "var(--bg-warm)", color: "var(--ink-mid)", fontSize: 12, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8, minWidth: 150, cursor: "pointer",
          }}>
            + Ajouter un véhicule
          </button>
        </div>

        {/* Strategy toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>
            Stratégie d&apos;achat
          </div>
          <div style={{ display: "flex", gap: 0, padding: 3, background: "var(--bg-warm2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
            {STRATEGIES.map(s => (
              <button key={s.k} onClick={() => setStrategy(s.k)} style={{
                flex: 1, padding: "10px 14px", borderRadius: 7, fontSize: 12,
                background: strategy === s.k ? "var(--bg)" : "transparent",
                color: strategy === s.k ? "var(--ink)" : "var(--ink-mid)",
                boxShadow: strategy === s.k ? "var(--shadow-sm)" : "none",
                textAlign: "left", border: "none", cursor: "pointer", transition: "all .12s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {strategy === s.k && <span style={{ color: "var(--coral)", fontSize: 10 }}>✓</span>}
                  <span style={{ fontWeight: 500 }}>{s.l}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 2 }}>{s.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* View toggle + count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)" }}>
            {visibleCart.length} ligne{visibleCart.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: 4, background: "var(--bg-warm2)", padding: 3, borderRadius: 8, border: "0.5px solid var(--border)" }}>
            {(["vehicle", "merchant"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 5, fontSize: 12, fontWeight: 500,
                background: view === v ? "var(--bg)" : "transparent",
                color: view === v ? "var(--ink)" : "var(--ink-mid)",
                border: "none", cursor: "pointer",
                boxShadow: view === v ? "var(--shadow-sm)" : "none",
              }}>
                {v === "vehicle" ? "Par véhicule" : "Par marchand"}
              </button>
            ))}
          </div>
        </div>

        {/* Main list */}
        {view === "vehicle" ? (
          <ByVehicleView cart={visibleCart} onSwap={id => setSwapOpen(id)} onRemove={removeLine} onQty={updateQty} />
        ) : (
          <ByMerchantView cart={visibleCart} onSwap={id => setSwapOpen(id)} onRemove={removeLine} onQty={updateQty} />
        )}

        {/* Cross-vehicle insights */}
        {activeVehicle === null && (
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              {
                icon: "consolidate",
                title: "Consolider chez Oscaro",
                sub: `Ajouter 12 € pour atteindre le franco (49 €). Économie livraison estimée : 8,90 €.`,
                cta: "Voir les pièces compatibles →",
              },
              {
                icon: "rec",
                title: "2 pièces disponibles en REC",
                sub: `Disques Golf 7 + Amortisseurs Transit disponibles en REC A. Économie : ~58 €.`,
                cta: "Afficher les alternatives →",
              },
              {
                icon: "oem",
                title: "3 pièces en IAM upgradeables",
                sub: `Passage OES disponible pour Bosch plaquettes, NGK bougies et filtre Mahle.`,
                cta: "Basculer en OES →",
              },
            ].map((tip, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.5, marginBottom: 10 }}>{tip.sub}</div>
                <button style={{ fontSize: 12, color: "var(--coral)", background: "none", border: "none", padding: 0, cursor: "pointer" }}>{tip.cta}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky checkout bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
        background: "var(--bg)", borderTop: "0.5px solid var(--border)",
        boxShadow: "0 -4px 24px rgba(15,25,35,0.08)",
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 24 }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Total pièces", val: `${(allTotal).toFixed(2)} €` },
              { label: "Livraison est.", val: allShipping === 0 ? "Offerte" : `${allShipping.toFixed(2)} €` },
              { label: "Total TTC", val: `${(allTotal + allShipping).toFixed(2)} €`, big: true },
              { label: "Colis", val: `${shipmentCount}` },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: s.big ? 18 : 14, fontWeight: s.big ? 700 : 500, color: s.big ? "var(--ink)" : "var(--ink-mid)" }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {/* Checkout split */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {torquedLines.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>Torqued Checkout</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{torquedTotal.toFixed(2)} €</div>
              </div>
            )}
            {redirectLines.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>Redirections ({redirectLines.length})</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>{redirectTotal.toFixed(2)} €</div>
              </div>
            )}
            <Link href="/pro/panier" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600 }}>
              Commander →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
