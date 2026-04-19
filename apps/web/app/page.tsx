import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { VehicleSearchBar } from "@/components/search/vehicle-search-bar";

const POPULAR_VEHICLES = [
  { make: "volkswagen", model: "golf-7",        year: "2016", label: "Volkswagen Golf 7",      sub: "2016 · 12–48 pièces" },
  { make: "renault",    model: "clio-iv",        year: "2018", label: "Renault Clio IV",         sub: "2018 · 10–40 pièces" },
  { make: "peugeot",    model: "308-ii",         year: "2017", label: "Peugeot 308 II",          sub: "2017 · 15–52 pièces" },
  { make: "bmw",        model: "serie-3-f30",    year: "2015", label: "BMW Série 3 F30",         sub: "2015 · 18–60 pièces" },
  { make: "citroen",    model: "c3-iii",         year: "2019", label: "Citroën C3 III",          sub: "2019 · 10–38 pièces" },
  { make: "audi",       model: "a3-8v",          year: "2016", label: "Audi A3 8V",              sub: "2016 · 14–50 pièces" },
];

const CATEGORIES = [
  { slug: "disques-de-frein",      label: "Disques de frein",    icon: "disc" },
  { slug: "plaquettes-de-frein",   label: "Plaquettes",          icon: "pad" },
  { slug: "amortisseurs",          label: "Amortisseurs",        icon: "shock" },
  { slug: "filtres",               label: "Filtres",             icon: "filter" },
  { slug: "bougies",               label: "Bougies",             icon: "spark" },
  { slug: "courroie-distribution", label: "Courroie distrib.",   icon: "belt" },
  { slug: "batterie",              label: "Batterie",            icon: "battery" },
  { slug: "embrayage",             label: "Embrayage",           icon: "clutch" },
];

function CategoryIcon({ name }: { name: string }) {
  const sw = 1.4;
  const common = `w-5 h-5 text-ink-mid`;
  switch (name) {
    case "disc":    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>;
    case "pad":     return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M4 12h16"/></svg>;
    case "shock":   return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><path d="M10 3h4v4l2 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V9l2-2V3z"/><path d="M10 11h4M10 14h4"/></svg>;
    case "filter":  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case "spark":   return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><path d="M12 3v6M12 21v-4M4 12h4M21 12h-4M6 6l2.5 2.5M18 18l-2.5-2.5M6 18l2.5-2.5M18 6l-2.5 2.5"/></svg>;
    case "belt":    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="6"/><path d="M7 6v12M11 6v12M15 6v12M19 6v12"/></svg>;
    case "battery": return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 4v3M17 4v3M8 11v4M10 13h-4M16 11v4M18 13h-4"/></svg>;
    case "clutch":  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>;
    default:        return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"><circle cx="12" cy="12" r="9"/></svg>;
  }
}

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 24 }}>
          <Logo size={26} />
          <nav style={{ display: "flex", gap: 18, marginLeft: 8 }}>
            <a href="/marques/volkswagen" style={{ fontSize: 13, color: "var(--ink-mid)" }}>Marques</a>
            <a href="/categories/disques-de-frein" style={{ fontSize: 13, color: "var(--ink-mid)" }}>Catégories</a>
            <a href="/pro/nouveau-devis" style={{ fontSize: 13, color: "var(--ink-mid)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Pro
              <span style={{ fontFamily: "var(--font-mono)", background: "var(--ink)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>B2B</span>
            </a>
          </nav>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              <path d="M5 21V4h11l-2 4 2 4H5" />
            </svg>
            FR · EUR
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", paddingTop: 72, paddingBottom: 36, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--ink-light)",
            background: "var(--bg)", border: "0.5px solid var(--border-mid)",
            padding: "5px 12px", borderRadius: 999, display: "inline-block",
          }}>
            10 sources · FR · DE · UK · ES · LT
          </span>
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: "var(--ink)", marginBottom: 14, textWrap: "balance" } as React.CSSProperties}>
          Comparez les pièces auto<br />
          <span style={{ color: "var(--coral)" }}>au meilleur prix.</span>
        </h1>
        <p style={{ color: "var(--ink-mid)", fontSize: 17, marginBottom: 36, lineHeight: 1.5 }}>
          Neuf · Occasion · Recyclé certifié — Oscaro, AutoDoc, eBay, Mister Auto et plus.
        </p>
        <div style={{
          background: "var(--bg)", borderRadius: 16, border: "0.5px solid var(--border-mid)",
          boxShadow: "var(--shadow-lg)", textAlign: "left", overflow: "hidden",
        }}>
          <VehicleSearchBar />
        </div>
      </section>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Popular vehicles */}
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>
              Véhicules populaires cette semaine
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--coral)" }}>
              Voir tous →
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {POPULAR_VEHICLES.map((v, i) => (
              <Link
                key={i}
                href={`/pieces/${v.make}/${v.model}/${v.year}/disques-de-frein`}
                className="card"
                style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--bg-warm2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink-mid)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13l2-6h14l2 6v5h-3M3 13v5h3M3 13h18M6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{v.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)", marginTop: 2 }}>{v.sub}</div>
                </div>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink-light)" strokeWidth={1.6} strokeLinecap="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section style={{ marginTop: 40 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: 12 }}>
            Catégories
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
            {CATEGORIES.map(c => (
              <Link
                key={c.slug}
                href={`/pieces/volkswagen/golf-7/2016/${c.slug}`}
                className="card"
                style={{ padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }}
              >
                <CategoryIcon name={c.icon} />
                <span style={{ fontSize: 11, textAlign: "center", color: "var(--ink-mid)" }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Value props */}
        <section style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { icon: "shield", title: "Garantie jusqu'à 36 mois", sub: "Selon équipementier" },
            { icon: "truck",  title: "Livraison sous 24h",        sub: "Depuis 4 pays européens" },
            { icon: "leaf",   title: "Label REC certifié",        sub: "Traçabilité VIN + arrêté VHU" },
          ].map((v, i) => (
            <div key={i} className="card" style={{ padding: 18, display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--coral-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {v.icon === "shield" && <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth={1.6} strokeLinecap="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>}
                {v.icon === "truck" && <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth={1.6} strokeLinecap="round"><path d="M3 16V6h11v10M14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z"/></svg>}
                {v.icon === "leaf" && <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth={1.6} strokeLinecap="round"><path d="M4 20c0-9 6-15 16-15 0 10-6 16-16 16z"/><path d="M4 20c4-5 8-8 14-10"/></svg>}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{v.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)", marginTop: 2 }}>{v.sub}</div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid var(--border)", background: "var(--bg)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={20} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>torqued.veloxlab.co · 2026</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)" }}>
          Prix TTC · comparateur affilié · ADR-002
        </div>
      </footer>
    </div>
  );
}
