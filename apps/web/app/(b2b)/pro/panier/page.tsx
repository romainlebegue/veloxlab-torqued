"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { TierPill } from "@/components/ui/tier-pill";
import { Flag } from "@/components/ui/flag";
import { ImgPlaceholder } from "@/components/ui/img-placeholder";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Offer { id: string; brand: string; tier: string; ref: string; source: string; price: number; shipping: number; delivery: string; rec?: boolean; recGrade?: string; }
interface CartLine { id: string; label: string; category: string; qty: number; selectedId: string; offers: Offer[]; }

const SELLER_META: Record<string, { name: string; country: string; rating: number; reviews: number; torquedOk: boolean; ships: string }> = {
  oscaro:      { name: "Oscaro",      country: "FR", rating: 4.5, reviews: 28410, torquedOk: true,  ships: "24h" },
  mister_auto: { name: "Mister Auto", country: "FR", rating: 4.1, reviews: 12840, torquedOk: true,  ships: "48h" },
  autodoc:     { name: "AutoDoc",     country: "DE", rating: 4.3, reviews: 89100, torquedOk: true,  ships: "3–5j" },
  rockauto:    { name: "RockAuto",    country: "US", rating: 4.2, reviews: 44200, torquedOk: false, ships: "5–8j" },
  ebay_fr:     { name: "eBay France", country: "FR", rating: 3.9, reviews: 2140,  torquedOk: false, ships: "variable" },
  ovoko:       { name: "Ovoko",       country: "LT", rating: 4.0, reviews: 6820,  torquedOk: false, ships: "5–9j" },
};

const CART_SEED: CartLine[] = [
  { id: "l1", label: "Disque de frein avant",  category: "Disques de frein · AV",  qty: 2, selectedId: "o1", offers: [
    { id: "o1", brand: "Zimmermann", tier: "OES", ref: "34116792217", source: "oscaro",      price: 34.90, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "o2", brand: "Zimmermann", tier: "OES", ref: "34116792217", source: "mister_auto", price: 28.50, shipping: 0,    delivery: "Jeu. 24 avr." },
    { id: "o3", brand: "Brembo",     tier: "OEM", ref: "09.A761.11",  source: "oscaro",      price: 41.50, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "o4", brand: "RecyclAuto", tier: "REC", ref: "VHU-044/19",  source: "ovoko",       price: 19.00, shipping: 9.90, delivery: "Mar. 29 avr.", rec: true, recGrade: "A" },
  ]},
  { id: "l2", label: "Jeu plaquettes avant",   category: "Plaquettes · AV",        qty: 1, selectedId: "p1", offers: [
    { id: "p1", brand: "Bosch",    tier: "IAM", ref: "0986494351", source: "mister_auto", price: 28.40, shipping: 0,    delivery: "Jeu. 24 avr." },
    { id: "p2", brand: "Textar",   tier: "OES", ref: "2501101",    source: "oscaro",      price: 34.20, shipping: 0,    delivery: "Mer. 23 avr." },
    { id: "p3", brand: "Ferodo",   tier: "IAM", ref: "FDB4050",    source: "autodoc",     price: 31.80, shipping: 5.90, delivery: "Ven. 25 avr." },
  ]},
  { id: "l3", label: "Filtre à huile",          category: "Filtration",              qty: 1, selectedId: "f1", offers: [
    { id: "f1", brand: "Mann",  tier: "OEM", ref: "HU716/2X", source: "oscaro",      price: 6.90, shipping: 0, delivery: "Mer. 23 avr." },
    { id: "f2", brand: "Mahle", tier: "OES", ref: "OX153D2",  source: "mister_auto", price: 7.40, shipping: 0, delivery: "Jeu. 24 avr." },
  ]},
  { id: "l4", label: "Bougies allumage",        category: "Allumage · jeu de 4",    qty: 4, selectedId: "b1", offers: [
    { id: "b1", brand: "NGK",   tier: "OES", ref: "BKR6EK", source: "autodoc",     price: 3.80, shipping: 5.90, delivery: "Ven. 25 avr." },
    { id: "b2", brand: "Bosch", tier: "IAM", ref: "FR7DC+", source: "mister_auto", price: 4.20, shipping: 0,    delivery: "Jeu. 24 avr." },
  ]},
  { id: "l5", label: "Pneu 205/55 R16 91H",     category: "Pneumatique · été",       qty: 4, selectedId: "t1", offers: [
    { id: "t1", brand: "Michelin",    tier: "IAM", ref: "Primacy 4", source: "rockauto", price: 74.00, shipping: 18.00, delivery: "Lun. 5 mai" },
    { id: "t2", brand: "Continental", tier: "IAM", ref: "PC6",       source: "ebay_fr",  price: 82.00, shipping: 0,     delivery: "Variable" },
  ]},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOffer(line: CartLine): Offer {
  return line.offers.find(o => o.id === line.selectedId) ?? line.offers[0];
}
function lineTotal(line: CartLine): number {
  return getOffer(line).price * line.qty;
}

// ─── SwapPopover ──────────────────────────────────────────────────────────────

function SwapPopover({ line, onPick, onClose }: { line: CartLine; onPick: (id: string) => void; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,25,35,0.35)", zIndex: 90,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 640, maxHeight: "85vh", overflow: "auto",
        background: "var(--bg)", borderRadius: 14, boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Choisir une autre offre</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)", marginTop: 2 }}>
              {line.label} · {line.offers.length} offres disponibles
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--ink-mid)" }}>✕</button>
        </div>
        <div style={{ padding: 14 }}>
          {line.offers.map(o => {
            const s = SELLER_META[o.source] ?? { name: o.source, country: "FR", rating: 0, reviews: 0, torquedOk: false, ships: "" };
            const isSel = o.id === line.selectedId;
            return (
              <button key={o.id} onClick={() => onPick(o.id)} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center",
                width: "100%", textAlign: "left",
                padding: 12, marginBottom: 8, borderRadius: 10,
                border: isSel ? "1.5px solid var(--coral)" : "0.5px solid var(--border)",
                background: isSel ? "var(--coral-bg)" : "var(--bg)",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "1.5px solid " + (isSel ? "var(--coral)" : "var(--border-mid)"),
                  background: isSel ? "var(--coral)" : "transparent",
                }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{o.brand}</span>
                    <TierPill tier={o.tier} />
                    {o.rec && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "#D6F5E8", color: "#0A6640", padding: "2px 6px", borderRadius: 999 }}>REC {o.recGrade}</span>}
                    {!s.torquedOk && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "var(--bg-warm2)", color: "var(--ink-mid)", padding: "2px 6px", borderRadius: 4 }}>Redir.</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--ink-light)" }}>
                    <Flag code={s.country as "FR" | "DE" | "UK" | "ES" | "US" | "LT"} size={11} />
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span>·</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{o.ref}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", textAlign: "right" }}>{o.delivery}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 500 }}>{o.price.toFixed(2)} €</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>
                    {o.shipping === 0 ? "Livr. gratuite" : `+ ${o.shipping.toFixed(2)} € port`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Cart Line ────────────────────────────────────────────────────────────────

function CartLineRow({ line, selected, onToggle, onSwap, onRemove }: {
  line: CartLine; selected: boolean; onToggle: () => void; onSwap: () => void; onRemove: () => void;
}) {
  const offer = getOffer(line);
  const s = SELLER_META[offer.source] ?? { name: offer.source, country: "FR", rating: 0, reviews: 0, torquedOk: false, ships: "" };
  const total = lineTotal(line);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "24px 64px 1fr 220px 150px 110px 22px",
      alignItems: "center", gap: 16,
      padding: "16px 18px", borderTop: "0.5px solid var(--border)",
      background: selected ? "var(--bg)" : "var(--bg-warm)",
      transition: "background .1s",
    }}>
      <div onClick={onToggle} style={{
        width: 18, height: 18, borderRadius: 4, cursor: "pointer",
        border: "1.5px solid " + (selected ? "var(--coral)" : "var(--border-mid)"),
        background: selected ? "var(--coral)" : "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>}
      </div>

      <ImgPlaceholder label="pièce" width={64} height={64} style={{ borderRadius: 8 }} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{line.label}</span>
          <TierPill tier={offer.tier} />
          {offer.rec && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "#D6F5E8", color: "#0A6640", padding: "2px 6px", borderRadius: 999 }}>REC {offer.recGrade}</span>}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)" }}>× {line.qty}</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)", marginBottom: 6 }}>
          {line.category}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)", marginBottom: 6 }}>
          {offer.brand} · {offer.ref}
        </div>
        <button onClick={onSwap} style={{
          fontSize: 11, color: "var(--ink-mid)", border: "0.5px solid var(--border)",
          padding: "1px 7px", borderRadius: 999, background: "var(--bg)", cursor: "pointer",
        }}>
          {line.offers.length - 1} alt. ▾
        </button>
      </div>

      {/* Seller */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Flag code={s.country as "FR" | "DE" | "UK" | "ES" | "US" | "LT"} size={12} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>
            ★ {s.rating.toFixed(1)} · {s.reviews.toLocaleString("fr-FR")} avis
          </div>
        </div>
        {!s.torquedOk && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, background: "rgba(186,117,23,0.12)", color: "var(--warning)", padding: "2px 6px", borderRadius: 4 }}>REDIR</span>
        )}
      </div>

      {/* Delivery */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{offer.delivery}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: offer.shipping === 0 ? "var(--success)" : "var(--ink-light)", marginTop: 1 }}>
          {offer.shipping === 0 ? "Livraison offerte" : `+ ${offer.shipping.toFixed(2)} €`}
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600 }}>{total.toFixed(2)} €</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>{offer.price.toFixed(2)} €/u</div>
      </div>

      <button onClick={onRemove} style={{ color: "var(--ink-light)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>✕</button>
    </div>
  );
}

// ─── Seller Shipment Group ────────────────────────────────────────────────────

function SellerGroup({ sourceKey, lines, selected, onToggle, onSwap, onRemove }: {
  sourceKey: string; lines: CartLine[]; selected: Set<string>;
  onToggle: (id: string) => void; onSwap: (id: string) => void; onRemove: (id: string) => void;
}) {
  const s = SELLER_META[sourceKey] ?? { name: sourceKey, country: "FR", rating: 0, reviews: 0, torquedOk: false, ships: "" };
  const subtotal = lines.reduce((acc, l) => acc + lineTotal(l), 0);
  const shipping = Math.max(0, ...lines.map(l => getOffer(l).shipping));
  const latest = lines.map(l => getOffer(l).delivery).sort().slice(-1)[0];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Group header */}
      <div style={{
        padding: "14px 18px",
        background: s.torquedOk ? "var(--ink)" : "var(--bg-warm2)",
        color: s.torquedOk ? "#fff" : "var(--ink)",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: s.torquedOk ? "var(--coral)" : "var(--bg)",
          border: s.torquedOk ? "none" : "0.5px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Flag code={s.country as "FR" | "DE" | "UK" | "ES" | "US" | "LT"} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{s.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.torquedOk ? "rgba(255,255,255,0.6)" : "var(--ink-light)" }}>
              ★ {s.rating.toFixed(1)} · {s.reviews.toLocaleString("fr-FR")} avis · {s.ships}
            </span>
            {s.torquedOk ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, background: "var(--coral)", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
                1 PAIEMENT TORQUED
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, background: "rgba(186,117,23,0.15)", color: "var(--warning)", padding: "2px 8px", borderRadius: 4 }}>
                REDIRECTION
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: s.torquedOk ? "rgba(255,255,255,0.55)" : "var(--ink-light)" }}>
            {lines.length} pièce{lines.length !== 1 ? "s" : ""} · 1 colis · livraison {latest}
            {shipping > 0 ? ` · + ${shipping.toFixed(2)} €` : " · port inclus"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>{subtotal.toFixed(2)} €</div>
          {shipping > 0 && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.torquedOk ? "rgba(255,255,255,0.5)" : "var(--ink-light)", marginTop: 1 }}>
              total {(subtotal + shipping).toFixed(2)} € avec port
            </div>
          )}
        </div>
      </div>

      {/* Lines */}
      {lines.map(l => (
        <CartLineRow
          key={l.id} line={l}
          selected={selected.has(l.id)}
          onToggle={() => onToggle(l.id)}
          onSwap={() => onSwap(l.id)}
          onRemove={() => onRemove(l.id)}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>(CART_SEED);
  const [selected, setSelected] = useState<Set<string>>(new Set(CART_SEED.map(l => l.id)));
  const [swapOpen, setSwapOpen] = useState<string | null>(null);

  const bySource = useMemo(() => {
    return cart.reduce((acc, l) => {
      const src = getOffer(l).source;
      if (!acc[src]) acc[src] = [];
      acc[src].push(l);
      return acc;
    }, {} as Record<string, CartLine[]>);
  }, [cart]);

  const torquedGroups = Object.entries(bySource).filter(([src]) => SELLER_META[src]?.torquedOk);
  const redirectGroups = Object.entries(bySource).filter(([src]) => !SELLER_META[src]?.torquedOk);

  const selectedLines = cart.filter(l => selected.has(l.id));
  const allTotal = selectedLines.reduce((s, l) => s + lineTotal(l), 0);
  const allShipping = Object.entries(bySource).reduce((acc, [src, lines]) => {
    const hasSelected = lines.some(l => selected.has(l.id));
    if (!hasSelected) return acc;
    return acc + Math.max(0, ...lines.map(l => getOffer(l).shipping));
  }, 0);

  const torquedSelected = selectedLines.filter(l => SELLER_META[getOffer(l).source]?.torquedOk);
  const redirectSelected = selectedLines.filter(l => !SELLER_META[getOffer(l).source]?.torquedOk);
  const torquedTotal = torquedSelected.reduce((s, l) => s + lineTotal(l), 0);
  const redirectTotal = redirectSelected.reduce((s, l) => s + lineTotal(l), 0);
  const shipmentCount = new Set(selectedLines.map(l => getOffer(l).source)).size;

  function toggleLine(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function removeLine(id: string) {
    setCart(c => c.filter(l => l.id !== id));
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
  }
  function pickOffer(lineId: string, offerId: string) {
    setCart(c => c.map(l => l.id === lineId ? { ...l, selectedId: offerId } : l));
    setSwapOpen(null);
  }

  const swapLine = swapOpen ? cart.find(l => l.id === swapOpen) : null;

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
            <Link href="/pro/nouveau-devis" style={{ fontSize: 13, color: "var(--ink-mid)", textDecoration: "none" }}>← Retour au devis</Link>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>Panier · {cart.length} pièces</span>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 24px 140px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>Panier</h1>
          <p style={{ fontSize: 13, color: "var(--ink-mid)" }}>
            {torquedGroups.length} vendeur{torquedGroups.length !== 1 ? "s" : ""} Torqued Checkout · {redirectGroups.length} redirection{redirectGroups.length !== 1 ? "s" : ""} · {shipmentCount} colis
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
          {/* Left: grouped lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Torqued Checkout section */}
            {torquedGroups.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>
                    Torqued Checkout
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, background: "var(--ink)", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
                    1 PAIEMENT
                  </span>
                </div>
                {torquedGroups.map(([src, lines]) => (
                  <SellerGroup key={src} sourceKey={src} lines={lines} selected={selected} onToggle={toggleLine} onSwap={setSwapOpen} onRemove={removeLine} />
                ))}
              </>
            )}

            {/* Redirect section */}
            {redirectGroups.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: torquedGroups.length > 0 ? 8 : 0 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>
                    Redirections vendeur
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, background: "rgba(186,117,23,0.15)", color: "var(--warning)", padding: "2px 8px", borderRadius: 4 }}>
                    {redirectGroups.length} SITE{redirectGroups.length !== 1 ? "S" : ""}
                  </span>
                </div>
                {redirectGroups.map(([src, lines]) => (
                  <SellerGroup key={src} sourceKey={src} lines={lines} selected={selected} onToggle={toggleLine} onSwap={setSwapOpen} onRemove={removeLine} />
                ))}
              </>
            )}

            {/* Consolidation tip */}
            {redirectGroups.length > 0 && (
              <div className="card" style={{ padding: 16, borderLeft: "3px solid var(--coral)" }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Consolider les redirections ?</div>
                <div style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.5, marginBottom: 10 }}>
                  {redirectGroups.length} article{redirectGroups.length !== 1 ? "s" : ""} nécessite{redirectGroups.length === 1 ? "" : "nt"} une redirection vers un site tiers.
                  Des alternatives Torqued Checkout existent pour certaines références.
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--coral)" }}>
                  Voir les alternatives Torqued →
                </button>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="card" style={{ padding: 20, position: "sticky", top: 72 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Récapitulatif</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Sous-total pièces", val: `${allTotal.toFixed(2)} €` },
                { label: "Livraison estimée", val: allShipping === 0 ? "Offerte" : `${allShipping.toFixed(2)} €` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-mid)" }}>{r.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Total TTC</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>{(allTotal + allShipping).toFixed(2)} €</span>
              </div>
            </div>

            {torquedTotal > 0 && (
              <div style={{ marginBottom: 10, background: "var(--bg-warm)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-mid)" }}>Torqued Checkout</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{torquedTotal.toFixed(2)} €</span>
                </div>
                {redirectTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--ink-mid)" }}>Redirections ({redirectSelected.length})</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--warning)" }}>{redirectTotal.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            )}

            {torquedTotal > 0 && (
              <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Payer avec Torqued · {torquedTotal.toFixed(2)} €
              </button>
            )}
            {redirectTotal > 0 && (
              <button className="btn btn-ghost" style={{ width: "100%", padding: "10px", fontSize: 13, marginBottom: 4 }}>
                Continuer vers {redirectGroups.length} site{redirectGroups.length !== 1 ? "s" : ""} →
              </button>
            )}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", textAlign: "center", marginTop: 8 }}>
              {shipmentCount} colis · Prix TTC · comparateur affilié
            </div>
          </div>
        </div>
      </div>

      {/* Swap popover */}
      {swapLine && (
        <SwapPopover line={swapLine} onPick={id => pickOffer(swapLine.id, id)} onClose={() => setSwapOpen(null)} />
      )}
    </div>
  );
}
