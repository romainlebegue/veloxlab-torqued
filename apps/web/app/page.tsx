import { VehicleSearchBar } from "@/components/search/vehicle-search-bar";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-warm">

      {/* Header */}
      <header className="border-b border-DEFAULT bg-bg sticky top-0 z-10" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-5xl px-5 h-14 flex items-center gap-6">
          <Logo size={28} />
          <nav className="hidden sm:flex gap-5 ml-2">
            <a href="/marques/volkswagen" className="text-sm text-ink-light hover:text-ink transition-colors">Marques</a>
            <a href="/categories/disques-de-frein" className="text-sm text-ink-light hover:text-ink transition-colors">Catégories</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-10 text-center">
        <div className="mb-3">
          <span className="inline-block font-mono text-xs font-medium text-ink-light uppercase tracking-widest px-3 py-1 rounded-full bg-bg border" style={{ borderColor: "var(--border-mid)" }}>
            10 sources · FR DE UK ES
          </span>
        </div>
        <h1 className="font-sans font-semibold text-ink mb-4" style={{ fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Comparez les pièces auto<br />
          <span className="text-coral">au meilleur prix</span>
        </h1>
        <p className="text-ink-mid text-base mb-10">
          Neuf · Occasion · Recyclé certifié — Oscaro, AutoDoc, eBay, Mister Auto et plus
        </p>
        <VehicleSearchBar />
      </section>

      {/* Trust indicators */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-bg rounded-xl p-6 border" style={{ borderColor: "var(--border)" }}>
            <p className="font-sans font-semibold text-ink text-2xl" style={{ letterSpacing: "-0.02em" }}>10+</p>
            <p className="text-sm text-ink-light mt-1">Sources comparées</p>
          </div>
          <div className="bg-bg rounded-xl p-6 border" style={{ borderColor: "var(--border)" }}>
            <p className="font-mono font-medium text-coral text-xl tracking-widest">REC</p>
            <p className="text-sm text-ink-light mt-1">Label recyclé certifié</p>
          </div>
          <div className="bg-bg rounded-xl p-6 border" style={{ borderColor: "var(--border)" }}>
            <p className="text-2xl">🇫🇷 🇩🇪 🇬🇧 🇪🇸</p>
            <p className="text-sm text-ink-light mt-1">4 marchés européens</p>
          </div>
        </div>
      </section>

    </div>
  );
}
